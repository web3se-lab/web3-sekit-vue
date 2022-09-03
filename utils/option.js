export default {
    tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
    },
    toolbox: {
        show: true,
        feature: {
            saveAsImage: {}, // 导出图片
            restore: {},
            dataView: {},
            dataZoom: {},
            magicType: {},
            brush: {}
        }
    },
    series: [
        {
            type: 'tree',
            roam: true,
            data: [],
            top: '5%',
            bottom: '5%',
            left: '15%',
            right: '40%',
            // symbolSize: 10,
            itemStyle: {
                color: '#000'
            },
            lineStyle: {
                color: '#a8cdff',
                width: 1,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 3
            },
            // edgeShape: 'polyline',
            label: {
                position: 'left',
                verticalAlign: 'middle'
                // align: 'right'
                // fontSize: 18
            },
            leaves: {
                label: {
                    position: 'right',
                    verticalAlign: 'middle',
                    align: 'left'
                }
            }
        }
    ]
}
