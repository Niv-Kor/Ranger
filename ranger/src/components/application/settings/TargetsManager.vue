<template>
    <div>
        <v-card
            class='targets-card'
            elevation=2
            :width='windowDim.width * .94'
            :height='windowDim.height * .65'
            :color='colors.neutral + "30"'
        >
            <div v-if='!listLoading && targets'>
                <ul
                    v-if='targets.length'
                    class='list'
                >
                    <li
                        class='list-item'
                        v-for='(target, index) in targets'
                        :key='index'
                        :style='createItemStyle(index)'
                        @click='selectedTargetIndex = index'
                    >
                        <v-img
                            class='target-img'
                            :src='target.base64Data'
                            :width='targetSize'
                            :height='targetSize'
                        />
                    </li>
                </ul>
                <div
                    v-else
                    class='no-targets div'
                    align=center
                >
                    <p class='no-targets msg'>You don't own any custom targets.</p>
                    <div class='no-targets header'>What are custom targets?</div>
                    <p class='no-targets msg'>
                        <span class='no-targets keyword' :style='{ color: colors.primary }'>Ranger</span>
                        has a set of pre-defined common targets,
                        but it is possible none of them is the one you are looking for.<br><br>
                        You can
                        <span class='no-targets keyword' :style='{ color: colors.primary }'>upload</span>
                        an image of your target,
                        <span class='no-targets keyword' :style='{ color: colors.primary }'>customize</span>
                        it, and use it in any of your ranges.
                    </p>
                    <div class='no-targets header'>How do I get started?</div>
                    <p class='no-targets msg'>
                        Tap the
                        '<span class='no-targets keyword' :style='{ color: colors.primary }'>Create Target</span>'
                        button below and upload a photo from your device.
                        Then, configure the target's bull'seye point and values.
                    </p>
                </div>
            </div>
        </v-card>
        <v-card
            :width='windowDim.width * .94'
            :height='windowDim.height * .15'
        >
            <v-row>
                <v-col cols=8>
                    <div v-if='selectedTarget'>
                        <p class='target-info name'>
                            <span :style='{ color: colors.primary }'>{{ selectedTarget.name }}</span>
                        </p>
                        <p class='target-info cration-date'>
                            Created
                            <span :style='{ color: colors.primary }'>
                                {{ selectedTarget.creationDate | dateFormat}}
                            </span>
                        </p>
                        <p class='target-info journal-uses'>
                            Default for
                            <span :style='{ color: colors.primary }'>{{ journalsCount }} </span>
                            <template v-if='journalsCount === 1'>journal</template>
                            <template v-else>journals</template>
                        </p>
                        <p class='target-info range-uses'>
                            Used in
                            <span :style='{ color: colors.primary }'>{{ rangesCount }} </span>
                            <template v-if='rangesCount === 1'>range</template>
                            <template v-else>ranges</template>
                        </p>
                    </div>
                </v-col>
                <v-col cols=4>
                    <v-btn
                        class='btn target-info-btn'
                        outlined
                        :width=100
                        :color='colors.neutral'
                        @click='editTargetModel = true'
                    >
                        Edit
                    </v-btn>
                    <v-btn
                        class='btn target-info-btn elevation-0 white--text'
                        :width=100
                        :color='colors.primary'
                        @click='popWarning("Are you sure you want to delete this target?", deleteTarget)'
                    >
                        Delete
                    </v-btn>
                </v-col>
            </v-row>
        </v-card>
        <v-btn
            class='btn clear'
            outlined
            :color='colors.primary'
            @click='popWarning("All targets that are not used in journals " +
                               "or ranges will be permanently deleted.", deleteUnused)'
        >
            Delete unused targets
        </v-btn>
        <v-btn
            class='btn create white--text'
            :color='colors.primary'
            @click='createTargetModel = true'
        >
            Create Target
        </v-btn>
        <v-dialog
            v-model='successDialogModel'
            :max-width=290
        >
            <v-card>
                <v-card-title
                    class='success-title'
                    :color='colors.primary'
                    :style="{ backgroundColor: colors.secondary }"
                >
                    <p align=center class='success-title-flex'>
                        {{ successMessage }}
                    </p>
                </v-card-title>
                <v-card-actions>
                    <v-btn
                        class='success-ok-btn'
                        text
                        block
                        :color='colors.primaryDark'
                        @click='successDialogModel = false'
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <warning-dialog
            :model='warningModel'
            :message='warningMessage'
            :callback='warningCallback'
            async-wait
            irreversible
            @close='warningModel = false'
        />
        <target-creation-dialog-box
            v-if='createTargetModel'
            :model='createTargetModel'
            @success='popSuccessMessage'
            @close='createTargetModel = false'
        />
        <target-edit-dialog-box
            v-if='editTargetModel && selectedTarget'
            :model='editTargetModel'
            :target='selectedTarget'
            @close='editTargetModel = false'
        />
        <loading :model='listLoading' />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { windowDimMixin } from '../../../util/Mixins';
    import TargetCreationDialogBox from '../dialogs/target/creation/TargetCreationDialogBox';
    import TargetEditDialogBox from '../dialogs/target/edit/TargetEditDialogBox';
    import WarningDialog from '../../widgets/WarningDialog';
    import Loading from '../../widgets/Loading';
    import Moment from 'moment'

    export default {
        mixins: [
            windowDimMixin
        ],
        components: {
            TargetCreationDialogBox,
            TargetEditDialogBox,
            WarningDialog,
            Loading
        },
        data() {
            return {
                selectedTargetIndex: 0,
                createTargetModel: false,
                editTargetModel: false,
                successDialog: false,
                successMessage: '',
                warningModel: false,
                warningMessage: '',
                warningCallback: null
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                userToken: 'getUserData',
                allTargets: 'getAllTargets',
                ranges: 'getAllRanges',
                journals: 'getAllJournals',
                listLoading: 'isAnyListLoading',
            }),
            targets() {
                if (this.allTargets) return this.allTargets.filter(x => {
                    return x.user === this.userToken.email && x.active;
                });
                else return [];
            },
            selectedTarget() {
                if (this.targets.length) return this.targets[this.selectedTargetIndex];
                else return null;
            },
            targetSize() {
                return this.windowDim.width * .35;
            },
            journalsCount() {
                return this.countJournalUses(this.selectedTarget.id);
            },
            rangesCount() {
                return this.countRangeUses(this.selectedTarget.id);
            },
            successDialogModel: {
                get() { return this.successDialog && !this.isLoading; },
                set(value) { this.successDialog = value; }
            }
        },
        filters: {
            /**
             * @param {String} value - [YYYY-MM-DD HH:mm:ss]
             * @returns {String} [DD-MM-YY HH:mm]
             */
            dateFormat(value) {
                let date = Moment(value, 'YYYY-MM-DD HH:mm:ss');
                return date.format('DD-MM-YY HH:mm');
            }
        },
        methods: {
            /**
             * Create an appropriate style for a selected item.
             * 
             * @param {Number} targetId - The ID of the selected target
             * @returns {Object} {
             *                      {String} borderColor - CSS border-color attribute
             *                   }
             */
            createItemStyle: function(index) {
                let borderColor = (this.selectedTargetIndex === index) ? this.colors.primary : '#00000000';
                return { borderColor };
            },
            /**
             * Check if the targets' list is still loading.
             * 
             * @returns {Boolean} True if the list is loading.
             */
            isListLoading: function() {
                return !this.selectedTarget;
            },
            /**
             * Count the amount of journals a target is considered the default in.
             * 
             * @param {Number} targetId - The ID of the target to be checked
             * @returns {Number} The amount of journals that use that target as a default target.
             */
            countJournalUses(targetId) {
                if (this.journals) return this.journals.filter(x => x.target.id === targetId).length;
                else return 0;
            },
            /**
             * Count the amount of ranges a target is taking place in.
             * 
             * @param {Number} targetId - The ID of the target to be checked
             * @returns {Number} The amount of ranges that use that target.
             */
            countRangeUses(targetId) {
                let amount = 0;

                for (let journal of this.journals) {
                    let journalObj = this.ranges[`journal #${journal.id}`];
                    if (journalObj) amount += journalObj.filter(x => x.targetId === targetId).length;
                }

                return amount;
            },
            /**
             * Pop a success dialog.
             * 
             * @param {Event} ev - The event parament (success message)
             */
            popSuccessMessage: function(ev) {
                this.successDialog = true;
                this.successMessage = ev;
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
            deleteTarget: async function() {
                let id = this.selectedTarget.id;
                await this.$store.dispatch('deleteTarget', id);
                this.selectedTargetIndex = 0;
            },
            deleteUnused: async function() {
                let deleted = false;

                for (let target of this.targets) {
                    let id = target.id;

                    if (!this.countJournalUses(id) && !this.countRangeUses(id)) {
                        await this.$store.dispatch('deleteTarget', id);
                        deleted = true;
                    }
                }

                if (deleted) this.selectedTargetIndex = 0;
            }
        }
    }
</script>

<style scoped>
    .targets-card {
        overflow: auto;
        left: 0;
        right: 0;
        margin: auto;
    }
    .no-targets.div {
        position: absolute;
        margin: 10px 0 0 0;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
    .no-targets.header {
        font-size: 20px;
        font-weight: bold;
        margin: 40px 0 10px 0;
    }
    .no-targets.keyword {
        font-weight: bold;
    }
    .no-targets.msg {
        font-size: 15px;
        width: 90%;
    }
    .target-info {
        font-size: 15px;
        margin: 3px 0 3px 10px;
    }
    .target-info-btn {
        margin: 5px 0 2px -10px;
    }
    .list {
        list-style-type: none;
    }
    .list-item {
        display: inline-block;
        border-width: 2px;
        border-style: dashed;
        margin: 4% 6% 4% 0;
        transition: border-color .2s;
    }
    .btn {
        text-transform: none;
    }
    .btn.clear {
        position: fixed;
        bottom: 51px;
        left: 0;
        right: 0;
        width: 95%;
        margin: auto;
        font-size: 15px;
    }
    .btn.create {
        position: fixed;
        bottom: 10px;
        left: 0;
        right: 0;
        width: 95%;
        margin: auto;
        font-size: 16px;
        font-weight: bold;
    }
    .success-title-flex {
        word-break: normal;
        color: #ffffff;
        font-weight: bold;
        font-size: 24px;
        margin-top: 10px;
    }
    .success-ok-btn {
        text-transform: none;
    }
</style>