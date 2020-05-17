<template>
    <div class='div-container'>
        <v-btn
            class='plus'
            fab
            large
            elevation=8
            :style="{ backgroundImage: 'url(' + colors.gradient + ')' }"
            @click="$emit('click')"
        >
            <fa-icon
                icon='plus'
                size='3x'
                color='#ffffff'
            />
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
        background-size: 150px 100px;
    }
</style>