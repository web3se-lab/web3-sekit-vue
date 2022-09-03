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
                { text: 'fee', max: 1 },
                { text: 'disableTrading', max: 1 },
                { text: 'blacklist', max: 1 },
                { text: 'reflect', max: 1 },
                { text: 'maxTX', max: 1 },
                { text: 'mint', max: 1 },
                { text: 'honeypot', max: 1 },
                { text: 'reward', max: 1 },
                { text: 'rebase', max: 1 },
                { text: 'maxSell', max: 1 }
            ],
            radius: '68%',
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
                    }
                },
                {
                    value: [],
                    symbol: 'diamond',
                    name: 'Precision',
                    lineStyle: {
                        width: 2
                    }
                },
                {
                    value: [],
                    symbol: 'triangle',
                    lineStyle: {
                        type: 'dashed',
                        width: 2
                    },
                    name: 'Recall'
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
                    }
                }
            ]
        }
    ]
}
