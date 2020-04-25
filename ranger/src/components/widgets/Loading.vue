<template>
    <transition name='fade' mode='in-out'>
        <div>
            <loading-overly
                :active.sync='$props.model'
                is-full-page
                loader='dots'
                :width=100
                :height=100
                :color='colors.secondary'
            />
        </div>
    </transition>
</template>

<script>
    import { mapGetters } from 'vuex';
    import LoadingOverly from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';

    export default {
        components: {
            LoadingOverly
        },
        props: {
            /**
             * The model according to which the loading screen is loaded.
             */
            model: {
                type: Boolean,
                required: true,
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        }
    }
</script>

<style scoped>
    .fade-enter {
        opacity: 0;
    }
    .fade-enter-active {
        transition: opacity .2s;
    }
    .fade-leave-active {
        transition: opacity .2s;
        opacity: 0;
    }
</style>