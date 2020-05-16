<template>
    <div>
        <v-row no-gutters>
            <v-col>
                <v-card
                    class='outer-card'
                    :width='windowDim.width * .93'
                    elevation=0
                >
                    <v-card
                        class='inner-card'
                        :width='windowDim.width * .93'
                        :min-height='windowDim.height - 187'
                        elevation=0
                    >
                        <!-- date and time -->
                        <hr class='horizontal-line first-line'>
                        <p
                            class='subtitle'
                            align=center
                            :style='headerStyle'
                        >
                            <span class='header-icon'>
                                <v-icon
                                    :style='createSegmentStyle(0)'
                                    medium
                                    @click='revertSegment(0)'
                                >
                                    <template v-if='!isSegmentChanged(0)'>mdi-checkbox-blank-circle-outline</template>
                                    <template v-else>mdi-chevron-right-circle</template>
                                </v-icon>
                            </span>
                            Date and Time
                        </p>
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <v-row no-gutters>
                                        <v-col cols=4>Date</v-col>
                                        <v-col cols=4 class='text--secondary'>
                                            <span
                                                :style='(datePickerModel !== originDate) ?
                                                        { color: colors.primary } : null'
                                            >
                                                {{ datePickerModel | dateLabelFormat }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-date-picker
                                        class='date-label date-picker elevation-0'
                                        v-model='datePickerModel' 
                                        first-day-of-week=0
                                        full-width
                                        scrollable
                                        :max='getNowDate()'
                                        :color='colors.neutral'
                                    />
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <v-row no-gutters>
                                        <v-col cols=4>Time</v-col>
                                        <v-col cols=4 class='text--secondary'>
                                            <span
                                                :style='(timePickerModel !== originTime) ?
                                                        { color: colors.primary } : null'
                                            >
                                                {{ timePickerModel | timeLabelFormat }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-time-picker
                                        class='date-label time-picker elevation-0'
                                        v-model='timePickerModel'
                                        full-width
                                        scrollable
                                        ampm-in-title
                                        :height='100'
                                        :color='colors.neutral'
                                    />
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                        <v-btn
                            class='current-date-time'
                            outlined
                            block
                            :color='colors.neutral'
                            @click='toCurrentDateTime'
                        >
                            Change to Current
                        </v-btn>
                        <!-- options -->
                        <hr class='horizontal-line'>
                        <p
                            class='subtitle'
                            align=center
                            :style='headerStyle'
                        >
                            <span class='header-icon'>
                                <v-icon
                                    :style='createSegmentStyle(1)'
                                    medium
                                    @click='revertSegment(1)'
                                >
                                    <template v-if='!isSegmentChanged(1)'>mdi-checkbox-blank-circle-outline</template>
                                    <template v-else>mdi-chevron-right-circle</template>
                                </v-icon>
                            </span>
                            Range Options
                        </p>
                        <v-card
                            class='option-card'
                            elevation=0
                        >
                            <v-row>
                                <v-col cols=4>
                                    <v-switch
                                        class='protocol-switch'
                                        v-model='protocoledRangeModel'
                                        inset
                                        :color='colors.secondary'
                                    />
                                </v-col>
                                <v-col cols=7>
                                    <p v-if='protocoledRangeModel' class='btn-info'>
                                        Save performance data.
                                    </p>
                                    <p v-else class='btn-info'>
                                        Do not save performance data.
                                    </p>
                                </v-col>
                                <v-col cols=1>
                                    <i
                                        class='btn-icon fas fa-cloud-upload-alt fa-lg'
                                        :style='{ color: colors.primary }'
                                    />
                                </v-col>
                            </v-row>
                        </v-card>
                        <v-card
                            class='option-card'
                            elevation=0
                        >
                            <v-row>
                                <v-col cols=4>
                                    <v-btn
                                        class='btn delete elevation-2 white--text'
                                        large
                                        color='#d30000'
                                        :width=100
                                        @click='popWarning("Are you absolutely sure you want to clear this range?", clearRange)'
                                    >
                                        Clear<br>Range
                                    </v-btn>
                                </v-col>
                                <v-col cols=7>
                                    <p class='btn-info'>
                                        Clear all range data.
                                    </p>
                                </v-col>
                                <v-col cols=1>
                                    <i
                                        class='btn-icon fas fa-eraser fa-lg'
                                        :style='{ color: colors.primary }'
                                    />
                                </v-col>
                            </v-row>
                        </v-card>
                        <v-card
                            class='option-card'
                            elevation=0
                        >
                            <v-row>
                                <v-col cols=4>
                                    <v-btn
                                        class='btn delete elevation-2 white--text'
                                        large
                                        color='#d30000'
                                        :width=100
                                        @click='popWarning("Are you absolutely sure you want to delete this range " +
                                                           "with all its performance data?", deleteRange)'
                                    >
                                        Delete<br>Range
                                    </v-btn>
                                </v-col>
                                <v-col cols=7>
                                    <p class='btn-info'>
                                        Permanently delete<br>this range.
                                    </p>
                                </v-col>
                                <v-col cols=1>
                                    <i
                                        class='btn-icon fas fa-trash fa-lg'
                                        :style='{ color: colors.primary }'
                                    />
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-card>
                    <!-- save -->
                    <hr class='horizontal-line last-line'>
                    <v-btn
                        class='btn revert'
                        outlined
                        :color='colors.primary'
                        @click='revertAll'
                    >
                        Revert
                    </v-btn>
                    <v-btn
                        class='btn save'
                        outlined
                        :color='colors.primary'
                        @click='save'
                    >
                        Save
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
        <warning-dialog
            :model='warningModel'
            :message='warningMessage'
            :callback='warningCallback'
            async-wait
            irreversible
            @close='warningModel = false'
        />
        <v-dialog
            v-model='dialogModel'
            :max-width=290
        >
            <v-card>
                <v-card-title
                    class='dialog-title'
                    :style="{ backgroundColor: dialogColor }"
                >
                    <p
                        class='dialog-title-flex success-dialog'
                        align=center
                    >
                        {{ dialogMessage }}
                    </p>
                </v-card-title>
                <v-card-actions>
                    <v-btn
                        class='dialog-btn ok-btn success-dialog'
                        text
                        block
                        :color='colors.primaryDark'
                        @click='onDialogClick'
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <loading :model='load' />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { windowDimMixin } from '../../../util/Mixins'
    import Loading from '../../widgets/Loading';
    import ColorsHandler from '../../../util/ColorsHandler';
    import WarningDialog from '../../widgets/WarningDialog';
    import Moment from 'moment';

    export default {
        mixins: [
            windowDimMixin
        ],
        components: {
            WarningDialog,
            Loading
        },
        data() {
            return {
                load: false,
                warningModel: false,
                warningMessage: '',
                warningCallback: null,
                dialogModel: false,
                dialogMessage: '',
                dialogColor: '',
                dialogSuccessful: false,
                protocoledRangeModel: false,
                rangeDeleted: false,
                datePicker: true,
                timePicker: false,
                datePickerModel: null,
                timePickerModel: null,
                segmentColor: ColorsHandler.darken("#fafafa", 40)
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                ranges: 'getAllRanges',
                rangeIndex: 'getRangeIndex',
                journals: 'getAllJournals',
                journalIndex: 'getSelectedJournalIndex'
            }),
            journal() {
                return this.journals[this.journalIndex];
            },
            range() {
                console.log('all ranges', this.ranges)
                return this.ranges[`journal #${this.journal.id}`][this.rangeIndex];
            },
            isRangeProtocoled() {
                return this.range.protocoled;
            },
            originDateTime() {
                return Moment(this.range.date, 'YYYY-MM-DD HH:mm:ss');
            },
            originDate() {
                let date = this.originDateTime.format('YYYY-MM-DD');
                return date.toString();
            },
            originTime() {
                let time = this.originDateTime.format('hh:mm:ss');
                return time.toString();
            },
            headerStyle() {
                let gradient = `linear-gradient(to right, ${this.segmentColor}50, #00000000)`
                return { backgroundImage: gradient };
            }
        },
        filters: {
            dateLabelFormat(date) {
                return Moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY').toString();
            },
            timeLabelFormat(date) {
                return Moment(date, 'hh:mm').format('HH:mm').toString();
            }
        },
        created() {
            this.revertAll();
        },
        methods: {
            /**
             * Create a style for the little light bulb in every segment.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - discipline
             *                           2 - default target
             *                           3 - color theme
             * @returns {Object} {
             *                      {String} color - The color of the light bulb,
             *                      {String} filter - CSS filter attribute (drop-shadow)
             *                   }
             */
            createSegmentStyle: function(segment) {
                let changed = this.isSegmentChanged(segment);
                let color = changed ? this.colors.primary : this.colors.neutral;
                return { color };
            },
            /**
             * Check if a particular segment of the form has been changed.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - discipline
             *                           2 - default target
             *                           3 - color theme
             * @returns {Boolean} True if the segment has been changed.
             */
            isSegmentChanged: function(segment) {
                switch (segment) {
                    case 0: {
                        let dateChanged = this.datePickerModel !== this.originDate;
                        let timeChanged = this.timePickerModel !== this.originTime;
                        return dateChanged || timeChanged;
                    }
                    case 1: return this.protocoledRangeModel !== this.isRangeProtocoled;
                    default: return false;
                }
            },
            /**
             * Return a particular segment's values to their default states.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - discipline
             *                           2 - default target
             *                           3 - color theme
             */
            revertSegment: function(segment) {
                switch (segment) {
                    case 0:
                        this.datePickerModel = this.originDate;
                        this.timePickerModel = this.originTime;
                        break;
                    case 1:
                        this.protocoledRangeModel = this.isRangeProtocoled;
                        break;
                }
            },
            /**
             * @returns {String} The date right now in YYYY-MM-DD format.
             */
            getNowDate: function() { return Moment().format('YYYY-MM-DD'); },
            /**
             * @returns {String} The time right now in hh:mm 24 hours format.
             */
            getNowTime: function() { return Moment().format('HH:mm:ss'); },
            /**
             * Activate when the 'Change to Current' button is pressed.
             * Change the date and time to current date time values.
             */
            toCurrentDateTime: function() {
                this.datePickerModel = this.getNowDate();
                this.timePickerModel = this.getNowTime();
            },
            /**
             * Activate when clicking the 'clear range' button.
             */
            clearRange: async function() {
                this.load = true;
                let success = await this.$store.dispatch('clearRange', { rangeId: this.range.id });
                this.load = false;
                this.popDialog(success, 'Range cleared successfully.',
                              'Could not clear range at this moment. Please try again later.');
            },
            /**
             * Activate when clicking the 'delete range' button.
             */
            deleteRange: async function() {
                this.load = true;
                let success = await this.$store.dispatch('deleteRange', { rangeId: this.range.id });
                this.load = false;
                this.popDialog(success, 'Range deleted successfully.',
                               'Could not delete the range at this moment. Please try again later.');

                this.rangeDeleted = success;
            },
            /**
             * Return all values in the form to their default states.
             */
            revertAll: function() {
                for (let i = 0; i < 4; i++) this.revertSegment(i);
            },
            /**
             * Save the changed data.
             */
            save: async function() {
                let concatDateTime = this.datePickerModel + ' ' + this.timePickerModel;
                let date = this.isSegmentChanged(0) ? concatDateTime : null;
                let protocoled = this.isSegmentChanged(1) ? this.protocoledRangeModel : null;

                //nothing is changed
                if (!date && protocoled === null) return;

                let data = {
                    rangeId: this.range.id,
                    date,
                    protocoled
                }

                this.load = true;
                let success = await this.$store.dispatch('updateRange', data);

                if (success) {
                    await this.$store.dispatch('loadAllRanges');
                    this.revertAll();
                }

                this.load = false;
                this.popDialog(success, 'Range updated successfully.',
                              'Could not save changes at the moment. Please try again later.');
            },
            /**
             * Pop a warning dialog on the screen.
             * 
             * @param {String} msg - The message to display
             * @param {Function} agreementCallback - The function to call if the user click the ok button
             */
            popWarning: function(msg, agreementCallback) {
                this.warningMessage = msg;
                this.warningCallback = agreementCallback;
                this.warningModel = true;
            },
            /**
             * Pop a success/failute dialog on the screen.
             * 
             * @param {Boolean} isSuccessful - True if the process that triggered the dialog is successful
             * @param {String} msg - The message to display
             */
            popDialog: function(isSuccessful, successMsg, failureMsg) {
                this.dialogColor = isSuccessful ? this.colors.secondary : this.colors.primary;
                this.dialogMessage = isSuccessful ? successMsg : failureMsg;
                this.dialogSuccessful = isSuccessful;
                this.dialogModel = true;
            },
            /**
             * Activate when clicking the dialog's 'ok' button.
             * If the dialog shows a successful message, reload all app data.
             * If this journal no longer exists, go back to the shooting journals page.
             */
            onDialogClick: async function() {
                if (this.dialogSuccessful) {
                    //deleted the range
                    if (this.rangeDeleted) {
                        this.rangeDeleted = false;
                        this.load = true;
                        await this.$store.dispatch('reloadAllData');
                        this.load = false;

                        let journalName = `${this.journal.discipline}-${this.journal.name}`
                        let journalPage = `/home/journals/${journalName}/`;
                        this.$router.push({ path: journalPage }).catch(() => {});
                    }
                    //cleared the range
                    else {
                        this.$store.dispatch('reloadRangeHits', {
                            rangeId: this.range.id,
                            rangeIndex: this.rangeIndex,
                            journalId: this.journal.id
                        });
                    }
                }

                this.dialogModel = false;
            }
        }
    }
</script>

<style scoped>
    .outer-card {
        border-width: 1px;
        border-style: dashed none;
    }
    .inner-card {
        top: -40px;
    }
    .subtitle {
        height: 50px;
        line-height: 50px;
        font-size: 18px;
        letter-spacing: 2.5px;
    }
    .header-icon {
        position: absolute;
        left: 10px;
    }
    .horizontal-line {
        margin: 20px 0 -1px 0;
        border-style: inset;
    }
    .horizontal-line.first-line {
        margin-top: 0;
    }
    .horizontal-line.last-line {
        margin: 20px 0 10px 0;
        border-width: .5px;
        border-style: dashed;
        border-color: #00000030;
    }
    .current-date-time {
        text-transform: none;
        margin-top: 10px;
    }
    .protocol-switch {
        margin: 5px 0 5px 5px;
    }
    .option-card {
        width: 90%;
        margin: auto;
    }
    .btn-icon {
        margin: 0 8px 0 -13px;
    }
    .btn-info {
        font-size: 14px;
    }
    .btn {
        text-transform: none;
    }
    .btn.save {
        position: absolute;
        right: 0;
    }
    .dialog-title-flex {
        word-break: normal;
        color: #ffffff;
        margin-top: 10px;
    }
    .dialog-title-flex.success-dialog {
        font-weight: bold;
        font-size: 24px;
    }
</style>