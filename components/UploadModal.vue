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
            <b-button variant="danger" class="btn" block size="lg" @click="upload">
                Detect 🧐
            </b-button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'UploadModal',
    data() {
        return {
            text: ''
        }
    },
    methods: {
        upload() {
            this.$emit('upload', this.text)
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
.btn {
    margin-top: 1rem;
}
.form {
    position: relative;
}
.close {
    color: #000;
    position: absolute;
    right: -2rem;
    top: -1.5rem;
    font-size: 2rem;
}
</style>
