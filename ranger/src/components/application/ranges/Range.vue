<template>
    <div>
        <v-card
            class='end-details'
            :width='windowDim.width * .95'
            :height='windowDim.height * .1'
            elevation=0
        >   
            <v-row>
                <v-col cols=2>
                    <v-btn
                        class='meta-btn clear elevation-0'
                        fab
                        small
                        :color='colors.primary + "90"'
                        :disabled='scoreboard[selectedRound].length === 0'
                        @click='popWarning("Clear Round Hits", "Are your sure you want to remove every hit you made during this round?", clearRound)'
                    >
                        <i class='fas fa-eraser fa-lg' />
                    </v-btn>
                    <v-btn
                        class='meta-btn delete elevation-0'
                        fab
                        small
                        :color='colors.primary + "90"'
                        :disabled='selectedRound === 0'
                        @click='popWarning("Delete Round", "Are your sure you want to remove this round?<br>" +
                                           "Its score will be removed as well.", deleteRound)'
                    >
                        <i class='fas fa-trash fa-lg' />
                    </v-btn>
                </v-col>
                <v-col cols=10 class='end-details det-block'>
                    <p class='end-details det-title' align=center>
                        Round
                        <span :style='{ color: colors.primary, fontSize: 23 + "px" }'>
                            {{ selectedRound + 1 }}
                        </span>
                    </p>
                    <p class='end-details det-hits' align=center>
                        Hits : {{ scoreboard[selectedRound].length }}
                    </p>
                </v-col>
            </v-row>
        </v-card>
        <v-card
            class='target-card'
            :width='windowDim.width * .85'
            elevation=0
        >
            <target-canvas
                class='target'
                v-if='range'
                predefOnly
                :src='target.base64Data'
                :size='targetSize'
                :predef-hits='roundHits'
                :delete-trigger='deleteTrigger'
                @hit='recordHit'
                @delete='deleteHit'
            />
        </v-card>
        <v-card
            class='scoreboard-card'
            ref='scoreboard'
            :width='windowDim.width * .95'
            :height='windowDim.height * .22'
            elevation=0
        >
            <ul class='record-list'>
                <li
                    class='record-item'
                    v-for='(record, index) in scoreboard[selectedRound]'
                    :key='index'
                >
                    <v-card
                        class='record'
                        elevation=0
                        outlined
                        :color='record.color'
                        :style='recordItemStyle'
                    >
                        <p class='record-index' align=center>
                            {{ index + 1 }}
                        </p>
                        <p class='record-text' align=center>
                            {{ record.score }}
                        </p>
                    </v-card>
                </li>
            </ul>
        </v-card>
        <v-row
            class='score'
            no-gutters
        >
            <v-col cols=2>
                <v-btn
                    class='prev round-btn elevation-0'
                    fab
                    :disabled='selectedRound === 0'
                    :style='(selectedRound !== 0) ? { opacity: 1 } : { opacity: 0 }'
                    :color='colors.primary + "90"'
                    @click='prevRound'
                >
                    <i v-if='selectedRound > 0' class='fas fa-angle-double-left fa-2x' />
                </v-btn>
            </v-col>
            <v-col cols=3 :style='{ color: colors.primary }'>
                <p align=right>
                    {{ scoreboardSum }}
                </p>
            </v-col>
            <v-col cols=2 :style='{ color: "#00000060" }'>
                <p align=center>
                    /
                </p>
            </v-col>
            <v-col cols=3>
                <p align=left>
                    {{ scoreboardTotal }}
                </p>
            </v-col>
            <v-col cols=2>
                <v-btn
                    class='next round-btn elevation-0'
                    fab
                    :disabled='selectedRound === scoreboard.length - 1 && scoreboard[selectedRound].length === 0'
                    :color='colors.primary + "90"'
                    :style='nextButtonStyle'
                    @click='nextRound'
                >
                    <i
                        class="fas fa-plus fa-2x"
                        v-if='selectedRound === scoreboard.length - 1'
                        :style='(scoreboard[selectedRound].length === 0) ?
                            { color: "#00000030" } : { color: "#ffffff" }'
                    />
                    <i v-else class='fas fa-angle-double-right fa-2x' />
                </v-btn>
            </v-col>
        </v-row>
        <v-btn
            class='back-btn'
            block
            outlined
            :color='colors.neutral'
        >
            Back to Journal
        </v-btn>
        <warning-dialog
            :model='warningModel'
            :title='warningTitle'
            :message='warningMessage'
            :callback='warningCallback'
            @close='warningModel = false'
        />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import TargetCanvas from '../../widgets/TargetCanvas';
    import { windowDimMixin } from '../../../util/Mixins';
    import ColorsHandler from '../../../util/ColorsHandler';
    import WarningDialog from '../../widgets/WarningDialog';

    const MISS_LABEL = 'm';
    const RANGER_GRADIENT = require.context('../../../assets/', false, /\.png$/);

    export default {
        mixins: [
            windowDimMixin
        ],
        components: {
            TargetCanvas,
            WarningDialog
        },
        data() {
            return {
                scoreboard: [[]],
                deleteTrigger: [],
                touchedRecord: null,
                selectedRound: 0,
                warningModel: false,
                warningTitle: '',
                warningMessage: '',
                warningCallback: null
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
            },
            roundHits() {
                let records = this.scoreboard[this.selectedRound];
                let hits = [];

                for (let record of records) hits.push(record.hitData);
                return hits;
            },
            nextButtonStyle() {
                let lastRound = this.selectedRound === this.scoreboard.length - 1;
                let roundNotEmpty = this.scoreboard[this.selectedRound].length > 0;

                if (lastRound && roundNotEmpty) {
                    let img = RANGER_GRADIENT('./gradient.png');
                    return {
                        backgroundImage: 'url(' + img + ')',
                        backgroundSize: '150px 100px',
                        color: this.colors.secondary
                    };
                }
                else return null;
            },
            scoreboardSum() {
                return this.scoreboard.reduce((a, b) => {
                    return +a + b.reduce((c, d) => {
                        if (d.score !== MISS_LABEL) return +c + +d.score
                        else return +c;
                    }, 0);
                }, 0)
            },
            scoreboardTotal() {
                return this.scoreboard.reduce((a, b) => +a + b.length, 0) * 10;
            },
            recordItemStyle() {
                return {
                    width: '50px',
                    height: '50px'
                };
            }
        },
        updated() {
            //scroll scorboard to bottom
            if (this.$refs.scoreboard) {
                let scoreboard = this.$refs.scoreboard.$refs.link;
                let scrollHeight = scoreboard.scrollHeight;
                scoreboard.scrollTop = scrollHeight;
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

                //add hit to scoreboard
                this.scoreboard[this.selectedRound].push({
                    score,
                    color,
                    hitData: hit
                });
            },
            /**
             * Delete a hit from the scoreboard.
             * 
             * @param {Object} hit - {
             *                          {Number} index - The index of the hit (chronological order),
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
            deleteHit: function(hit) {
                console.log('here in delete for', hit.index)
                let scores = this.scoreboard[this.selectedRound];
                let recordIndex = -1;

                console.log('before records', scores);

                for (let i in scores) {
                    let record = scores[i];
                    if (record.hitData.index === hit.index) {
                        recordIndex = i;
                        break;
                    }
                }

                if (recordIndex !== -1) scores.splice(recordIndex, 1);

                console.log('after records', scores, '\n');
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

                return (score > 0) ? ('' + score) : MISS_LABEL;
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
                if (score == MISS_LABEL) return '#ffffff';
                else return ColorsHandler.lighten(highestScoreColor, (10 - score) * 5);
            },
            /**
             * Go to the previous round.
             */
            prevRound: function() {
                if (this.selectedRound > 0) this.selectedRound--;
            },
            /**
             * Go to the next round, or create a new one if it doesn't exist.
             */
            nextRound: function() {
                if (this.selectedRound >= this.scoreboard.length - 1) this.scoreboard.push([]);
                this.selectedRound++;
            },
            /**
             * Pop a warning dialog on the screen.
             * 
             * @param {String} msg - The message to display
             * @param {Function} agreementCallback - The function to call if the user click the ok button
             */
            popWarning: function(title, msg, agreementCallback) {
                this.warningTitle = title;
                this.warningMessage = msg;
                this.warningCallback = agreementCallback;
                this.warningModel = true;
            },
            /**
             * Clear all hits from the current round.
             */
            clearRound: function() {
                //delete hits from this component's display
                let roundHitsAmount = this.scoreboard[this.selectedRound].length;
                this.scoreboard[this.selectedRound].splice(0, roundHitsAmount);

                //init trigger array
                this.deleteTrigger.splice(0, this.deleteTrigger.length);

                //delete hits from target canvas' memory
                for (let hit of this.roundHits)
                    this.deleteTrigger.push(hit.index);
            },
            /**
             * Delete this current round.
             */
            deleteRound: function() {
                this.clearRound();
                this.scoreboard.splice(this.selectedRound--, 1);
            },
            f: function(record) {
                console.log('f:', record.hitData.index)
            },
            deleteHit1: function(hit) {
                let vm = this;
                let hit1 = hit;

                return function() {
                    console.log('fdfd');
                    vm.deleteHit(hit1);
                }
            }
        }
    }
</script>

<style scoped>
    .end-details.det-block {
        margin-left: -8%;
    }
    .end-details.det-title {
        font-size: 20px;
    }
    .end-details.det-hits {
        margin-top: -10px;
        font-size: 15px;
    }
    .target-card {
        margin: 20px 0 0 5%;
    }
    .scoreboard-card {
        overflow-x: auto;
        margin-top: 20px;
    }
    .record-list {
        list-style-type: none;
        margin-left: 7px;
    }
    .record-item {
        display: inline-block;
        margin: 3px;
        border-width: 1px;
        border-style: solid;
        border-color: #00000060;
        border-radius: 10%;
    }
    .record-index {
        position: absolute;
        font-size: 9px;
        margin-left: 2px;
        color: #00000090;
    }
    .record-text {
        padding-top: 12%;
        font-size: 27px;
    }
    .score {
        margin: 15px 0 0 0;
        font-size: 30px;
    }
    .round-btn {
        text-transform: none;
        margin-top: -8px;
    }
    .next.round-btn {
        position: absolute;
        right: 10px;
    }
    .fas {
        color: #ffffff;
    }
    .back-btn {
        text-transform: none;
        font-size: 18px;
    }
    .meta-btn {
        margin-top: -10px;
    }
    .meta-btn.delete {
        margin-top: 10px;
    }
</style>