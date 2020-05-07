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
                        new journal
                    </span>
                </v-app-bar>
                <v-container>
                    <v-card
                        class='inner-card'
                        :height=360
                        flat
                    >
                        <div v-if='model'>
                            <journal-creation-discipline-page
                                v-show='currentTab == 0'
                                @loading='activateLoading'
                            />
                            <journal-creation-target-page
                                v-show='currentTab == 1'
                                @loading='activateLoading'
                            />
                            <div :key='currentTab + ",2"'> <!-- refresh component after close -->
                                <journal-creation-target-config-page
                                    v-show='currentTab == 2'
                                    @loading='activateLoading'
                                />
                            </div>
                            <journal-creation-theme-page
                                v-show='currentTab == 3'
                                @loading='activateLoading'
                            />
                            <div :key='currentTab + ",4"'> <!-- refresh component after close -->
                                <journal-creation-preview
                                    v-show='currentTab == 4'
                                    @loading='activateLoading'
                                    @change-tab='setTab'
                                />
                            </div>
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
    import JournalCreationThemePage from './JournalCreationThemePage';
    import JournalCreationDisciplinePage from './JournalCreationDisciplinePage';
    import JournalCreationTargetPage from './JournalCreationTargetPage';
    import JournalCreationTargetConfigPage from './JournalCreationTargetConfigPage';
    import JournalCreationPreview from './JournalCreationPreview';
    import Loading from '../../../widgets/Loading';

    export default {
        components: {
            JournalCreationThemePage,
            JournalCreationDisciplinePage,
            JournalCreationTargetPage,
            JournalCreationTargetConfigPage,
            JournalCreationPreview,
            Loading
        },
        props: {
            /**
             * The model of the dialog component (show or hide).
             */
            model: {
                type: Boolean,
                required: true,
            },
            /**
             * Either allow or stall the success popup dialog if it's meant to pop.
             * If the dialog is suppose to pop while not allowed, it will pop the moment it is.
             */
            allowSuccessPopup: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                load: false,
                errorDialog: false,
                successDialog: false,
                errorMessage: '',
                currentTab: 0,
                totalTabs: 5,
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
            successDialogModel: {
                get() { return this.successDialog && this.$props.allowSuccessPopup; },
                set(value) { this.successDialog = value; }
            }
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
            setTab: function(tabIndex) {
                if (tabIndex === this.currentTab + 1) this.incrementTab;
                else this.currentTab = tabIndex;
            },
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
                    setTimeout(() => this.successDialog = true, 1000);

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
                return new Promise((resolve, reject) => {
                    switch (this.currentTab) {
                        //select discipline
                        case 0:
                            //need to enter a valid custom discipline name
                            if (this.useCustomDiscipline) {
                                let name = this.customDiscipline;

                                //name is empty
                                if (!name) {
                                    this.popError('Enter the name of your range\'s discipline');
                                    resolve(false);
                                }
                                else {
                                    let regex = this.regex.disciplineName;

                                    if (!regex.expression.test(name)) {
                                        this.popError(regex.message);
                                        resolve(false);
                                    }
                                }
                            }
                            
                            resolve(true);
                            break;

                        //select target
                        case 1:
                            //need to enter a valid custom target
                            if (this.useCustomTarget) {
                                if (!this.customTarget.base64Data) {
                                    this.popError('You need to upload an image of your target');
                                    resolve(false);
                                }
                                else if (!this.customTarget.chosenName) {
                                    this.popError('Enter the target\'s name');
                                    resolve(false);
                                }
                                else {
                                    let regex = this.regex.targetName;
                                    let name = this.customTarget.chosenName;

                                    if (!regex.expression.test(name)) {
                                        this.popError(regex.message);
                                        resolve(false);
                                    }
                                    else {
                                        this.$store.dispatch('checkTargetExists', name)
                                            .then(res => {
                                                if (res) this.popError('A target with that name already exists');
                                                resolve(!res);
                                            });
                                    }
                                }
                            }
                            else resolve(true);
                            break;
                        
                        //configure custom target
                        case 2:
                            if (!this.customTarget.center) {
                                this.popError('You must mark the target\'s bullseye point');
                                resolve(false)
                            }

                            resolve(true);
                            break;

                        //select journal theme
                        case 3:
                            if (!this.journalName) {
                                this.popError('Enter the journal\'s name');
                                resolve(false);
                            }
                            else {
                                let regex = this.regex.journalName;
                                let name = this.journalName;

                                if (!regex.expression.test(name)) {
                                    this.popError(regex.message);
                                    resolve(false);
                                }

                                this.$store.dispatch('checkJournalExists', name)
                                    .then(res => {
                                        if (res) this.popError('A journal with that name already exists');
                                        resolve(!res);
                                    })
                            }

                            break;

                        case 4:
                            resolve(true)
                            break;
                        
                        default: reject();
                    }
                });
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
        overflow-x: hidden;
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
    .success-ok-btn {
        text-transform: none;
    }
    .error-ok-btn {
        text-transform: none;
    }
</style>