<template>
    <div class="evaluate">
        <h1 class="text-center">Evaluation</h1>
        <div class="settings">
            <h2>Experimental Settings</h2>
            <p>
                <span>Trained Dataset:</span>
                1, 10000
            </p>
            <p>
                <span>Evaluated Dataset:</span>
                20000, 10000
            </p>
            <p>
                <span>Trained batch:</span>
                Batches 100 | BatchSize 100 | Epoch 100
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
        </div>
        <h2>Result Charts</h2>
        <div v-show="loading" class="text-center">
            <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner>
        </div>
        <b-row>
            <b-col v-for="(item, index) in options" :key="index" lg="4" md="6">
                <h3>{{ item.chartTitle }}</h3>
                <v-chart class="chart" :option="options[index]" />
                <v-chart class="chart-r" :option="options2[index]" />
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
            options: [], // line charts
            options2: [] // radar charts
        }
    },
    mounted() {
        this.loadData()
    },
    methods: {
        async loadData() {
            try {
                this.loading = true
                const res = await $.get('data/evaluate')
                for (const i in res) {
                    const data = [['value', 'evaluation', 'num']]
                    for (const j in res[i].data) {
                        const all = res[i].data[j][res[i].data[j].length - 1]
                        data.push([all.accuracy, 'AC', parseInt(j) + 1])
                        data.push([all.precision, 'PR', parseInt(j) + 1])
                        data.push([all.recall, 'RE', parseInt(j) + 1])
                        data.push([all.F1, 'F1', parseInt(j) + 1])
                    }
                    this.addOption(res[i].title, data)
                    this.radar(res[i].data[res[i].data.length - 1])
                }
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    title: 'Error Evaluation Request',
                    variant: 'danger',
                    solid: true
                })
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
            this.options2.push(option)
        },
        addOption(title, data) {
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
                option.series = seriesList
                option.chartTitle = title
            })
            this.options.push(option)
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
}

.settings p {
    background: rgba(0, 0, 0, 0.1);
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
    border: solid 1px #ccc;
    margin-bottom: 20px;
}

.chart-r {
    width: 100%;
    height: 380px;
}
</style>
