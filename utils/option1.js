export default {
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
