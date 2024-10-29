<template>
    <div class="evaluate">
        <h1 class="text-center">Evaluation</h1>
        <div class="settings">
            <h2>Experimental Settings</h2>
            <p>
                <span>Trained Dataset:</span>
                10,000 smart contracts
            </p>
            <p>
                <span>Evaluated Dataset:</span>
                10,000 smart contracts
            </p>
            <p>
                <span>Trained batch:</span>
                Batches 200 | BatchSize 50 | Epoch 100
            </p>
            <p>
                <span>Optimizer:</span>
                Adam
            </p>
            <p>
                <span>Loss:</span>
                binaryCrossentropy
            </p>
            <p>
                <span>Metrics:</span>
                Accuracy | Precision | Recall | F1
            </p>
            <p>
                <span>Encoder:</span>
                Universal Sentence Encoder
            </p>
            <p class="text-right">
                <b-button-group>
                    <b-button variant="success" :disabled="loading" @click="version = 0"
                        >Baselines</b-button
                    >
                    <b-button variant="warning" :disabled="loading" @click="version = 1"
                        >SmartIntentNN V1.0</b-button
                    >
                    <b-button variant="danger" :disabled="loading" @click="version = 2"
                        >SmartIntentNN V2.0</b-button
                    >
                </b-button-group>
            </p>
        </div>
        <h2>Result Charts</h2>
        <div v-show="loading" class="text-center">
            <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner>
        </div>
        <b-row>
            <b-col v-for="(item, index) in chart" :key="index" lg="4" md="6">
                <h3>{{ item.title }}</h3>
                <v-chart class="chart" :option="item.line" />
                <v-chart class="chart-r" :option="item.radar" />
            </b-col>
        </b-row>
    </div>
</template>

<script>
import { util } from 'echarts/core'
import $ from '~/utils/tool'
import option2 from '~/utils/option2'
import option3 from '~/utils/option3'

export default {
    name: 'EvaluatePage',
    data() {
        return {
            loading: false,
            chart: [],
            version: 0
        }
    },
    watch: {
        version: {
            immediate: true,
            async handler(v) {
                this.chart = []
                const max = 10

                for (let i = 0; i < max; i++) {
                    const data = await this.loadData(i, v)
                    if (!data) break
                    this.chart.push(data)
                }
            }
        }
    },
    methods: {
        async loadData(index, version) {
            try {
                this.loading = true
                const res = await $.get(`data/evaluate?index=${index}&version=${version}`)
                const data = [['value', 'evaluation', 'num']]
                for (const i in res.data) {
                    const all = res.data[i][res.data[i].length - 1]
                    data.push([all.accuracy, 'AC', parseInt(i) + 1])
                    data.push([all.precision, 'PR', parseInt(i) + 1])
                    data.push([all.recall, 'RE', parseInt(i) + 1])
                    data.push([all.F1, 'F1', parseInt(i) + 1])
                }
                const line = this.line(res.title, data)
                const radar = this.radar(res.data[res.data.length - 1])
                return { title: res.title, line, radar }
            } catch (e) {
                return null
            } finally {
                this.loading = false
            }
        },
        radar(data) {
            const f1 = []
            const ac = []
            const pr = []
            const re = []
            for (const i in data) {
                if (data[i].intent === 'all') break
                f1.push(data[i].F1)
                ac.push(data[i].accuracy)
                pr.push(data[i].precision)
                re.push(data[i].recall)
            }
            const option = $.getObject(option3)
            option.series[0].data[0].value = ac
            option.series[0].data[1].value = pr
            option.series[0].data[2].value = re
            option.series[0].data[3].value = f1
            return option
        },
        line(title, data) {
            const evaluates = ['AC', 'PR', 'RE', 'F1']
            const datasetWithFilters = []
            const seriesList = []
            const option = $.getObject(option2)
            util.each(evaluates, evaluate => {
                const datasetId = 'dataset_' + evaluate
                datasetWithFilters.push({
                    id: datasetId,
                    fromDatasetId: 'dataset_raw',
                    transform: {
                        type: 'filter',
                        config: {
                            and: [
                                { dimension: 'evaluation', '=': evaluate },
                                { dimension: 'num', gte: 1 },
                                { dimension: 'num', lte: 10000 }
                            ]
                        }
                    }
                })
                seriesList.push({
                    type: 'line',
                    datasetId,
                    showSymbol: false,
                    name: evaluate,
                    endLabel: {
                        show: true,
                        formatter: params => {
                            return params.value[1] + ': ' + params.value[0].toFixed(4)
                        }
                    },
                    labelLayout: {
                        moveOverlap: 'shiftY'
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    encode: {
                        x: 'num',
                        y: 'value',
                        label: ['evaluation', 'value'],
                        itemName: 'num',
                        tooltip: ['value']
                    }
                })
                option.dataset = [
                    {
                        id: 'dataset_raw',
                        source: data
                    },
                    ...datasetWithFilters
                ]
                option.yAxis = {
                    type: 'value',
                    max: 'dataMax',
                    min: value => {
                        return Math.floor(value.min * 10 - 1) / 10
                    },
                    axisLabel: {
                        formatter: value => {
                            return value.toFixed(1)
                        }
                    },
                    minInterval: 0.1
                }
                option.series = seriesList
                option.chartTitle = title
            })
            return option
        }
    }
}
</script>
<style scoped>
h1 {
    margin: 10px 0;
    font-size: 40px;
}

h2 {
    margin: 10px 0;
    font-size: 25px;
}

h3 {
    margin: 10px 0;
    font-size: 18px;
    text-align: center;
}

.settings p {
    padding: 5px;
    font-size: 15px;
    margin: 0;
}

.settings p span {
    font-weight: bold;
}

.evaluate {
    max-width: 95vw;
    margin: 0 auto;
}

.chart {
    width: 100%;
    height: 300px;
    margin: 0 auto;
    margin-bottom: 20px;
}

.chart-r {
    width: 100%;
    height: 380px;
}
</style>
