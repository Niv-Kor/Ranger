<template>
    <v-btn
        class='plus'
        fab
        large
        elevation=8
        :color='colors.primary'
        @click="$emit('click')"
    >
        <v-icon color='white'>
            mdi-plus-thick
        </v-icon>
    </v-btn>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        }
    }
</script>

<style>
    .plus {
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        bottom: 25px;
    }
</style>