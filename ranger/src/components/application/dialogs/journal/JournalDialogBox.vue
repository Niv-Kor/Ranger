<template>
    <v-dialog 
        :value='model'
        persistent
    >
        <v-card height=480>
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
                    height=260
                    flat
                >
                    <select-journal-discipline v-show='currentTab == 0' />
                    <select-journal-target v-show='currentTab == 1' />
                    <div :key='currentTab'><select-journal-target-config v-show='currentTab == 2' /></div>
                    <select-journal-name v-show='currentTab == 3' />
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
    </v-dialog>
</template>

<script>
    import { mapGetters } from 'vuex';
    import SelectJournalName from './SelectJournalName';
    import SelectJournalDiscipline from './SelectJournalDiscipline';
    import SelectJournalTarget from './SelectJournalTarget';
    import SelectJournalTargetConfig from './SelectJournalTargetConfig';
    
    export default {
        components: {
            SelectJournalName,
            SelectJournalDiscipline,
            SelectJournalTarget,
            SelectJournalTargetConfig
        },
        props: [
            'model'
        ],
        data() {
            return {
                currentTab: 0,
                totalTabs: 4
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalName: 'getNewJournalName',
                useCustomDiscipline: 'useCustomDiscipline',
                useCustomTarget: 'useUploadedCustomTarget',
                customDiscipline: 'getNewJournalCustomDiscipline',
                customTarget: 'getNewJournalUploadedTarget'
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
                let vm = this;
                setTimeout(() => { vm.currentTab = 0 }, 500);
            },
            incrementTab: function() {
                if (!this.canContinueNextTab()) return;

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
                await this.$store.dispatch('createJournal');
                this.close();
            },
            canContinueNextTab: function() {
                switch (this.currentTab) {
                    //select discipline
                    case 0:
                        //need to enter a valid custom discipline name
                        if (this.useCustomDiscipline) {
                            return !!this.customDiscipline;
                        }
                        else return true;

                    //select target
                    case 1:
                        //need to enter a valid custom target
                        if (this.useCustomTarget)
                            return !!this.customTarget.base64Data;
                        else return true;

                    case 2:
                        return true; //TODO

                    case 3:
                        return !!this.journalName;
                }
            }
        }
    }
</script>

<style>
    .head {
        font-size: 30px;
        font-family: 'comfortaa';
        margin-right: auto;
        margin-left: auto;
        padding-right: 20px;
        color: #FFFFFF;
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
</style>