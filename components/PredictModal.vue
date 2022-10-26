<template>
    <div class="modal">
        <div class="box-bg">
            <button v-if="!loading" type="button" class="close" @click="close">
                <span aria-hidden="true">&times;</span>
            </button>
            <b-spinner v-else variant="primary" class="close" type="grow" label="Spinning" />
            <div ref="line" class="modal-box">
                <h1>Predict Smart Contract Intent</h1>
                <h5>Powered by Tensorflow.js, deep learning is running on your Browser!</h5>
                <br />
                <p v-for="(item, index) in msgs" :key="index" v-html="item"></p>
                <p>
                    <a target="_blank" :href="url + address">See the ground truth: {{ address }}</a>
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
        id: {
            type: Number,
            default: 0
        },
        content: {
            type: Object,
            default() {
                return null
            }
        },
        address: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            url: `${$.API}/data/sourceCodeRisk?key=`,
            msgs: [],
            loading: false
        }
    },
    mounted() {
        this.predict()
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
        async embed() {
            this.msg('===============Smart Contract Embed=================')
            this.msg('Embedding Smart Contracts...')
            const res = await $.get('code/embedding', { key: this.id })
            this.msg('Smart Contract context embedded!')
            return res
        },
        highlight(res) {
            this.msg('===============Intent Highlight=================')
            this.msg('Intent Highlight K-means model is loading...')
            this.msg(`Intent Highlight K-means is loaded...k=${$.kmeans.k}`)
            const xs = []
            for (const i in res) for (const j in res[i]) xs.push(res[i][j])
            const tx = $.tf.tensor(xs)
            const ty = $.kmeans.predict(tx).distance.arraySync()
            this.msg(`Distances are predicted`)
            const data = []
            for (const i in xs)
                data.push({
                    vector: xs[i],
                    distance: ty[i]
                })
            const xs2 = []
            for (const item of data) {
                xs2.push(
                    item.distance < 0.2
                        ? item.vector
                        : $.tf.tensor(item.vector).mul($.tf.scalar(2)).arraySync()
                )
            }
            this.msg(`Embeddings are scaled X2`)
            return xs2
        },
        async predict() {
            try {
                this.loading = true
                if (!this.content) this.msg(`Primary key: ${this.id}</br>Address: ${this.address}`)
                else this.msg('User manually submitted smart contact')
                this.msg('Start predicting...Please wait...')
                let res = null
                if (this.content) res = this.content
                else res = await this.embed()
                const xs = this.highlight(res)
                this.msg('=================DNN Predict=================')
                this.msg('DNN (with BiLSTM) model is loading...')
                const model = await $.tf.loadLayersModel('mymodel_bilstm_high_scale/model.json')
                this.msg('DNN model is predicting intents...')
                const ys = model.predict($.tf.tensor([xs])).arraySync()[0]
                this.msg('===============Intents Predicted================')
                for (const i in ys)
                    this.msg(
                        `${
                            ys[i] >= 0.5
                                ? '<span style="background: #dc3545;color: #fff;">'
                                : '<span style="color: #28a745;">'
                        }${intent[i]} ${ys[i]}${ys[i] >= 0.5 ? '</span>' : ''}`
                    )
                this.msg('===================END======================')
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
    z-index: 9999999;
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
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
