<template>
    <div class="index">
        <b-navbar toggleable="lg" type="light" variant="light" sticky>
            <b-navbar-brand href="#" class="logo">
                <img src="/logo-iict.png" alt="IICT" />
                <b>SmartIntentNN</b>
                <b-badge class="version" variant="danger">V1.1.0</b-badge>
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
                        <b-form-input v-model="key" class="search" placeholder="Id/Address" />
                        <b-button type="button" @click="loadData">Search In Dataset</b-button>
                    </b-nav-form>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>

        <!--upload modal-->
        <transition name="fade">
            <UploadModal v-if="showModal" @upload="predict" @close="showModal = false" />
        </transition>

        <!--predict modal-->
        <transition name="fade">
            <PredictModal
                v-if="contract.content"
                :id="contract.id"
                :content="contract.content"
                :address="contract.address"
                :type="contract.type"
                @close="contract.content = ''"
            />
        </transition>

        <div v-if="content" class="fullscreen">
            <div class="info text-center">
                <b-spinner
                    v-show="loading"
                    variant="primary"
                    type="grow"
                    label="Spinning"
                ></b-spinner>
                <p v-show="id && !loading">
                    DataSet Primary Key Id: <b>{{ id }}</b>
                </p>
                <p v-show="address && !loading">
                    Smart Contract Name: <b>{{ name }}</b>
                </p>
                <p v-show="address && !loading">
                    Contract Address: <b>{{ address }}</b>
                </p>
            </div>

            <div class="content">
                <div class="text-center">
                    <b-button-group>
                        <b-button variant="success" @click="tab = 0">Code 📜</b-button>
                        <b-button variant="primary" @click="tab = 1">CCTree 🌲</b-button>
                        <b-button variant="danger" @click="predict(null)">Predict 🚀</b-button>
                    </b-button-group>
                    <b-button variant="info" class="upload" block @click="showModal = true">
                        Detect My Smart Contract
                        <b-badge variant="danger">New!</b-badge>
                    </b-button>
                </div>

                <div v-if="tab === 0" class="tab-code">
                    <vue-code-highlight v-if="content" language="solidity">
                        <pre> {{ content }} </pre>
                    </vue-code-highlight>
                </div>

                <div v-if="tab === 1" class="tab-tree">
                    <h3>Code Tree</h3>
                    <v-chart class="chart" :option="option" />
                </div>
            </div>
        </div>

        <div v-if="!content && !loading" class="replace">
            404 NOT FOUND
            <br />
            TRY ANOTHER PK OR ADDRESS
        </div>

        <footer class="text-center footer">
            <p>
                Powered by
                <a href="https://www.tensorflow.org/js" target="_blank">Tensorflow.js</a>. Generated
                by <a href="https://gitlab.com/web3se/smartvue" target="_blank">Gitlab CI/CD</a>.
            </p>
            <p>
                © Institute of Intelligent Computing Technology, Suzhou, CAS. All Rights Reserved.
            </p>
        </footer>

        <div v-show="false">
            <vue-code-highlight
                v-for="(item, index) in tree"
                :key="index"
                :ref="item.key"
                language="solidity"
            >
                <pre style="margin: 0">{{ item.code }}</pre>
            </vue-code-highlight>
        </div>
    </div>
</template>

<script>
import { Promise } from 'bluebird'
import $ from '~/utils/tool'
import option from '~/utils/option'

export default {
    name: 'IndexPage',
    data() {
        return {
            tab: 0,
            loading: false,
            key: '1',
            id: 0,
            name: '',
            address: '',
            content: '',
            type: '',
            contract: {
                id: '',
                address: '',
                content: '',
                type: ''
            },
            showModal: false,
            tree: [],
            option: $.getObject(option)
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        async loadData() {
            try {
                this.loading = true
                this.id = ''
                this.address = ''
                this.content = ''
                this.option.series[0].data = []
                this.tree = []
                const res = await $.get('contract/get', { key: this.key })
                if (res) {
                    this.id = parseInt(res.Id)
                    this.type = res.CompilerVersion?.includes('vyper') ? 'vyper' : 'solidity'
                    this.address = res.ContractAddress
                    this.name = res.ContractName
                    this.content = $.multiContracts(res.SourceCode, this.type)
                    this.option.series[0].tooltip.padding = 0
                    this.option.series[0].tooltip.borderWidth = 0
                    // generate code tree
                    const getCodeMap = () => {
                        return new Promise(resolve => {
                            resolve($.getCodeMap($.clearCode(this.content, this.type)))
                        })
                    }
                    const tree = await getCodeMap().timeout(1000)
                    // generate code snippets template for charts
                    for (const i in tree)
                        for (const j in tree[i]) this.tree.push({ key: i + j, code: tree[i][j] })
                    this.option.series[0].data = this.getTree(tree, 1)
                }
            } catch (e) {
                console.error(e)
                this.$bvToast.toast(e.message, {
                    title: 'Error Query',
                    variant: 'danger',
                    solid: true
                })
            } finally {
                this.loading = false
            }
        },
        getTree(tree, type = 1) {
            const data = { name: this.name, children: [], itemStyle: { color: '#000' } }
            for (const i in tree) {
                const data2 = { name: i, children: [], collapsed: Object.keys(tree[i]).length > 15 }
                for (const j in tree[i])
                    data2.children.push({
                        name: type === 2 ? `${tree[i][j].type} ${tree[i][j].name || ''}` : j,
                        tooltip: {
                            position(point, params, dom, rect, size) {
                                if (type === 1) {
                                    const obj = { top: point[1] + 10 }
                                    obj[['left', 'right'][+(point[0] < size.viewSize[0] / 2)]] = 5
                                    return obj
                                }
                            },
                            formatter: () => {
                                if (type === 1) {
                                    const el = this.$refs[i + j][0]
                                    return el.$el.innerHTML
                                } else if (type === 2) {
                                    let str = ''
                                    for (const item of tree[i][j].inputs)
                                        str += `${item.type} ${item.name}, `
                                    return str
                                } else {
                                    return tree[i][j]
                                }
                            }
                        }
                    })
                data.children.push(data2)
            }
            return [data]
        },
        predict(content) {
            if (content) {
                // user upload
                this.contract.id = 0
                this.contract.address = ''
                this.contract.content = content
                this.contract.type = 'solidity'
            } else {
                // dataset
                this.contract.id = this.id
                this.contract.address = this.address
                this.contract.content = this.content
                this.contract.type = this.type
            }
        }
    }
}
</script>
<style scoped>
.fullscreen {
    min-height: 85vh;
}

h3 {
    font-size: 1.5rem;
    margin: 1rem 0;
}

.info,
.content {
    margin-top: 1rem;
}

.info p {
    margin: 0;
    padding: 0.1rem 0;
    font-size: 0.95rem;
}

.code {
    width: 100%;
    margin: 0 auto;
}

.tab-tree {
    margin: 0 auto;
    width: 95%;
    max-width: 800px;
    margin-top: 1rem;
}

.chart {
    width: 100%;
    max-width: 900px;
    height: 95vw;
    max-height: 800px;
    margin: 0 auto;
    border: solid 1px #ccc;
}

.search {
    width: 360px;
}

.code.opcode {
    white-space: inherit;
}

.tab-code {
    width: 95%;
    margin: 0 auto;
    margin-top: 1rem;
    font-size: 0.8rem;
    max-width: 1200px;
}

.title {
    font-size: 1rem;
    line-height: 1.2rem;
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

.logo img {
    height: 35px;
    margin-right: 10px;
}

.version {
    transform: scale(0.6);
    position: absolute;
    right: -30px;
    top: -6px;
}

.btn {
    font-size: 1rem;
}

.upload {
    width: 25rem;
    margin: 0 auto;
    margin-top: 1rem;
}

.replace {
    padding: 25vh 0;
    text-align: center;
    font-size: 3rem;
    color: #ccc;
}
</style>
<style>
.index .language-solidity {
    margin: 0 !important;
}
</style>
