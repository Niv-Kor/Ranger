<template>
    <div>
        <v-dialog 
            :value='model'
            persistent
        >
            <v-card class='main-card' :height=580>
                <v-app-bar
                    :color='colors.secondary' 
                    elevation=0
                >
                    <v-btn
                        class='close-btn'
                        color='gray'
                        x-small
                        fab
                        elevation=2
                        @click='close'
                    >
                        <v-icon
                            color='black'
                            medium
                        >
                            mdi-close
                        </v-icon>
                    </v-btn>
                    <span class='head'>
                        new range
                    </span>
                </v-app-bar>
                <v-container>
                    <v-card
                        class='inner-card'
                        :height=360
                        flat
                    >
                        <select-range-time
                            v-show='currentTab == 0'
                            @loading='activateLoading'
                            @change-tab='setTab'
                        />
                    </v-card>
                    <v-container>
                        <!-- create button -->
                        <v-btn
                            :class='(currentTab === totalTabs - 4) ? "create-btn" : "create-btn transparent"'
                            block
                            dark
                            elevation=0
                            :disabled='currentTab !== totalTabs - 1'
                            :style="{ backgroundImage: 'url(' + colors.gradient + ')' }"
                            @click='createJournal'
                        >
                            {{ createButtonText }}
                        </v-btn>
                        <!-- back and next buttons -->
                        <v-row>
                            <v-btn
                                v-if='currentTab > 0'
                                class='nav-btn'
                                :color='colors.neutral'
                                text
                                @click='decrementTab'
                            >
                                Back
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                v-if='currentTab < totalTabs - 1'
                                class='nav-btn'
                                :color='colors.primary'
                                text
                                @click='incrementTab'
                            >
                                Next
                            </v-btn>
                        </v-row>
                    </v-container>
                </v-container>
            </v-card>
            <v-dialog
                v-model='errorDialog'
                :max-width=290
            >
                <v-card>
                    <v-card-title
                        class='error-title'
                        :color='colors.secondary'
                        :style="{ backgroundColor: colors.secondary }"
                    >
                        Hold on!
                    </v-card-title>
                    <v-container>
                        <div
                            class='error-headline'
                            align='center'
                        >
                            {{ errorMessage }}
                        </div>
                    </v-container>
                    <v-card-actions>
                        <v-btn
                            class='error-ok-btn'
                            text
                            block
                            :color='colors.secondary'
                            @click="errorDialog = false"
                        >
                            Ok
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <Loading :model='load' />
        </v-dialog>
        <v-dialog
            v-model='successDialog'
            :max-width=290
        >
            <v-card>
                <v-card-title
                    class='success-title'
                    :color='colors.primary'
                    :style="{ backgroundColor: colors.secondary }"
                >
                    <p align=center class='success-title-flex'>
                        Journal created successfully!
                    </p>
                </v-card-title>
                <v-card-actions>
                    <v-btn
                        class='success-ok-btn'
                        text
                        block
                        :color='colors.primaryDark'
                        @click='successDialog = false'
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import SelectRangeTime from './SelectRangeTime';
    import Loading from '../../../widgets/Loading';

    export default {
        components: {
            SelectRangeTime,
            Loading
        },
        props: [
            'model'
        ],
        data() {
            return {
                load: false,
                errorDialog: false,
                successDialog: false,
                errorMessage: '',
                currentTab: 0,
                totalTabs: 2,
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalName: 'getNewJournalName',
                discipline: 'getNewJournalDiscipline',
                useCustomDiscipline: 'useCustomDiscipline',
                useCustomTarget: 'useUploadedCustomTarget',
                customDiscipline: 'getNewJournalCustomDiscipline',
                customTarget: 'getNewJournalUploadedTarget',
                regex: 'getNewJournalRegex'
            }),
            createButtonText() {
                let show = this.currentTab === this.totalTabs - 1;
                return show ? 'CREATE' : '';
            },
        },
        watch: {
            model(value) {
                if (value) this.$store.dispatch('initNewJournalValues');
            }
        },
        methods: {
            /**
             * Close the dialog box entirely.
             * 
             * @emits {Null} close
             */
            close: async function() {
                this.$emit('close');
                
                //let the dialog close completely before tabs reorganization
                setTimeout(() => {
                    this.currentTab = 0;
                    this.$store.dispatch('initNewJournalValues');
                }, 100);
            },
            /**
             * Move to the next tab in line.
             */
            incrementTab: async function() {
                this.load = true;
                let canContinue = await this.canContinueNextTab();
                this.load = false;
                if (!canContinue) return;

                if (this.currentTab < this.totalTabs - 1) {
                    if (this.currentTab != 1 || this.useCustomTarget) this.currentTab++;
                    else this.currentTab += 2; //skip custom target config
                }
            },
            /**
             * Return to the previous viewed tab.
             */
            decrementTab: function() {
                if (this.currentTab > 0) {
                    if (this.currentTab != 3 || this.useCustomTarget) this.currentTab--;
                    else this.currentTab -= 2; //skip custom target config
                }
            },
            /**
             * Set a tab to a specific index.
             * 
             * @param {Number} tabIndex - The index of the tab to set
             */
            setTab: function(tabIndex) { this.currentTab = tabIndex; },
            /**
             * Create a new journal based on the user's input.
             * A new journal will be created only if the input is valid.
             */
            createJournal: async function() {
                this.load = true;
                let canContinue = await this.canContinueNextTab();
                this.load = false;

                if (!canContinue) return;
                else {
                    this.load = true;
                    await this.$store.dispatch('createJournal');
                    this.load = false;

                    //triggers a confirmation dialog
                    setTimeout(() => {
                        this.successDialog = true;
                    }, 1000);

                    this.close();
                }
            },
            /**
             * Check if the user can continue to the next tab.
             * Only available if the current tab consists of legal input data.
             * 
             * @returns {Boolean} True if the next tab is available.
             */
            canContinueNextTab: async function() {
                return true;
            },
            /**
             * Pop an error message in a new dialog.
             * 
             * @param {String} message - The message to display
             */
            popError: function(message) {
                this.errorDialog = true;
                this.errorMessage = message;
            },
            /**
             * Activate a loading component over the screen
             * 
             * @param {Boolean} flag - True to show or false to dismiss
             */
            activateLoading: function(flag) { this.load = flag; }
        }
    }
</script>

<style>
    .main-card {
        overflow: hidden;
    }
    .head {
        font-size: 30px;
        font-family: 'comfortaa';
        margin-right: auto;
        margin-left: auto;
        padding-right: 20px;
        color: #ffffff;
        font-weight: bold;
    }
    .close-btn {
        margin-left: -5px;
    }
    .inner-card {
        margin-top: 40px;
    }
    .nav-btn {
        bottom: -20px;
        margin-right: auto;
        margin-left: auto;
        text-transform: none;
    }
    .create-btn {
        margin-top: 20px;
        margin-bottom: -20px;
        text-transform: none;
        background-size: auto;
        font-weight: bold;
    }
    .transparent {
        opacity: 0;
    }
    .error-title {
        color: #ffffff;
        margin-right: auto;
        margin-left: auto;
        left: 0;
        right: 0;
    }
    .success-title-flex {
        word-break: normal;
        color: #ffffff;
        font-weight: bold;
        font-size: 24px;
        margin-top: 10px;
    }
    .details-header {
        font-weight: bold;
    }
    .success-ok-btn {
        text-transform: none;
    }
    .error-ok-btn {
        text-transform: none;
    }
</style>