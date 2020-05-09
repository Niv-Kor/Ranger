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
                        new target
                    </span>
                </v-app-bar>
                <v-container>
                    <v-card
                        class='inner-card'
                        :height=360
                        flat
                    >
                        <div v-if='model'>
                            <target-creation-upload-page
                                v-show='currentTab == 0'
                                @loading='activateLoading'
                            />
                            <div :key='currentTab + ",1"'> <!-- refresh component after close -->
                                <target-creation-config-page
                                    v-show='currentTab == 1'
                                    @loading='activateLoading'
                                />
                            </div>
                            <div :key='currentTab + ",2"'> <!-- refresh component after close -->
                                <target-creation-preview
                                    v-show='currentTab == 2'
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
                            @click='createTarget'
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
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import Loading from '../../../../widgets/Loading';
    import TargetCreationUploadPage from './TargetCreationUploadPage';
    import TargetCreationConfigPage from './TargetCreationConfigPage';
    import TargetCreationPreview from './TargetCreationPreview';

    export default {
        components: {
            Loading,
            TargetCreationUploadPage,
            TargetCreationConfigPage,
            TargetCreationPreview
        },
        props: {
            /**
             * The model of the dialog component (show or hide).
             */
            model: {
                type: Boolean,
                required: true,
            }
        },
        data() {
            return {
                load: false,
                errorDialog: false,
                errorMessage: '',
                currentTab: 0,
                totalTabs: 3,
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                regex: 'getNewJournalRegex',
                targetBase64: 'getNewTargetData',
                targetName: 'getNewTargetName',
                targetCenter: 'getNewTargetCenter'
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
                if (value) this.$store.dispatch('initNewTargetValues');
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
                    this.$store.dispatch('initNewTargetValues');
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
                else if (this.currentTab < this.totalTabs - 1) this.currentTab++;
            },
            /**
             * Return to the previous viewed tab.
             */
            decrementTab: function() {
                if (this.currentTab > 0) this.currentTab--;
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
             * Create a new target based on the user's input.
             * A new target will be created only if the input is valid.
             */
            createTarget: async function() {
                this.load = true;
                let success = await this.$store.dispatch('createTarget');

                if (!success) {
                    this.load = false;
                    this.popError(`Could not create the target '${this.$props.target.name}'. ` +
                                  `Please try again later.`);
                }
                else {
                    this.close();
                    await this.$store.dispatch('loadAllTargets');
                    setTimeout(() => this.$emit('success', 'Target created successfully!'), 1000);
                    this.load = false;
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
                        //updload image
                        case 0:
                            //need to enter a valid custom target
                            if (!this.targetBase64) {
                                this.popError('You need to upload an image of your target');
                                resolve(false);
                            }
                            else if (!this.targetName) {
                                this.popError('Enter the target\'s name');
                                resolve(false);
                            }
                            else {
                                let regex = this.regex.targetName;

                                if (!regex.expression.test(this.targetName)) {
                                    this.popError(regex.message);
                                    resolve(false);
                                }
                                else {
                                    this.$store.dispatch('checkTargetExists', this.targetName)
                                        .then(res => {
                                            if (res) this.popError('A target with that name already exists');
                                            resolve(!res);
                                        });
                                }
                            }
                            break;

                        //configure target
                        case 1:
                            if (!this.targetCenter) {
                                this.popError('You must mark the target\'s bullseye point');
                                resolve(false)
                            }

                            resolve(true);
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
    .error-ok-btn {
        text-transform: none;
    }
</style>