import axios from 'axios'
import * as TF from '@tensorflow/tfjs'
import KMeans from 'tf-kmeans-browser'
import kJson from '~/utils/kmeans-model.json'
kJson.distanceFunction = KMeans.cosineDistance

let URL = 'http://localhost:8081'
if (process.env.NODE_ENV !== 'development') URL = 'https://api.smart.cas-ll.cn'

export default {
    async get(ctl, params) {
        return (await axios(`${URL}/${ctl}`, { params })).data
    },
    async post(ctl, params) {
        return (await axios.post(`${URL}/${ctl}`, params)).data
    },
    getObject(obj) {
        return JSON.parse(JSON.stringify(obj))
    },
    // hash and unHash string with "", ''
    hashStr(text, flag = true) {
        if (flag) {
            const reg = /("[^"]*")|('[^']*')/g
            text = text.replace(reg, s => `"${btoa(unescape(encodeURIComponent(s)))}"`)
        } else {
            const reg = /"[^"]*"/g
            text = text.replace(reg, s => decodeURIComponent(escape(atob(s.slice(1).slice(0, -1)))))
        }
        return text
    },
    removeBlankLine(text) {
        return text.replace(/^\s*$(?:\r\n?|\n)/gm, '')
    },
    // remove version, comments or other redundant info from source code
    clearCode(code, type = 'solidity') {
        if (type === 'solidity') {
            // code = this.encodeStr(code)
            // remove comments
            code = code.replace(/\/\*[\s\S]*?\*\/|(?<!:)\/\/.*/gm, '')
            // remove import
            code = code.replace(/import[^;]*;/gm, '')
            // remove pragma
            code = code.replace(/pragma[^;]*;/gm, '')
            // code = this.decodeStr(code)
        } else if (type === 'vyper') {
            // remove comments
            code = code.replace(/(#.*$)|("""[\s\S]*?""")/gm, '')
            // remove import
            code = code.replace(/^from.*/gm, '')
            // remove implements
            code = code.replace(/^implements.*/gm, '')
        }
        return code.trim()
    },
    // support 10 layers { ... }
    getContracts(text) {
        text = this.encodeStr(text)
        const reg =
            /(^|\s|)(contract|interface|library|abstract\s*contract)[^;{}]*{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{[^{}]*})*})*})*})*})*})*})*})*})*}/gm
        const res = text.match(reg) || []
        for (const i in res) res[i] = this.decodeStr(res[i].trim())
        return res
    },
    // support 9 layers { ... }
    getFunctions(text) {
        text = this.encodeStr(text)
        const reg =
            /(^|\s|)(function|event|modifier|constructor)[^{};]*({(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{[^}{]*})*})*})*})*})*})*})*})*}|;)/gm
        const res = text.match(reg) || []
        for (const i in res) res[i] = this.decodeStr(res[i].trim())
        return res
    },
    // to encode string of '...', "..."
    encodeStr(text) {
        const reg = /("[^"]*")|('[^']*')/g
        return text.replace(reg, s => `"${this.encode(s)}"`)
    },
    // decode encoded base64 string
    decodeStr(text) {
        const reg = /"[^"]*"/g
        return text.replace(reg, s => this.decode(s.slice(1).slice(0, -1)))
    },
    encode(text) {
        return Buffer.from(text).toString('base64')
    },
    decode(text) {
        return Buffer.from(text, 'base64').toString('utf8')
    },
    // get first n words
    nWord(str, n) {
        if (typeof n === 'number') {
            const m = str.match(new RegExp('^(?:\\w+\\W+){' + n + '}(\\w+)'))
            return m && m[1]
        } else if (n.length) {
            const arr = []
            for (const i of n) arr.push(this.nWord(str, i))
            return arr
        }
    },
    getContractName(contractCode) {
        const words = this.nWord(contractCode, [0, 1, 2])
        if (words[0] === 'abstract') return words[2]
        else return words[1]
    },
    getFunctionName(functionCode) {
        const words = this.nWord(functionCode, [0, 1])
        if (words[0] === 'constructor') return words[0]
        else return words[1]
    },
    // merge multiple files
    multiContracts(content) {
        let sources = {}
        // multiple files
        if (content[0] === '{') {
            // json input sources
            if (content[1] === '{') sources = JSON.parse(content.slice(1).slice(0, -1)).sources
            else sources = JSON.parse(content)
        } else sources['contract.sol'] = { content } // single file
        // merge files
        let code = ``
        for (const i in sources) code += sources[i].content // merge
        return code
    },
    // Solidity->contracts->functions
    getCodeMap(sourceCode, type = 'solidity') {
        if (type === 'solidity') return this.getCodeMapSolidity(sourceCode)
        else if (type === 'vyper') return this.getCodeMapVyper(sourceCode)
    },
    getCodeMapSolidity(sourceCode) {
        const data = {}
        const contracts = this.getContracts(sourceCode)
        // contract level
        for (const item of contracts) {
            const contractName = this.getContractName(item)
            const functions = this.getFunctions(item)
            const func = {}
            // function level
            for (const item2 of functions) {
                const functionName = this.getFunctionName(item2)
                func[functionName] = this.removeBlankLine(item2)
            }
            data[contractName] = func
        }
        return data
    },
    // Vyper->defs/interfaces/events->content
    getCodeMapVyper(sourceCode) {
        // pad end of document, easy to regex
        sourceCode += `\n;`
        const data = {
            interfaces: {},
            functions: {},
            events: {}
        }
        // find all events
        const reg1 = /^event.*:[\s\S]*?(?=^\S)/gm
        const res1 = sourceCode.match(reg1)
        for (const i in res1) {
            const content = res1[i].trim()
            // extract event name
            const name = content.match(/(?<=(event\s+))[^(:]+/)[0].trim()
            data.events[name] = this.removeBlankLine(content)
        }
        // find all defs (functions)
        const reg2 = /^@[\s\S]*?^def[\s\S]*?(?=^\S)/gm
        const res2 = sourceCode.match(reg2)
        for (const i in res2) {
            const content = res2[i].trim()
            // extract fun name
            const name = content.match(/(?<=(def\s+))[^(:]+/)[0].trim()
            data.functions[name] = this.removeBlankLine(content)
        }
        // find all interfaces
        const reg3 = /^interface.*:[\s\S]*?(?=^\S)/gm
        const res3 = sourceCode.match(reg3)
        for (const i in res3) {
            const content = res3[i].trim()
            // interface name
            const name = content.match(/(?<=(interface\s+))[^(:]+/)[0].trim()
            data.interfaces[name] = this.removeBlankLine(content)
        }
        return data
    },
    kmeans: new KMeans(kJson),
    tf: TF,
    API: URL
}
