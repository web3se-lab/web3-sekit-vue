import * as echarts from 'echarts'
export default {
    color: ['#0094FF', '#51EA44', '#FFFF09', '#FF917C'],
    // color: ['#0094FF', '#14d742', '#FFE434', '#FF5252'],
    legend: {
        data: [
            { name: 'Accuracy', icon: 'rect' },
            { name: 'Precision', icon: 'diamond' },
            { name: 'Recall', icon: 'triangle' },
            { name: 'F1-score', icon: 'circle' }
        ]
    },
    radar: [
        {
            indicator: [
                { text: 'Fee', max: 1 },
                { text: 'DisableTrading', max: 1 },
                { text: 'Blacklist', max: 1 },
                { text: 'Reflect', max: 1 },
                { text: 'MaxTX', max: 1 },
                { text: 'Mint', max: 1 },
                { text: 'Honeypot', max: 1 },
                { text: 'Reward', max: 1 },
                { text: 'Rebase', max: 1 },
                { text: 'MaxSell', max: 1 }
            ],
            radius: '65%',
            splitNumber: 4,
            shape: 'circle',
            axisName: {
                color: '#080023'
            },
            splitArea: {
                areaStyle: {
                    color: ['#FFFFFF', '#EDECFF', '#DDDAFE', '#CCC9FE'],
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowBlur: 10
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(211, 253, 250, 0.8)',
                    width: 1
                }
            },
            splitLine: {
                show: false
            }
        }
    ],
    series: [
        {
            type: 'radar',
            data: [
                {
                    value: [],
                    symbol: 'rect',
                    name: 'Accuracy',
                    lineStyle: {
                        width: 2
                    },
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: params => `${params.value}`
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: params =>
                            `${params.seriesName}<br/>${params.name}: ${params.value}`
                    }
                },
                {
                    value: [],
                    symbol: 'diamond',
                    name: 'Precision',
                    lineStyle: {
                        width: 2
                    },
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: params => `${params.value}`
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: params =>
                            `${params.seriesName}<br/>${params.name}: ${params.value}`
                    }
                },
                {
                    value: [],
                    symbol: 'triangle',
                    lineStyle: {
                        type: 'dashed',
                        width: 2
                    },
                    name: 'Recall',
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: params => `${params.value}`
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: params =>
                            `${params.seriesName}<br/>${params.name}: ${params.value}`
                    }
                },
                {
                    value: [],
                    name: 'F1-score',
                    lineStyle: {
                        type: 'dotted',
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                            {
                                color: 'rgba(255, 145, 124, 0.1)',
                                offset: 0
                            },
                            {
                                color: 'rgba(255, 145, 124, 0.9)',
                                offset: 1
                            }
                        ])
                    },
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true,
                            formatter: params => `${params.value}`
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: params =>
                            `${params.seriesName}<br/>${params.name}: ${params.value}`
                    }
                }
            ]
        }
    ]
}
