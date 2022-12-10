export default {
    ssr: false,
    target: 'static',
    head: {
        title: 'SmartIntentNN',
        htmlAttrs: {
            lang: 'en'
        },
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
            },
            {
                hid: 'description',
                name: 'description',
                content:
                    'SmartIntentNN is a deep learning based tool for smart contract intent detection!'
            },
            {
                hid: 'keywords',
                name: 'keywords',
                content:
                    'SmartIntentNN, Intent Detection, Smart Contract, Binance Smart Chain, Blockchain, Web3, Software Engineering'
            }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
        script: [
            {
                src: 'https://hm.baidu.com/hm.js?42707839013393a203b9fe674617bc79'
            }
        ]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['~/static/css/style.css', '~/static/css/animation.css'],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        '~/plugins/echarts',
        '~/plugins/vis',
        '~/plugins/flexible',
        '~/plugins/code-highlight',
        '~plugins/ga.js'
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/eslint
        '@nuxtjs/eslint-module',
        '@nuxtjs/composition-api/module'
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/bootstrap
        'bootstrap-vue/nuxt'
    ],
    bootstrapVue: {
        icons: false,
        directives: false,
        // bootstrapVueCSS: false,
        componentPlugins: [
            'Navbar',
            'Badge',
            'Button',
            'Spinner',
            'FormInput',
            'ButtonGroup',
            'Layout',
            'Overlay',
            'FormRadio',
            'FormSelect',
            'FormTextarea',
            'ToastPlugin'
        ]
    },
    router: {
        base: '/smartvue'
    },
    build: {
        analyze: true,
        optimization: {
            splitChunks: {
                minSize: 10000,
                maxSize: 250000
            }
        },
        productionSourceMap: false,
        productionGzip: true,
        productionGzipExtensions: ['js', 'css', 'svg'],
        babel: {
            compact: true
        }
    }
}
