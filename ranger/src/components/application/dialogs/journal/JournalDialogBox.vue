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
                    <template v-if='currentTab == 0'>
                        <transition name='fade' mode='out-in'>
                            <select-journal-name />
                        </transition>
                    </template>
                    <template v-else-if='currentTab == 1'>
                        <transition name='fade' mode='out-in'>
                            <select-journal-discipline />
                        </transition>
                    </template>
                    <template v-else-if='currentTab == 2'>
                        <transition name='fade' mode='out-in'>
                            <select-journal-target />
                        </transition>
                    </template>
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
    
    export default {
        components: {
            SelectJournalName,
            SelectJournalDiscipline,
            SelectJournalTarget
        },
        props: [
            'model'
        ],
        data() {
            return {
                currentTab: 0,
                totalTabs: 3
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            }),
            createButtonText() {
                let show = this.currentTab === this.totalTabs - 1;
                return show ? 'CREATE' : '';
            }
        },
        methods: {
            close: function() {
                this.$emit('close');
                this.$store.dispatch('initNewJournalValues');
                
                //let the dialog close completely before tabs reorganization
                let vm = this;
                setTimeout(() => { vm.currentTab = 0 }, 500);
            },
            incrementTab: function() {
                if (this.currentTab < this.totalTabs - 1)
                    this.currentTab++;
            },
            decrementTab: function() {
                if (this.currentTab > 0)
                    this.currentTab--;
            },
            createJournal: function() {
                this.$store.dispatch('createJournal');
                this.close();
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