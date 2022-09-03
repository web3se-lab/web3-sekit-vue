import Vue from 'vue'
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { ToolboxComponent, GridComponent, TooltipComponent } from 'echarts/components'

// import ECharts modules manually to reduce bundle size
import { CanvasRenderer } from 'echarts/renderers'
import { TreeChart } from 'echarts/charts'

use([CanvasRenderer, TreeChart, GridComponent, TooltipComponent, ToolboxComponent])

// register globally (or you can do it locally)
Vue.component('VChart', ECharts)
