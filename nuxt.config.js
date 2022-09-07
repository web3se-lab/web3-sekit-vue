export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'Smart Intent',
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
                    'SmartIntentNN is a deep learning based tool for smart contract malicious intent detection!'
            },
            { name: 'format-detection', content: 'telephone=no' }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['~/static/css/style.css'],

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
