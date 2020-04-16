<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Target customization
            </p>
            <v-tabs
                class='tabs elevation-2'
                :background-color='colors.primary'
                grow
                centered
                color='white'
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
                                Touch longer to cancel
                            </div>
                            <target-canvas
                                v-if='customTarget.base64Data'
                                class='target-canvas'
                                :src='customTarget.base64Data'
                                :hits=1
                                mark-center
                                :bullseye='customTarget.center'
                                :predefine-center='!!customTarget.center'
                                :imageStyle="{
                                    outlineWidth: 2 + 'px',
                                    outlineStyle: 'dashed',
                                    outlineColor: colors.neutral
                                }"
                                @hit='saveNewCenter'
                                @delete='clearCenter'
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
                                Select the distribution of values from the bullseye
                            </div>
                            <v-slider
                                v-model='customTarget.rings'
                                :min=1
                                :max=10
                                dense
                                ticks
                                thumb-label
                                label='Rings'
                                :color='colors.primaryDark'
                                :track-color='colors.primary'
                                :thumb-color='colors.neutral'
                            >
                                <template v-slot:thumb-label='{ value }'>{{ value }}</template>
                            </v-slider>
                            <v-slider
                                class='diam-slider'
                                v-model='customTarget.ringDiameter'
                                :min=8
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
                                v-if='customTarget.base64Data'
                                class='target-canvas'
                                :src='customTarget.base64Data'
                                :hits=1
                                read-only
                                :bullseye='customTarget.center'
                                :display-value-rings="{
                                    rings: customTarget.rings,
                                    diameter: customTarget.ringDiameter
                                }"
                                :imageStyle="{
                                    borderWidth: 2 + 'px',
                                    borderStyle: 'dashed',
                                    borderColor: colors.neutral
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
        computed: {
            ...mapGetters({
                colors: 'getColors',
                customTarget: 'getNewJournalUploadedTarget'
            })
        },
        watch: {
            ringsAmount(value) {
                this.$store.commit('setNewJournalUploadedTargetRingsAmount', value);
            },
            ringsDiameter(value) {
                this.$store.commit('setNewJournalUploadedTargetRingsDiameter', value);
            }
        },
        methods: {
            saveNewCenter: function(value) {
                let center = value.point;
                this.$store.commit('setNewJournalUploadedTargetCenter', center);
            },
            clearCenter: function() {
                this.$store.commit('setNewJournalUploadedTargetCenter', null);
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
    .tabs--active {
        color:aqua
    }
    .diam-slider {
        margin-top: -20px;
    }
</style>