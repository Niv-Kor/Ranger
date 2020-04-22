<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Customize your target
            </p>
            <v-tabs
                class='tabs elevation-2'
                :background-color='colors.neutral'
                grow
                dark
                centered
                color='white'
                height=30
                show-arrows
                :slider-color='colors.secondary'
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
                                :display-value-rings="customTarget.center ? {
                                    rings: customTarget.rings,
                                    diameter: customTarget.ringDiameter
                                } : null"
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
            /**
             * Save the configured center of the target as the new center.
             * 
             * @param {Object} value - {
             *                            {Object} center - {
             *                                                 {Number} x - x coordinate
             *                                                 {Number} y - y coordinate
             *                                              }
             *                            {Number} distance - distance from the point to the center,
             *                            {Number} xDistance - x distance from the point to the center,
             *                            {Number} yDistance - y distance from the point to the center,
             *                            {Number} quarter - quarter relative to the center as in a coordinate system (1/2/3/4)
             *                         }
             */
            saveNewCenter: function(value) {
                let center = value.point;
                this.$store.commit('setNewJournalUploadedTargetCenter', center);
            },
            /**
             * Clear the previously saved center.
             */
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