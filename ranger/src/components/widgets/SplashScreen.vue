<template>
    <div class='background-div'>
        <v-img
            class='logo animate__animated animate__fadeInDown animate__delay-2s animate__slow'
            contain
            :width=200
            aspect-ratio="1.5"
            src='../../assets/logos/icon.png'
        />
        <v-img
            class='logo animate__animated animate__fadeIn animate__delay-1s animate__slow'
            contain
            :width=300
            aspect-ratio="1.5"
            src='../../assets/logos/name_white.png'
        />
        <p
            class='credit animate__animated animate__fadeInUp animate__delay-2s animate__slow'
            align=center
        >
            By Niv Kor Ⓒ 2020
        </p>
    </div>
</template>

<script>
    import "animate.css";

    export default {
        props: {
            /**
             * Amount of time until the splash screen dissolves [milliseconds]
             */
            timer: {
                type: Number,
                required: false,
                default: 5000
            }
        },
        created() {
            //emit a message to the parent, indicating the time is up
            setTimeout(() => this.$emit('over'), this.$props.timer);
        }
    }
</script>

<style scoped>
    .background-div {
        background-color: #000000;
        height: 100%;
    }
    .logo {
        flex: 1 1 100%;
        bottom: 50%;
        top: 10%;
        margin: auto;
        padding: 24px;
        width: 100%;
        --animate-delay: 1s;
    }
    .credit {
        position: absolute;
        color: #ffffff;
        font-size: 12px;
        left: 0;
        right: 0;
        bottom: 10px;
    }
</style>