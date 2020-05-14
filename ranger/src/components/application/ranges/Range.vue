<template>
    <div>
        <v-card
            class='target-card'
            :width='windowDim.width * .85'
            elevation=0
        >
            <target-canvas
                class='target'
                v-if='range'
                :src='target.base64Data'
                :size='targetSize'
                @hit='recordHit'
            />
        </v-card>
        <v-card
            class='score-card'
            :width='windowDim.width * .95'
        >
            <ul>
                <li
                    class='score-item'
                    v-for='(record, index) in scoreboard'
                    :key='index'
                >
                    <v-card
                        :color='record.color'
                    >
                        {{ record.score }}
                    </v-card>
                </li>
            </ul>
        </v-card>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import TargetCanvas from '../../widgets/TargetCanvas';
    import { windowDimMixin } from '../../../util/Mixins';
    import ColorsHandler from '../../../util/ColorsHandler';

    export default {
        mixins: [
            windowDimMixin
        ],
        components: {
            TargetCanvas
        },
        data() {
            return {
                scoreboard: []
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalIndex: 'getSelectedJournalIndex',
                journals: 'getAllJournals',
                targets: 'getAllTargets',
                ranges: 'getAllRanges',
                rangeIndex: 'getRangeIndex'
            }),
            journal() {
                return this.journals[this.journalIndex];
            },
            range() {
                let journalId = this.journal.id;
                return this.ranges[`journal #${journalId}`][this.rangeIndex];
            },
            target() {
                return this.targets.find(x => x.id === this.range.targetId);
            },
            targetSize() {
                return this.windowDim.width * .85;
            },
            targetData() {
                //convert percentage data to pixels
                let ringsRads = [];
                let diameterPx = this.target.ringDiameter * this.targetSize / 100;
                let bullseyePx = {
                    x: this.target.center.x * this.targetSize / 100,
                    y: this.target.center.y * this.targetSize / 100
                };

                for (let i  = 0; i < this.target.rings; i++) {
                    ringsRads.push((diameterPx / 2) * (i + 1));
                }

                return {
                    bullseye: bullseyePx,
                    ringsRads
                }
            }
        },
        methods: {
            /**
             * Add a new hit to the scoreboard.
             * 
             * @param {Object} hit - {
             *                          {Object} point - {
             *                                              {Number} x - x coordinate,
             *                                              {Number} y - y coordinate
             *                                           }
             *                          {Object} bullseyeData - {
             *                                                     {Number} distance - distance from the point to the center,
             *                                                     {Number} xDistance - x distance from the point to the center,
             *                                                     {Number} yDistance - y distance from the point to the center,
             *                                                     {Number} quarter - quarter relative to the center
             *                                                                        as in a coordinate system (1/2/3/4)
             *                                                  }
             *                       }
             */
            recordHit: function(hit) {
                let score = this.calculateScore(hit.bullseyeData.distance);
                let color = this.findScoreColor(score, this.colors.secondary);

                this.scoreboard.push({
                    score,
                    color
                })
            },
            /**
             * Calculate the score of a single hit.
             * 
             * @param {Number} dist - Distance of the hit from the target's bull'seye.
             * @returns {Number} The score of the hit.
             */
            calculateScore: function(dist) {
                let score = -1;
                let ringsRads = this.targetData.ringsRads;

                for (let i in ringsRads) {
                    let radius = ringsRads[i];
                    if (dist <= radius) {
                        score = 10 - i;
                        break;
                    }
                }

                return (score > 0) ? ('' + score) : 'miss';
            },
            /**
             * Find the most dominant color around a particular hit.
             * 
             * @param {Number} score - The score of the hit
             * @param {String} highestScoreColor - Hexadecimal representation of the color that needs to be used
             *                                     if the score is the highest possible.
             * @returns {String} Hexadecimal representation of the most dominant color in the hit area.
             */
            findScoreColor: function(score, highestScoreColor) {
                if (score == 'miss') return '#ffffff';
                else return ColorsHandler.lighten(highestScoreColor, (10 - score) * 5);
            }
        }
    }
</script>

<style scoped>
    .target-card {
        margin: 20px 0 0 5%;
    }
</style>