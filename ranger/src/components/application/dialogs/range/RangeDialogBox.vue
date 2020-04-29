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
                            @show-next='showTimeTabNext = true'
                            @loading='activateLoading'
                            @change-tab='setTab'
                        />
                        <select-range-target
                            v-show='currentTab == 1'
                            @loading='activateLoading'
                            @change-tab='setTab'
                        />
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
                showTimeTabNext: false,
                currentTab: 0,
                totalTabs: 2,
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            }),
            createButtonText() {
                let show = this.currentTab === this.totalTabs - 1;
                return show ? 'CREATE' : '';
            },
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
             * Set a tab to a specific index.
             * 
             * @param {Number} tabIndex - The index of the tab to set
             */
            setTab: function(tabIndex) { this.currentTab = tabIndex; },
            /**
             * Create a new journal based on the user's input.
             * A new journal will be created only if the input is valid.
             */
            createRange: async function() {
                this.load = true;
                await this.$store.dispatch('createRange');
                this.load = false;
                this.close();
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
</style>