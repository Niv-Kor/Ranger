<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Custom target configuration
            </p>
        </v-container>
        <v-container>
            <target-canvas
                :src='customTarget.url'
                :size=300
                :hits=1
            />
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import TargetCanvas from '../../../widgets/TargetCanvas';

    export default {
        components: {
            TargetCanvas
        },
        data() {
            return {
                center: { x: 0, y: 0 }
            }
        },
        created() {
            console.log('src: ', this.customTarget.url);
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                customTarget: 'getNewJournalUploadedTarget'
            }),
        },
    }
</script>

<style scoped>
    .subtitle {
        font-family: 'comfortaa';
    }
</style>