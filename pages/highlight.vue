<template>
    <div>
        <b-overlay :show="loading" rounded="sm">
            <div class="network-box">
                <vis-network
                    ref="network"
                    class="network"
                    :nodes="nodes"
                    :edges="edges"
                    :options="options"
                />
            </div>
            <div class="list">
                <h3>Rank List DESC</h3>
                <div class="content">
                    <div v-for="(item, index) in list" :key="index">
                        {{ item.fun }}
                    </div>
                </div>
            </div>
            <div class="tool">
                <h6>Highlight Predict</h6>
                <b-form-input v-model="key" placeholder="Search a key" @keyup.enter="loadData" />
                <b-form-select v-model="selected" :options="selects"></b-form-select>
                <b-row>
                    <b-col>
                        <b-form-radio v-model="smooth" :value="true">Smooth</b-form-radio>
                    </b-col>
                    <b-col>
                        <b-form-radio v-model="smooth" :value="false">Straight</b-form-radio>
                    </b-col>
                </b-row>
            </div>
        </b-overlay>
    </div>
</template>
<script>
import uniqolor from 'uniqolor'
import $ from '~/utils/tool'
import options from '~/utils/option1'
const DISTANCE = 0.21

export default {
    name: 'HighlightPage',
    data() {
        return {
            loading: false,
            key: '1',
            selected: 'repulsion',
            smooth: true,
            selects: [
                { value: 'barnesHut', text: 'barnesHut' },
                { value: 'forceAtlas2Based', text: 'forceAtlas2Based' },
                { value: 'repulsion', text: 'repulsion' },
                { value: 'hierarchicalRepulsion', text: 'hierarchicalRepulsion' }
            ],
            list: [],
            nodes: [],
            edges: [],
            options
        }
    },
    watch: {
        selected(v) {
            this.options.physics.solver = v
        },
        smooth(v) {
            if (v) {
                this.options.edges.smooth.roundness = 0.5
            } else {
                this.options.edges.smooth.type = 'continuous'
                this.options.edges.smooth.roundness = 0
            }
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        async loadData() {
            try {
                this.loading = true
                this.nodes = []
                this.edges = []
                const res = await $.post('contract/get', { key: this.key })
                const type = res.CompilerVersion.includes('vyper') ? 'vyper' : 'solidity'
                const data = await $.post('data/embedding', { text: res.SourceCode, type })
                const embed = data.Embedding

                const fun = []
                const map = {}
                for (const i in embed)
                    for (const j in embed[i]) {
                        fun.push(embed[i][j])
                        map[embed[i][j]] = `${i}/${j}`
                    }
                const xs = $.tf.tensor(fun)
                const ys = $.kmeans.predict(xs)
                let funObj = []
                for (const i in fun)
                    funObj.push({
                        fun: fun[i],
                        distance: ys.distance.arraySync()[i],
                        index: ys.index.arraySync()[i]
                    })
                funObj = funObj.sort((f1, f2) => f2.distance - f1.distance)
                funObj = funObj.map(item => {
                    item.fun = map[item.fun]
                    return item
                })

                this.list = funObj
                this.addCenters($.kmeans.k)
                this.addNodes(funObj)
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    title: 'Error Intent Highlight Predict',
                    variant: 'danger',
                    solid: true
                })
            } finally {
                this.loading = false
            }
        },
        addCenters(k) {
            for (let i = 0; i < k; i++)
                this.nodes.push({
                    id: i,
                    label: `k${i}`,
                    level: i + 1,
                    size: 12,
                    shape: 'hexagon',
                    color: uniqolor.random({
                        lightness: 60,
                        differencePoint: k
                    }).color
                })
        },
        addNodes(data) {
            for (const item of data) {
                const id = this.nodes.length
                const label = item.fun
                const high = item.distance > DISTANCE
                const shape = high ? 'star' : 'dot'
                const font = {
                    color: high ? '#fff' : '#000',
                    bold: high,
                    background: high ? '#dc3545' : 'none'
                }
                this.nodes.push({
                    id,
                    label,
                    color: this.nodes[item.index].color,
                    shape,
                    font
                })
                this.edges.push({
                    from: item.index,
                    to: id,
                    length: item.distance * 1000,
                    title: item.distance
                })
            }
        }
    }
}
</script>
<style>
.network-box {
    width: 100vw;
    height: 100vh;
}

.network {
    width: 100%;
    height: 100%;
}

.tool {
    position: fixed;
    z-index: 9;
    right: 1rem;
    bottom: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
}

.list {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 20rem;
    max-width: 250px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    margin: auto 0;
    padding: 10px;
}

.list h3 {
    font-size: 1.5rem;
}

.content {
    overflow: scroll;
    height: 93vh;
    width: 108%;
}

@media screen and (max-width: 900px) {
    .list {
        bottom: auto;
        top: 0;
        left: 0;
        right: 0;
        max-width: 100%;
        height: 150px;
        width: 100%;
    }

    .list h3 {
        display: none;
    }

    .content {
        height: 100%;
    }

    .tool {
        left: 1rem;
    }
}
</style>
