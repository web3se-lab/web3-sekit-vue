import axios from 'axios'

let URL = 'http://47.100.113.103'
if (process.env.NODE_ENV !== 'development') URL = 'http://47.100.113.103'

export default {
    async get(ctl, params) {
        return (await axios(`${URL}/${ctl}`, { params })).data
    },
    getObject(obj) {
        return JSON.parse(JSON.stringify(obj))
    },
    removeBlankLine(text) {
        return text.replace(/^\s*$(?:\r\n?|\n)/gm, '')
    },
    // support 10 layers { }
    getContracts(text) {
        text = this.hashStr(text)
        const reg =
            /(^|\s|)(contract|interface|library|abstract\s*contract)[^;{}]*{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{(?:[^{}]+|{[^{}]*})*})*})*})*})*})*})*})*})*}/gm
        const res = text.match(reg) || []
        for (const i in res) res[i] = this.hashStr(res[i].trim(), false)
        return res
    },
    // support 9 layers { }
    getFunctions(text) {
        text = this.hashStr(text)
        const reg =
            /(^|\s|)(function|event|modifier|constructor)[^{};]*({(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{(?:[^}{]+|{[^}{]*})*})*})*})*})*})*})*})*}|;)/gm
        const res = text.match(reg) || []
        for (const i in res) res[i] = this.hashStr(res[i].trim(), false)
        return res
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
        const word = this.nWord(functionCode, 1)
        return word
    }
}
