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
                        v-if='scoreboard[selectedRound][selectedRecord]'
                        class='meta-btn remove elevation-0'
                        fab
                        small
                        :color='colors.secondary'
                        @click='deleteHit(scoreboard[selectedRound][selectedRecord].hitData)'
                    >
                        <i class='fas fa-times fa-2x' />
                    </v-btn>
                </v-col>
                <v-col cols=8 class='end-details det-block'>
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
                <v-col cols=2>
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
                :select-hit='selectedHitIndex'
                :start-index='hitStartIndex'
                @hit='recordHit($event, selectedRound)'
                @delete='deleteHit'
                @touch='onHitTouch'
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
                        :style='createRecordItemStyle(index)'
                        @click='selectedRecord = index'
                    >
                        <p class='record-index' align=center>
                            {{ index + 1 }}
                        </p>
                        <p
                            class='record-text'
                            align=center
                            :style='createRecordScoreStyle(index)'
                        >
                            {{ (record.score > 0) ? record.score : 'm' }}
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

    const ASSETS_CONTEXT = require.context('../../../assets/', true, /\.png$/);

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
                selectedRecord: 0,
                selectedRound: 0,
                hitStartIndex: -1,
                recordAdded: false,
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
            selectedHitIndex() {
                let scores = this.scoreboard[this.selectedRound];
                let record = scores[this.selectedRecord];
                return record ? record.hitData.index : -1;
            },
            nextButtonStyle() {
                let lastRound = this.selectedRound === this.scoreboard.length - 1;
                let roundNotEmpty = this.scoreboard[this.selectedRound].length > 0;

                if (lastRound && roundNotEmpty) {
                    let img = ASSETS_CONTEXT('./gradient.png');
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
                    return +a + b.reduce((c, d) => +c + +d.score, 0)
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
        created() {
            //load previous hits from database
            for (let i in this.range.rounds) {
                if (i != 0) this.nextRound();
                let round = this.range.rounds[i];

                for (let hit of round) {
                    //save as largest index so far
                    if (hit.hitId > this.hitStartIndex) this.hitStartIndex = hit.hitId;
                    this.recordHit(hit, i, true, hit.score);
                }
            }

            this.hitStartIndex++;
        },
        destroyed() {
            this.$store.dispatch('reloadRangeHits', {
                rangeId: this.range.id,
                rangeIndex: this.rangeIndex,
                journalId: this.journal.id
            });
        },
        updated() {
            //scroll scorboard to bottom
            if (this.recordAdded && this.$refs.scoreboard) {
                let scoreboard = this.$refs.scoreboard.$refs.link;
                let scrollHeight = scoreboard.scrollHeight;
                scoreboard.scrollTop = scrollHeight;
                this.recordAdded = false;
            }
        },
        methods: {
            /**
             * Add a new hit to the scoreboard.
             * 
             * @param {Object} hit - {
             *                          {Number} index - The index of the hit,
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
            recordHit: function(hit, round, loaded=false, score=null) {
                let hitScore = (score !== null) ? score : this.calculateScore(hit.bullseyeData.distance);
                let color = this.findScoreColor(hitScore, this.colors.secondary);
                this.selectedRecord = this.scoreboard[this.selectedRound].length;

                //add hit to scoreboard
                this.scoreboard[this.selectedRound].push({
                    score: hitScore,
                    color,
                    hitData: hit
                });

                if (!loaded) {
                    //add hit to database
                    let hitDBData = {
                        hitId: hit.index,
                        rangeId: this.range.id,
                        point: hit.point,
                        score: hitScore,
                        round: this.selectedRound
                    }
                    this.$store.dispatch('recordHit', hitDBData);
                }

                //activate a trigger so the scoreboard will scroll all the way down
                this.recordAdded = true;
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
                let scores = this.scoreboard[this.selectedRound];
                let recordIndex = -1;

                for (let i in scores) {
                    let record = scores[i];
                    if (record.hitData.index === hit.index) {
                        recordIndex = i;
                        break;
                    }
                }

                if (recordIndex !== -1) {
                    scores.splice(recordIndex, 1);
                    this.selectedRecord = scores.length - 1;

                    //remove hit from database
                    let hitDBData = {
                        hitId: hit.index,
                        rangeId: this.range.id
                    }
                    this.$store.dispatch('removeHit', hitDBData);
                }
            },
            /**
             * Calculate the score of a single hit.
             * 
             * @param {Number} dist - Distance of the hit from the target's bull'seye.
             * @returns {Number} The score of the hit.
             */
            calculateScore: function(dist) {
                let score = 0;
                let ringsRads = this.targetData.ringsRads;

                for (let i in ringsRads) {
                    let radius = ringsRads[i];
                    if (dist <= radius) {
                        score = 10 - i;
                        break;
                    }
                }

                return score;
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
                if (!score) return '#ffffff';
                else return ColorsHandler.lighten(highestScoreColor, (10 - score) * 5);
            },
            /**
             * Create the appropriate style for a record item.
             * 
             * @param {Number} index - The index of the record
             * @returns {Object} {
             *                      {String} width - CSS width attribute,
             *                      {String} height - CSS height attribute,
             *                      {String} borderColor - CSS border-color attribute,
             *                      {String} borderStyle - CSS border-style attribute,
             *                      {String} color - CSS color attribute
             *                   }
             */
            createRecordItemStyle(index) {
                let isSelected = this.selectedRecord === index;
                let borderColor = isSelected ? this.colors.primary : '#00000020';
                let borderStyle = isSelected ? 'dashed' : 'solid';
                let fontColor = isSelected ? '#ffffff' : '#000000';
                
                return {
                    width: '50px',
                    height: '48px',
                    borderColor,
                    borderStyle,
                    color: fontColor,
                };
            },
            /**
             * Create the appropriate style for a record's score text.
             * 
             * @param {Number} index - The index of the record
             * @returns {Object} {
             *                      {String} backgroundImage - CSS background-image attribute,
             *                      {String} backgroundPosition - CSS background-position attribute,
             *                      {String} backgroundSize - CSS background-size attribute,
             *                      {String} fontWeight - CSS font-weight attribute,
             *                      {String} textShadow - CSS text-shadow attribute
             *                   }
             */
            createRecordScoreStyle(index) {
                if (this.selectedRecord === index) {
                    let image = ASSETS_CONTEXT('./ranges/ribbon.png');
                    let backgroundImage = `url(${image})`;
                    let backgroundPosition = 'left top';
                    let backgroundSize = 'auto auto'
                    let fontWeight = 'bold';
                    let textShadow = '-1px -1px 0 #000000, ' +
                                     '1px -1px 0 #000000, ' +
                                     '-1px 1px 0 #000000, ' +
                                     '1px 1px 0 #000000';

                    return {
                        backgroundImage,
                        backgroundPosition,
                        backgroundSize,
                        fontWeight,
                        textShadow
                    };
                }
                return null;
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
            /**
             * Activate when a hit on the target is touched.
             * 
             * @param {Number} index - The index of the hit
             */
            onHitTouch: function(index) {
                let scores = this.scoreboard[this.selectedRound];

                for (let i in scores) {
                    let record = scores[i];
                    if (record.hitData.index === index) {
                        this.selectedRecord = +i;
                        return;
                    }
                }
            }
        }
    }
</script>

<style scoped>
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
        overflow: auto;
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
        position: absolute;
        right: 5px;
    }
    .meta-btn.remove {
        margin-top: 10px;
    }
</style>