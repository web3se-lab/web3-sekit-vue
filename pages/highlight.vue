<template>
    <div>
        <b-overlay :show="loading" rounded="sm">
            <div class="network-box">
                <network
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
                <b-form-input
                    v-model="keyword"
                    placeholder="Search a key"
                    @keyup.enter="loadData"
                />
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
const DISTANCE = 0.21
export default {
    name: 'HighlightPage',
    data() {
        return {
            loading: false,
            keyword: 1,
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
            options: {
                height: '100%',
                width: '100%',
                nodes: {
                    size: 8,
                    shape: 'dot',
                    font: {
                        size: 12,
                        face: 'TimesNewRoman'
                    }
                },
                edges: {
                    width: 1,
                    color: { inherit: 'from' },
                    smooth: {
                        type: 'dynamic',
                        roundness: 0.5
                    }
                },
                physics: {
                    enabled: true,
                    solver: 'repulsion',
                    forceAtlas2Based: {
                        gravitationalConstant: -1000,
                        centralGravity: 0.1,
                        avoidOverlap: 1
                    },
                    repulsion: {
                        nodeDistance: 100,
                        centralGravity: 0.1
                    }
                },
                autoResize: true,
                interaction: {
                    tooltipDelay: 200,
                    hideEdgesOnDrag: true,
                    hideEdgesOnZoom: true
                }
            }
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
                const res = await $.get('data/highPredict', { key: this.keyword })
                this.list = res.data
                this.addCenters(res.k)
                this.addNodes(res.data)
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    title: 'Error Predict Request',
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
    right: 10px;
    bottom: 10px;
    padding: 10px;
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
}
</style>
