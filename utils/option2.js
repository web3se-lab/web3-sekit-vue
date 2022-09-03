export default {
    color: ['#56A3F1', '#14d742', '#FFE434', '#FF917C'],
    animationDuration: 8000,
    dataset: [
        {
            id: 'dataset_raw'
        }
    ],
    tooltip: {
        order: 'valueDesc',
        trigger: 'axis'
    },
    xAxis: {
        name: 'Amount',
        type: 'category'
    },
    yAxis: {
        max: 1,
        min: 0,
        name: 'Score'
    },
    grid: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 75
    }
}
