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
                                            <span>20/05/20</span>
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
                                            <span>10:51</span>
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
                        <!-- options -->
                        <hr class='horizontal-line'>
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
                                        v-model='protocoledRange'
                                        inset
                                        :color='colors.secondary'
                                    />
                                </v-col>
                                <v-col cols=7>
                                    <p v-if='protocoledRange' class='btn-info'>
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
                journalDeleted: false,
                load: false,
                warningModel: false,
                warningMessage: '',
                warningCallback: null,
                dialogModel: false,
                dialogMessage: '',
                dialogColor: '',
                dialogSuccessful: false,
                newName: '',
                disciplineSelectOpen: false,
                selectedDiscipline: '',
                newDiscipName: '',
                selectedColor: '',
                selectedTargetIndex: 0,
                targets: [],

                protocoledRange: true,
                datePicker: true,
                timePicker: false,
                datePickerModel: this.getNowDate(),
                timePickerModel: this.getNowTime()
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journals: 'getAllJournals',
                storeTargets: 'getAllTargets',
                selectedIndex: 'getSelectedJournalIndex',
                palette: 'getNewJournalColorPalette'
            }),
            journal() {
                return this.journals[this.selectedIndex];
            },
            selectedTarget() {
                return this.targets[this.selectedTargetIndex];
            },
            allDisciplines() {
                let list = ['Archery', 'Firearm'];

                for (let journal of this.journals) {
                    let discip = journal.discipline;
                    if (!list.includes(discip)) list.push(discip);
                }
                
                list.sort();
                list.push('Other:');
                return list;
            },
            headerStyle() {
                let color = ColorsHandler.darken(this.selectedColor, 40);
                let gradient = `linear-gradient(to right, ${color}50, #00000000)`

                return { backgroundImage: gradient };
            }
        },
        created() {
            this.revertAll();
        },
        methods: {
            /**
             * @returns {String} The date right now in YYYY-MM-DD format.
             */
            getNowDate: function() { return Moment().format('YYYY-MM-DD'); },
            /**
             * @returns {String} The time right now in hh:mm 24 hours format.
             */
            getNowTime: function() { return Moment().format('HH:mm:ss'); },






            /**
             * Create the appropriate style for a color icon.
             * 
             * @param {String} color - A hex representation of the selected color
             * @returns {Object} {
             *                      {String} borderColor - CSS attribute for border-color
             *                   }
             */
            createColorIconStyle(color) {
                let borderAlpha = (this.selectedColor === color) ? 'bb' : '20';
                return { borderColor: '#000000' + borderAlpha }
            },
            /**
             * Move to the next target in line.
             */
            incrementTarget: function() {
                if (this.selectedTargetIndex < this.targets.length - 1)
                    this.selectedTargetIndex++;
            },
            /**
             * Return to the previous viewed target.
             */
            decrementTarget: function() {
                if (this.selectedTargetIndex > 0)
                    this.selectedTargetIndex--;
            },
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
                    case 0: return this.newName !== this.journal.name;
                    case 1: return this.selectedDiscipline !== this.journal.discipline;
                    case 2: return this.selectedTarget.id !== this.journal.target.id;
                    case 3: return this.selectedColor !== this.journal.color;
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
                        this.newName = this.journal.name;
                        break;
                    case 1:
                        this.selectedDiscipline = this.journal.discipline;
                        break;
                    case 2:
                        this.targets = this.storeTargets.filter(x => x.active);
                        this.targets.sort(element => {
                            if (element.id === this.journal.target.id) return -1;
                            else return 0;
                        })

                        this.selectedTargetIndex = 0;
                        break;
                    case 3:
                        this.selectedColor = this.journal.color;
                        break;
                }
            },
            /**
             * Activate when clicking the 'clear ranges' button.
             */
            clearRanges: async function() {
                this.load = true;
                let success = await this.$store.dispatch('clearJournalRanges', this.journal.id);
                this.load = false;
                this.popDialog(success, 'Ranges deleted successfully.', 'Could not clear ranges. Please try again.');
            },
            /**
             * Activate when clicking the 'delete journal' button.
             */
            deleteJournal: async function() {
                this.load = true;
                let success = await this.$store.dispatch('deleteJournal', this.journal.id);
                this.load = false;
                this.popDialog(success, 'Journal deleted successfully.', 'Could not delete the journal. Please try again.');
                this.journalDeleted = success;
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
                let name = this.isSegmentChanged(0) ? this.newName : null;
                let discipline = this.isSegmentChanged(1) ? this.selectedDiscipline : null;
                let targetId = this.isSegmentChanged(2) ? this.selectedTarget.id : null;
                let colorTheme = this.isSegmentChanged(3) ? this.selectedColor : null;

                //other discipline's name
                if (discipline === 'Other:') discipline = this.newDiscipName;

                //nothing is changed
                if (!name && !discipline && !targetId && !colorTheme) return;

                let data = {
                    id: this.journal.id,
                    name,
                    discipline,
                    targetId,
                    colorTheme
                }

                this.load = true;
                let success = await this.$store.dispatch('updateJournal', data);
                this.load = false;
                this.popDialog(success, 'Journal updated successfully.', 'Could not save changes. Please try again.');
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
            onDialogClick: function() {
                if (this.dialogSuccessful) {
                    if (this.journalDeleted) {
                        this.journalDeleted = false;
                        let journalsPage = '/home/journals';
                        this.$router.push({ path: journalsPage }).catch(() => {});
                    }

                    this.$store.dispatch('reloadAllData');
                }

                this.dialogModel = false;
            },
            /**
             * Activate when clicking the dialog's 'ok' button.
             * Reload all journals, ranges and targets data.
             * If this journal no longer exists, go back to the shooting journals page.
             */
            reloadAppData: async function() {
                if (this.journalDeleted) {
                    this.journalDeleted = false;
                    let journalsPage = '/home/journals';
                    this.$router.push({ path: journalsPage }).catch(() => {});
                }

                this.$store.dispatch('reloadAllData');
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