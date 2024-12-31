<template>
    <div class="modal">
        <div class="box-bg">
            <button v-if="!loading" type="button" class="close" @click="close">
                <span aria-hidden="true">&times;</span>
            </button>
            <b-spinner v-else variant="primary" class="close" type="grow" label="Spinning" />
            <div ref="line" class="modal-box">
                <h1>SmartIntentNN V{{ version }}</h1>
                <h5>
                    Powered by Tensorflow.js, the deep neural network is running on your Browser!
                </h5>
                <hr />
                <p v-for="(item, index) in msgs" :key="index" v-html="item"></p>
                <p v-if="id">
                    <a target="_blank" :href="url + id">See the ground truth: {{ address }}</a>
                </p>
            </div>
        </div>
    </div>
</template>
<script>
import $ from '~/utils/tool'
import intent from '~/utils/type'

export default {
    name: 'PredictModal',
    props: {
        id: { type: Number, default: 0 },
        content: { type: String, default: '' },
        address: { type: String, default: '' },
        type: { type: String, default: 'solidity' },
        version: { type: Number, default: 2 }
    },
    data() {
        return {
            url: `${$.API}/data/intent?key=`,
            msgs: [],
            loading: false
        }
    },
    mounted() {
        if (this.version === 1) this.predict()
        else this.predict2()
    },
    methods: {
        msg(m) {
            this.msgs.push(m)
            this.$nextTick(_ => {
                const div = this.$refs.line
                div.scrollTop = div.scrollHeight
            })
        },
        close() {
            this.$emit('close')
        },
        padding(xs) {
            return xs.map(x => {
                while (x.length < 256) x.push(Array(768).fill(0.0))
                return x.slice(0, 256)
            })
        },
        highlight(res) {
            this.msg('Intent Highlight K-means model is loading...')
            this.msg(`Intent Highlight K-means is loaded, k=${$.kmeans.k}`)
            const xs = []
            for (const i in res) for (const j in res[i]) xs.push(res[i][j])
            while (xs.length < 256) xs.push(Array(512).fill(0.0))
            const tx = $.tf.tensor(xs)
            const ty = $.kmeans.predict(tx).distance.arraySync()
            this.msg(`Distances are predicted`)
            const data = []
            for (const i in xs) data.push({ vector: xs[i], distance: ty[i] })
            const xs2 = []
            for (const item of data)
                xs2.push(
                    item.distance < 0.21
                        ? item.vector
                        : $.tf.tensor(item.vector).mul($.tf.scalar(16)).arraySync()
                )

            this.msg(`Embeddings are scaled X16`)
            return xs2
        },
        async predict() {
            try {
                this.loading = true
                if (this.id) this.msg(`Dataset Id: ${this.id}`)
                if (this.address) this.msg(`Contract Address: ${this.address}`)
                this.msg('Start to predict intents in the smart contract...')

                this.msg('Embedding smart contract...')
                const res = await $.post('data/embedding', { text: this.content, type: this.type })
                this.msg('Smart Contract context is embedded!')

                const xs = this.highlight(res.Embedding)

                this.msg('BiLSTM-based DNN model is loading...')
                const model = await $.tf.loadLayersModel('use-high-bilstm-x16/model.json')
                this.msg('DNN model is predicting intents...')
                const ys = model.predict($.tf.tensor([xs])).arraySync()[0]
                this.msg('Intent has been predicted.')

                this.msg('============================================')
                for (const i in ys)
                    this.msg(
                        `${
                            ys[i] >= 0.5
                                ? '<span style="background: #dc3545;color: #fff;">'
                                : '<span style="color: #28a745;">'
                        }${intent[i]} ${ys[i]}${ys[i] >= 0.5 ? '</span>' : ''}`
                    )
                this.msg('============================================')
            } catch (e) {
                console.error(e)
                this.$bvToast.toast(e.message, {
                    title: 'Error predicting',
                    variant: 'danger',
                    solid: true
                })
            } finally {
                this.loading = false
            }
        },
        async predict2() {
            try {
                this.loading = true
                if (this.id) this.msg(`Dataset Id: ${this.id}`)
                if (this.address) this.msg(`Contract Address: ${this.address}`)
                this.msg('Start to predict intents in the smart contract...')

                this.msg('Embedding smart contract...')
                const res = await $.post('smartbert/embed', { code: this.content, pool: 'avg' })
                const xs = []
                Object.values(res).forEach(innerObj =>
                    Object.values(innerObj).forEach(value => xs.push(value))
                )
                this.msg('Smart Contract context is embedded by <b>SmartBERT</b> v2!')

                this.msg('BiLSTM-based DNN model is loading...')
                const model = await $.tf.loadGraphModel('smartbert-bilstm/model.json')
                this.msg('DNN model is predicting intents...')
                const ys = (
                    await model.executeAsync($.tf.tensor(this.padding([xs])))
                ).arraySync()[0]
                this.msg('Intent has been predicted.')

                this.msg('============================================')
                for (const i in ys)
                    this.msg(
                        `${
                            ys[i] >= 0.5
                                ? '<span style="background: #dc3545;color: #fff;">'
                                : '<span style="color: #28a745;">'
                        }${intent[i]} ${ys[i]}${ys[i] >= 0.5 ? '</span>' : ''}`
                    )
                this.msg('============================================')
            } catch (e) {
                console.error(e)
                this.$bvToast.toast(e.message, {
                    title: 'Error predicting',
                    variant: 'danger',
                    solid: true
                })
            } finally {
                this.loading = false
            }
        }
    }
}
</script>
<style scoped>
.modal {
    background: rgba(255, 255, 255, 0.3);
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1100;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(0.3rem);
}

.modal-box {
    height: 100%;
    width: 103%;
    overflow-y: scroll;
    color: #fff;
}

.box-bg {
    padding: 1rem;
    width: 70vw;
    max-width: 800px;
    min-width: 370px;
    border-radius: 1rem;
    height: 65vh;
    max-height: 500px;
    background: rgba(0, 0, 0, 0.8);
    position: relative;
}

.modal-box h1 {
    font-size: 2.5rem;
}

.modal-box h5 {
    color: #ffc107;
    font-size: 1.2rem;
}

.modal-box p {
    font-size: 1rem;
    line-height: 1.2rem;
}

.close {
    color: #fff;
    position: absolute;
    right: 15px;
    top: 10px;
}
</style>
