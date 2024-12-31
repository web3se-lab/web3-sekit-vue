<template>
    <div class="modal">
        <div class="form">
            <button type="button" class="close" @click="close">
                <span aria-hidden="true">&times;</span>
            </button>
            <b-form-textarea
                v-model="text"
                class="text"
                placeholder="Copy the smart contract code here (Solidity)...✍️"
            ></b-form-textarea>
            <b-button-group class="btn-group">
                <b-button variant="warning" class="btn" size="lg" @click="upload(1)">
                    Detect by V1 🧐
                </b-button>
                <b-button variant="danger" class="btn" size="lg" @click="upload(2)">
                    Detect by V2 🧐 (Recommend)
                </b-button>
            </b-button-group>
        </div>
    </div>
</template>
<script>
export default {
    name: 'UploadModal',
    data() {
        return { text: '' }
    },
    methods: {
        upload(version) {
            this.$emit('upload', version, this.text)
        },
        close() {
            this.$emit('close')
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
.text {
    width: 80vw;
    max-width: 100rem;
    height: 70vh;
    background: #fff4d3;
    color: #000;
}
.form {
    position: relative;
}
.form .btn-group {
    margin: 0;
    padding: 0;
    margin-top: 1rem;
    width: 100%;
    display: block;
}
.form .btn-group .btn {
    width: 50%;
    float: left;
}
.close {
    color: #000;
    position: absolute;
    right: -2rem;
    top: -1.5rem;
    font-size: 2rem;
}
</style>
