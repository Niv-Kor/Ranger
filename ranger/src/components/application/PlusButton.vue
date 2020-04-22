<template>
    <div>
        <v-btn
            class='plus'
            fab
            large
            elevation=8
            :style="{ backgroundImage: 'url(' + colors.gradient + ')' }"
            @click="$emit('click')"
        >
            <v-icon
                large
                color='white'
            >
                mdi-plus-thick
            </v-icon>
        </v-btn>
    </div>
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

<style scoped>
    .plus {
        position: absolute;
        margin: auto;
        left: 0;
        right: 0;
        bottom: 40px;
        background-size: 150px 100px;
    }
</style>