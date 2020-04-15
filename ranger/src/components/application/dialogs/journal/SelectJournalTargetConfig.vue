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
                class='elevation-1'
                grow
                centered
                :color='"white"'
                height=30
                show-arrows
                :slider-color='colors.primaryDark'
                @change='$forceUpdate()'
            >
                <!-- center tab -->
                <v-tab href='#center'>Center</v-tab>
                <v-tab-item value='center'>
                    <v-card
                        flat
                        tile
                        color='green lighten-5'
                    >
                        <v-container>
                            <div class='tab1-info main' align='center'>
                                Tap and drag to mark the bullseye of the target
                            </div>
                            <div class='tab1-info sub' align='center'>
                                Tap longer to cancel
                            </div>
                            <target-canvas
                                :src='customTarget.base64Data'
                                :hits=1
                                mark-center
                                @hit='saveNewCenter'
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
                        color='green lighten-5'
                    >
                        <v-container>
                            <div class='tab1-info main' align='center'>
                                Values distribution
                            </div>
                            <v-slider
                                v-model='circlesAmount'
                                :min=1
                                :max=20
                                dense
                                ticks
                                thumb-label
                                label='Circles'
                                :color='colors.primaryDark'
                                :track-color='colors.primary'
                                :thumb-color='colors.neutral'
                            >
                                <template v-slot:thumb-label='{ value }'>{{ value }}</template>
                            </v-slider>
                            <v-slider
                                v-model='circlesDiameter'
                                :min=5
                                :max=100
                                dense
                                thumb-label
                                label='Diameter'
                                :color='colors.primaryDark'
                                :track-color='colors.primary'
                                :thumb-color='colors.neutral'
                            >
                                <template v-slot:thumb-label='{ value }'>{{ value }}%</template>
                            </v-slider>
                            <target-canvas
                                :src='customTarget.base64Data'
                                :hits=1
                                mark-center
                                read-only
                                :bullseye='center'
                                :display-value-circles="{
                                    circles: circlesAmount,
                                    diameter: circlesDiameter
                                }"
                            />
                        </v-container>
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
                center: null,
                circlesAmount: 5,
                circlesDiameter: 20
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                customTarget: 'getNewJournalUploadedTarget'
            }),
        },
        methods: {
            saveNewCenter: function(value) {
                this.center = value.point;
                console.log('saved new center: ', this.center);
            }
        }
    }
</script>

<style scoped>
    .subtitle {
        font-family: 'comfortaa';
        margin-top: -10%;
    }
    .tab1-info {
        font-family: 'comfortaa';
        margin: 12px;
    }
    .tab1-info.main {
        font-weight: bold;
        font-size: 16px;
    }
    .tab1-info.sub {
        font-size: 14px;
    }
</style>