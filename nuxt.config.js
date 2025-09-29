export default {
    ssr: false,
    target: 'static',
    
    // GitHub Pages configuration for subdirectory deployment
    router: {
        base: process.env.NODE_ENV === 'production' ? '/web3-sekit-vue/' : '/'
    },
    
    head: {
        title: 'SmartIntentNN',
        htmlAttrs: { lang: 'en' },
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
                    'SmartIntentNN is a deep learning-based tool for smart contract intent detection!'
            },
            {
                hid: 'keywords',
                name: 'keywords',
                content:
                    'SmartIntentNN, Intent Detection, Smart Contract, Solidity, Blockchain, Web3, Software Engineering'
            }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: process.env.NODE_ENV === 'production' ? '/web3-sekit-vue/favicon.ico' : '/favicon.ico' }],
        script: [
            {
                id: 'clstr_globe',
                type: 'text/javascript',
                src: '//clustrmaps.com/globe.js?d=UY_-jJRCR9lywTyXlFelrQM3OC76c0mHDcLGFYOtkDU'
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
        '~/plugins/code-highlight'
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
        },
        // GitHub Pages public path configuration
        publicPath: process.env.NODE_ENV === 'production' ? '/web3-sekit-vue/_nuxt/' : '/_nuxt/'
    }
}
