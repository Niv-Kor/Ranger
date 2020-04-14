<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Custom target configuration
            </p>
            <v-tabs
                :background-color='colors.primary'
                class='elevation-3'
                grow
                centered
                :color='"white"'
                show-arrows
                :slider-color='colors.primaryDark'
            >
                <!-- center tab -->
                <v-tab href='#center'>Center</v-tab>
                <v-tab-item value='center'>
                    <v-card
                        flat
                        tile
                    >
                        <v-container>
                            <target-canvas
                                :src='customTarget.base64Data'
                                :hits=1
                                mark-center
                            />
                        </v-container>
                    </v-card>
                </v-tab-item>

                <!-- values tab -->
                <v-tab href='#values'>Values</v-tab>
                <v-tab-item value='values'>
                    <v-card
                        flat
                        tile
                    >
                        
                    </v-card>
                </v-tab-item>
            </v-tabs>
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
        margin-top: -10%;
    }
</style>