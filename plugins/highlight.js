import Vue from 'vue'
import hljs from 'highlight.js'
import Highlight from 'highlight-vue'
import solidity from 'highlightjs-solidity'
import 'highlight.js/styles/github.css'

solidity(hljs)

Vue.use(Highlight)
