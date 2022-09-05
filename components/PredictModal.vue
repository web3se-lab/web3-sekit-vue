<template>
    <transition name="fade">
        <div class="predict-modal">
            <div class="box-bg">
                <button type="button" class="close" @click="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div ref="line" class="modal-box">
                    <h1>Predict Smart Contract Intent</h1>
                    <h5>Powered by Tensorflow.js, deep learning is running on your Browser!</h5>
                    <br />
                    <p v-for="(item, index) in msgs" :key="index" v-html="item"></p>
                    <p>
                        <a target="_blank" :href="url + address"
                            >See the ground truth: {{ address }}</a
                        >
                    </p>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import KMeans from 'tf-kmeans-browser'
import * as tf from '@tensorflow/tfjs'
import $ from '~/utils/tool'
import intent from '~/utils/type'

export default {
    name: 'PredictModal',
    props: {
        status: {
            type: Boolean,
            default: false
        },
        id: {
            type: Number,
            default: 0
        },
        address: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            url: `${$.API}/data/sourceCodeRisk?key=`,
            msgs: []
        }
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                this.msgs = []
                if (this.status) this.predict()
            }
        },
        status: {
            immediate: true,
            handler() {
                this.msgs = []
                if (this.status) this.predict()
            }
        }
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
        predict() {
            this.msg(
                `Primary key: ${this.id}</br>Address: ${this.address}</br>...Start predicting...`
            )
            this.msg('===============Context Embed=================')
            this.msg('Embedding Smart Contracts First...')
            $.get('code/embedding', { key: this.id })
                .then(res => {
                    if (!this.status) throw new Error('User manually stops predicting!')
                    this.msg('Smart Contract context embedded...')
                    return res
                })
                .then(async res => {
                    this.msg('===============Intent Highlight=================')
                    this.msg('Intent Highlight K-means model is loading...')
                    let kmeans = localStorage.getItem('kmeans')
                    if (!kmeans) {
                        kmeans = await $.get('code/kmeans')
                        localStorage.setItem('kmeans', JSON.stringify(kmeans))
                    } else kmeans = JSON.parse(kmeans)
                    kmeans.distanceFunction = KMeans.cosineDistance
                    kmeans = new KMeans(kmeans)
                    this.msg(`Intent Highlight K-means is loaded...k=${kmeans.k}`)
                    const xs = []
                    for (const i in res) for (const j in res[i]) xs.push(res[i][j])
                    const tx = tf.tensor(xs)
                    const ty = kmeans.predict(tx).distance.arraySync()
                    this.msg(`Distances are predicted`)
                    const data = []
                    for (const i in xs)
                        data.push({
                            vector: xs[i],
                            distance: ty[i]
                        })
                    return data
                })
                .then(data => {
                    const xs = []
                    for (const item of data) {
                        xs.push(
                            item.distance < 0.2
                                ? item.vector
                                : tf.tensor(item.vector).mul(tf.scalar(2)).arraySync()
                        )
                    }
                    this.msg(`Embeddings are scaled X2`)
                    return xs
                })
                .then(async xs => {
                    this.msg('=================DNN Predict==================')
                    this.msg('DNN (with BiLSTM) model is loading...')
                    const model = await tf.loadLayersModel('mymodel_bilstm_high_scale/model.json')
                    this.msg('DNN model is predicting intents...')
                    const ys = model.predict(tf.tensor([xs])).arraySync()[0]
                    this.msg('==================Intents Predicted==================')
                    for (const i in ys)
                        this.msg(
                            `${
                                ys[i] >= 0.5
                                    ? '<span style="background: #dc3545;color: #fff;">'
                                    : '<span style="color: #28a745;">'
                            }${intent[i]} ${ys[i]}${ys[i] >= 0.5 ? '</span>' : ''}`
                        )
                    this.msg('=====================END========================')
                })
                .catch(e => {
                    console.error(e)
                    this.$bvToast.toast(e.message, {
                        title: 'Error predicting',
                        variant: 'danger',
                        solid: true
                    })
                })
        }
    }
}
</script>
<style scoped>
.predict-modal {
    background: rgba(255, 255, 255, 0.3);
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(0.3rem);
}
.modal-box {
    height: 100%;
    width: 105.5%;
    overflow-y: scroll;
    color: #fff;
}
.box-bg {
    padding: 30px;
    width: 70%;
    max-width: 800px;
    min-width: 370px;
    border-radius: 1rem;
    height: 500px;
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
.close span {
    color: #fff;
    font-size: 40px;
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
