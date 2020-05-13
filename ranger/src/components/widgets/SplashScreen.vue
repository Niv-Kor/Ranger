<template>
    <div class='background-div'>
        <v-img
            class='logo icon'
            contain
            :width=200
            aspect-ratio='1.5'
            src='../../assets/logos/icon.png'
        />
        <v-img
            class='logo name'
            contain
            :width=300
            aspect-ratio='1.5'
            src='../../assets/logos/name_white.png'
        />
        <p
            class='credit'
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
    }
    .logo.icon {
        animation: fade-down-rotate;
        animation-duration: 2s;
        animation-delay: 2s;
        animation-fill-mode: both;
    }
    .logo.name {
        animation: fadeIn;
        animation-duration: 2s;
        animation-delay: 1s;
        animation-fill-mode: both;
    }
    .rotator {
        animation: rotate;
        animation-duration: 2s;
        animation-delay: 0s;
        animation-fill-mode: both;
    }
    .credit {
        position: absolute;
        color: #ffffff;
        font-size: 12px;
        left: 0;
        right: 0;
        bottom: 10px;
        animation: fadeInUp;
        animation-duration: 2s;
        animation-delay: 2s;
        animation-fill-mode: both;
    }
    @keyframes fade-down-rotate {
        from {
            opacity: 0;
            transform: translate3d(0, -100px, 0) rotate(0deg);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(20deg);
        }
    }
</style>