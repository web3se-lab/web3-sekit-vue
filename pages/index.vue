<template>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="primary" sticky>
            <b-navbar-brand href="#" class="logo">
                SmartIntentNN
                <b-badge class="version" variant="danger">Alpha v0.1</b-badge>
            </b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item active>Home</b-nav-item>
                    <b-nav-item href="highlight">Highlight</b-nav-item>
                    <b-nav-item href="evaluate">Evaluation</b-nav-item>
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-form @submit.prevent="loadData">
                        <b-form-input
                            v-model="keyword"
                            class="search"
                            placeholder="Id/Address"
                            size="sm"
                        />
                        <b-button type="button" size="sm" @click="loadData">Search</b-button>
                    </b-nav-form>

                    <b-nav-item-dropdown text="Lang" right>
                        <b-dropdown-item href="#">EN</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <div class="fullscreen">
            <div v-show="id && address" class="info text-center">
                <p>
                    Smart Contract ID: <b>{{ id }}</b>
                </p>
                <p>
                    Smart Contract Address: <b>{{ address }}</b>
                </p>
            </div>
            <div v-if="sourceCode" class="source-code">
                <PredictModal
                    v-show="showModal"
                    :id="id"
                    :address="address"
                    :status="showModal"
                    @close="showModal = false"
                />
                <div class="text-center">
                    <b-button-group>
                        <b-button variant="success" @click="tab = 0">Context 📜</b-button>
                        <b-button variant="primary" @click="tab = 1">CCTree 🌲</b-button>
                        <b-button variant="warning" @click="tab = 2">OpCode 🔧</b-button>
                        <b-button variant="danger" @click="showModal = true">Predict 👍</b-button>
                    </b-button-group>
                </div>
                <div v-if="tab === 0">
                    <div v-for="(item, index) in sourceCode" :key="index" class="source-code">
                        <h3>{{ index }}</h3>
                        <vue-code-highlight language="solidity">
                            <pre> {{ item }} </pre>
                        </vue-code-highlight>
                    </div>
                </div>
                <div v-if="tab === 1">
                    <h3>SolCodeTree</h3>
                    <v-chart class="chart" :option="option3" />
                    <h3>ABI Tree</h3>
                    <v-chart class="chart" :option="option1" />
                    <h3>MethodIdentifiers Tree</h3>
                    <v-chart class="chart" :option="option2" />
                </div>
                <div v-if="tab === 2">
                    <div v-for="(item, index) in opCode" :key="index" class="source-code">
                        <h3>{{ index }}</h3>
                        <p>{{ item }}</p>
                    </div>
                </div>
            </div>
        </div>
        <footer class="text-center footer">
            Powered by <a href="https://www.tensorflow.org/js" target="_blank">Tensorflow.js</a>
        </footer>
    </div>
</template>

<script>
import { component as VueCodeHighlight } from 'vue-code-highlight'
import 'prismjs/themes/prism-okaidia.css'
import 'prismjs/components/prism-solidity'
import $ from '~/utils/tool'
import option from '~/utils/option'

const COLOR1 = '#007bff'
const COLOR2 = '#ffc107'
const COLOR3 = '#28a745'
const COLOR4 = '#17a2b8'
const COLOR5 = '#dc3545'

export default {
    name: 'IndexPage',
    components: {
        VueCodeHighlight
    },
    data() {
        return {
            tab: 0,
            id: '',
            address: '',
            keyword: '1',
            showModal: false,
            sourceCode: null,
            opCode: null,
            tree: '',
            option1: $.getObject(option),
            option2: $.getObject(option),
            option3: $.getObject(option)
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        async loadData() {
            try {
                const res = await $.get('code/get', { key: this.keyword })
                if (res) {
                    this.id = res.Id
                    this.address = res.ContractAddress
                    this.sourceCode = this.getContractMap(res.SourceCode)
                    this.opCode = JSON.parse(res.OpCode)
                    // handle trees
                    const json1 = JSON.parse(res.ABI)
                    const json2 = JSON.parse(res.MethodIdentifiers)
                    const json3 = JSON.parse(res.SourceCodeMap)
                    this.option1.series[0].data = this.getTree1(json1)
                    this.option2.series[0].data = this.getTree2(json2)
                    this.option3.series[0].data = this.getTree3(json3)
                } else {
                    this.sourceCode = null
                    this.opCode = []
                    this.abi = []
                }
            } catch (e) {
                this.id = ''
                this.sourceCode = null
                this.address = ''
                this.opCode = null
            }
        },
        getContractMap(sourceCode) {
            const contracts = $.getContracts(sourceCode)
            const data = {}
            for (const item of contracts) {
                const word = $.getContractName(item)
                data[word] = item
            }
            return data
        },
        // ABI
        getTree1(abi) {
            const data = { name: 'Smart Contract', children: [], itemStyle: { color: COLOR1 } }
            for (const i in abi) {
                const data2 = { name: i, children: [], itemStyle: { color: COLOR2 } }
                for (const item of abi[i]) {
                    const data3 = {
                        name: item.name || item.type,
                        children: [],
                        itemStyle: { color: COLOR3 }
                    }
                    if (item.type === 'constructor') data3.itemStyle = { color: COLOR5 }
                    data3.children = item.inputs
                    for (const j in item.inputs) {
                        item.inputs[j].itemStyle = { color: COLOR4 }
                        item.inputs[j].label = {
                            formatter: `${item.inputs[j].name}(${item.inputs[j].type})`
                        }
                    }
                    data2.children.push(data3)
                }
                data.children.push(data2)
            }
            return [data]
        },
        // MethodIdentifiers
        getTree2(methods) {
            const data = { name: 'Smart Contract', children: [], itemStyle: { color: '#000' } }
            for (const i in methods) {
                const data2 = { name: i, children: [] }
                for (const j in methods[i])
                    data2.children.push({
                        name: j,
                        tooltip: {
                            formatter() {
                                return methods[i][j]
                            }
                        }
                    })
                data.children.push(data2)
            }
            return [data]
        },
        // SolCodeTree
        getTree3(map) {
            const label = {
                align: 'center',
                verticalAlign: 'bottom',
                offset: [0, -15]
            }
            const data = {
                name: 'Smart Contract',
                children: [],
                itemStyle: { color: '#000' }
            }
            for (const i in map) {
                const data2 = {
                    name: i,
                    children: [],
                    label
                }
                for (const j in map[i]) {
                    const tooltip = {
                        position(point, params, dom, rect, size) {
                            const obj = { top: point[1] + 10 }
                            obj[['left', 'right'][+(point[0] < size.viewSize[0] / 2)]] = 5
                            return obj
                        },
                        formatter() {
                            return `<pre>${map[i][j]}</pre>`
                        }
                    }
                    data2.children.push({ name: j, tooltip })
                }
                data.children.push(data2)
            }
            return [data]
        }
    }
}
</script>
<style scoped>
.fullscreen {
    margin-top: 20px;
    min-height: 90vh;
}
h3 {
    font-size: 25px;
    line-height: 40px;
}
.code {
    width: 100%;
    margin: 0 auto;
}
.chart {
    width: 100%;
    height: 800px;
    margin-bottom: 20px;
    border: solid 1px #ccc;
}
.search {
    width: 360px;
}
.code.opcode {
    white-space: inherit;
}
.source-code {
    width: 90%;
    margin: 0 auto;
    margin-top: 10px;
}
.title {
    font-size: 20px;
    line-height: 40px;
}
.form {
    padding: 50px 20px 20px 20px;
    display: flex;
    justify-items: center;
    align-content: center;
}
.footer {
    padding: 20px 0;
}
.logo {
    position: relative;
}
.version {
    transform: scale(0.65);
    position: absolute;
    right: -50px;
    top: -5px;
}
</style>
