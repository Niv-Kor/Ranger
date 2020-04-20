<template>
    <div>
        <v-dialog 
            :value='model'
            persistent
        >
            <v-card class='main-card' height=580>
                <v-app-bar :color='colors.secondary'>
                    <v-btn
                        class='close-btn'
                        color='gray'
                        x-small
                        fab
                        elevation=4
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
                        New journal
                    </span>
                </v-app-bar>
                <v-container>
                    <v-card
                        class='inner-card'
                        height=360
                        flat
                    >
                        <div v-if='model'> <!-- refresh components after close -->
                            <select-journal-discipline
                                v-show='currentTab == 0'
                                @loading='activateLoading'
                            />
                            <select-journal-target
                                v-show='currentTab == 1'
                                @loading='activateLoading'
                            />
                            <div :key='currentTab'>
                                <select-journal-target-config
                                    v-show='currentTab == 2'
                                    @loading='activateLoading'
                                />
                            </div>
                            <select-journal-name
                                v-show='currentTab == 3'
                                @loading='activateLoading'
                            />
                        </div>
                    </v-card>
                    <v-container>
                        <!-- create button -->
                        <v-btn
                            class='create-btn'
                            :color='colors.primary'
                            block
                            text
                            :disabled='currentTab < totalTabs - 1'
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
                max-width=290
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
            <loading
                :active.sync='load'
                is-full-page
                loader='dots'
                width=100
                height=100
                :color='colors.secondary'
            />
        </v-dialog>
        <v-dialog
                v-model='successDialog'
                max-width=290
            >
                <v-card>
                    <v-card-title
                        class='success-title'
                        :color='colors.primary'
                        :style="{ backgroundColor: colors.primary }"
                    >
                        <p align=center class='success-title-flex'>
                            Journal created successfully!
                        </p>
                    </v-card-title>
                    <v-container>
                        <div
                            class='success-details'
                            align='center'
                        >
                            <p align=left>
                                <span class='details-header'>
                                    Name:<br>
                                </span>
                                <span :style="{ color: colors.primary }">
                                    {{ lastCreatedName }}
                                </span>
                                <br><br>
                                <span class='details-header'>
                                    Discipline:<br>
                                </span>
                                <span :style="{ color: colors.primary }">
                                    {{ lastCreatedDiscipline }}
                                </span>
                            </p>
                        </div>
                    </v-container>
                    <v-card-actions>
                        <v-btn
                            class='success-ok-btn'
                            text
                            block
                            :color='colors.primaryDark'
                            @click="errorDialog = false"
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
    import SelectJournalName from './SelectJournalName';
    import SelectJournalDiscipline from './SelectJournalDiscipline';
    import SelectJournalTarget from './SelectJournalTarget';
    import SelectJournalTargetConfig from './SelectJournalTargetConfig';
    import Loading from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';
    
    export default {
        components: {
            SelectJournalName,
            SelectJournalDiscipline,
            SelectJournalTarget,
            SelectJournalTargetConfig,
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
                totalTabs: 4,
                lastCreatedName: '',
                lastCreatedDiscipline: ''
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
            }
        },
        watch: {
            model(value) {
                if (value) this.$store.dispatch('initNewJournalValues');
            }
        },
        methods: {
            close: async function() {
                this.$emit('close');
                
                //let the dialog close completely before tabs reorganization
                setTimeout(() => {
                    this.currentTab = 0;
                    this.$store.dispatch('initNewJournalValues');
                }, 100);
            },
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
            decrementTab: function() {
                if (this.currentTab > 0) {
                    if (this.currentTab != 3 || this.useCustomTarget) this.currentTab--;
                    else this.currentTab -= 2; //skip custom target config
                }
            },
            createJournal: async function() {
                if (!this.journalName) {
                    this.popError('Enter the journal\'s name');
                    return;
                }
                else {
                    this.load = true;
                    await this.$store.dispatch('createJournal');
                    this.load = false;

                    //triggers a confirmation dialog
                    setTimeout(() => {
                        this.lastCreatedName = this.journalName;
                        this.lastCreatedDiscipline = this.discipline;
                        this.successDialog = true;
                    }, 1000);

                    this.close();
                }
            },
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
                                        this.$store.dispatch('checkTargetExists', this.customTarget.chosenName)
                                            .then(res => {
                                                if (res) this.popError('A target for \'' + this.discipline + '\'' +
                                                                       'with that name already exists');

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

                        //select journal name
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

                                let exists = this.$store.dispatch('checkJournalExists', name);
                                if (exists) this.popError('A journal with that name already exists');
                                resolve(!exists);
                            }

                            resolve(true);
                            break;
                        
                        default: reject();
                    }
                });
            },
            popError: function(message) {
                this.errorDialog = true;
                this.errorMessage = message;
            },
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
    }
    .fade-enter {
        opacity: 0;
    }
    .fade-enter-active {
        transition: opacity .08s;
    }
    .fade-leave-active {
        transition: opacity .08s;
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
        font-size: 24px;
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