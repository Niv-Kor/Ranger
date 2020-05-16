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
                        <div :key='tabsRefresher + ",0"'> <!-- refresh component after close -->
                            <select-range-time
                                v-show='currentTab == 0'
                                @show-next='showTimeTabNext = true'
                                @loading='activateLoading'
                                @change-tab='setTab'
                            />
                        </div>
                        <div :key='tabsRefresher + ",1"'> <!-- refresh component after close -->
                            <select-range-target
                                v-show='currentTab == 1'
                                @loading='activateLoading'
                                @change-tab='setTab'
                            />
                        </div>
                    </v-card>
                    <v-container>
                        <!-- create button -->
                        <v-btn
                            :class='(currentTab === totalTabs - 1) ? "create-btn" : "create-btn transparent"'
                            block
                            dark
                            elevation=0
                            :disabled='currentTab !== totalTabs - 1'
                            :style="{ backgroundImage: 'url(' + colors.gradient + ')' }"
                            @click='createRange'
                        >
                            {{ createButtonText }}
                        </v-btn>
                        <!-- back and next buttons -->
                        <v-row>
                            <v-btn
                                v-if='currentTab > 0'
                                class='nav-btn'
                                text
                                :color='colors.neutral'
                                @click='decrementTab'
                            >
                                Back
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                v-if='showTimeTabNext && currentTab < totalTabs - 1'
                                class='nav-btn'
                                text
                                :color='colors.primary'
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
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import SelectRangeTime from './SelectRangeTime';
    import SelectRangeTarget from './SelectRangeTarget';
    import Loading from '../../../widgets/Loading';

    export default {
        components: {
            SelectRangeTime,
            SelectRangeTarget,
            Loading
        },
        props: [
            'model'
        ],
        data() {
            return {
                load: false,
                errorDialog: false,
                showTimeTabNext: false,
                tabsRefresher: false,
                errorMessage: '',
                currentTab: 0,
                totalTabs: 2,
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journals: 'getAllJournals',
                ranges: 'getAllRanges',
                journalIndex: 'getSelectedJournalIndex',
                formattedDateTime: 'getNewRangeFormattedDateTime'
            }),
            createButtonText() {
                let show = this.currentTab === this.totalTabs - 1;
                return show ? 'CREATE' : '';
            },
            journal() {
                return this.journals[this.journalIndex];
            }
        },
        watch: {
            model(value) {
                if (value) this.$store.dispatch('initNewRangeValues');
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
                    this.showTimeTabNext = false;
                    this.tabsRefresher = !this.tabsRefresher;
                    this.$store.dispatch('initNewRangeValues');
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
             * Check if the user can continue to the next tab.
             * Only available if the current tab consists of legal input data.
             * 
             * @returns {Boolean} True if the next tab is available.
             */
            canContinueNextTab: async function() {
                return new Promise((resolve, reject) => {
                    switch (this.currentTab) {
                        //select date and time
                        case 0: {
                            let journalId = this.journal.id;
                            let date = this.formattedDateTime;

                            this.$store.dispatch('checkRangeExists', { journalId, date })
                                .then(exists => {
                                    if (exists) {
                                        this.popError('A range with these exact date and time already exists. ' +
                                                    'Delete it first, or use it instead.');

                                        resolve(false);
                                    }
                                    else resolve(true);
                                })

                            break;
                        }
                        //select target
                        case 1:
                            resolve(true);
                            break;

                        default: reject();
                    }
                });
            },
            /**
             * Set a tab to a specific index.
             * 
             * @param {Number} tabIndex - The index of the tab to set
             */
            setTab: function(tabIndex) {
                if (tabIndex === this.currentTab + 1) this.incrementTab();
                else this.currentTab = tabIndex;
            },
            /**
             * Create a new journal based on the user's input.
             * A new journal will be created only if the input is valid.
             */
            createRange: async function() {
                this.load = true;
                let dateTime = this.formattedDateTime
                let res = await this.$store.dispatch('createRange');
                this.load = false;
                this.close();

                //go to to range page
                if (res.success) {
                    this.load = true;
                    await this.$store.dispatch('reloadAllData');
                    this.load = false;

                    //find the index of the newly created range
                    let rangeId = res.id;
                    let rangeIndex = 0;
                    let journalRanges = this.ranges[`journal #${this.journal.id}`]

                    for (let i in journalRanges) {
                        let range = journalRanges[i];

                        if (range.id === rangeId) {
                            rangeIndex = +i;
                            break;
                        }
                    }

                    let path = await this.$store.dispatch('generateRangeURL', {
                        journalName: `${this.journal.discipline}-${this.journal.name}`,
                        date: dateTime
                    });
                    
                    this.$store.commit('setRangeIndex', rangeIndex);
                    this.$router.push(path).catch(() => {});
                }
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
    .error-ok-btn {
        text-transform: none;
    }
</style>