<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Select a shooting discipline
            </p>
        </v-container>
        <v-row no-gutters>
            <v-icon
                class='nav-arrow'
                size=64
                :color='colors.primary'
                :disabled='selectedDiscip == 0'
                @click='decrementDiscip'
            >
                mdi-menu-left
            </v-icon>
            <v-card
                class='card'
                width=130
                height=130
                outlined
                shaped
            >
                <v-container
                    fill-height
                    fluid
                >
                    <v-row
                        align='center'
                        justify='center'
                    >
                        <v-col>
                            <v-img
                                class='discip-icon'
                                :src='disciplines[selectedDiscip].srcIcon'
                                max-width=90
                                max-height=90
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-icon
                class='nav-arrow'
                size=64
                :color='colors.primary'
                :disabled='selectedDiscip >= disciplines.length - 1'
                @click='incrementDiscip'
            >
                mdi-menu-right
            </v-icon>
        </v-row>
        <v-container class='label-container'>
            <v-text-field
                v-show='disciplines[selectedDiscip].rename'
                v-model='disciplines[selectedDiscip].newName'
                class='label-discip uncolored'
                min-width=100
                max-width=180
                height=10
                dense
                rounded
                outlined
                counter=10
                :disabled='!disciplines[selectedDiscip].rename'
                :placeholder='disciplines[selectedDiscip].name'
                :color='colors.neutral'
            />
            <v-text-field
                v-show='!disciplines[selectedDiscip].rename'
                class='label-discip colored'
                min-width=100
                max-width=180
                height=10
                dense
                rounded
                outlined
                disabled
                :placeholder='disciplines[selectedDiscip].name'
                :background-color='colors.neutral'
                :color='colors.neutral'
            />
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    
    const DISPLINE_ICONS = require.context('../../../../assets/disciplines/', false, /\.png$/);
    const DEFAULT_OTHER_DISCIPLINE = 'Other';

    export default {
        data() {
            return {
                selectedDiscip: 0,
                newDiscipName: '',
                disciplines: {}
            }
        },
        created() {
            //set selector's index
            switch (this.storedDiscipline) {
                case '': 
                case 'Firearm': this.selectedDiscip = 0; break;
                case 'Archery': this.selectedDiscip = 1; break;
                default: this.selectedDiscip = 2;
            }

            //init disciplines object
            this.disciplines = [
                {
                    name: 'Firearm',
                    srcIcon: DISPLINE_ICONS('./firearm.png'),
                    rename: false
                },
                {
                    name: 'Archery',
                    srcIcon: DISPLINE_ICONS('./archery.png'),
                    rename: false
                },
                {
                    name: 'Other:',
                    srcIcon: DISPLINE_ICONS('./other.png'),
                    rename: true
                }
            ];

            //store initial value
            this.$store.commit('setNewJournalDiscipline', this.disciplines[this.selectedDiscip].name);

            //set the other discipiline's name
            if (this.disciplines[this.selectedDiscip].rename) {
                let stored = this.storedOtherDiscipline;
                this.newDiscipName = stored ? stored : DEFAULT_OTHER_DISCIPLINE;
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storedDiscipline: 'getNewJournalDiscipline',
                storedOtherDiscipline: 'getNewJournalOtherDiscipline'
            }),
        },
        watch: {
            selectedDiscip(value) {
                let isOther = this.disciplines[value].rename;

                //consider the renamed discipline's name
                if (isOther) this.$store.commit('setNewJournalDiscipline', this.newDiscipName);
                //consider the fixed discipline's name
                else {
                    let fixedName = this.disciplines[value].name;
                    this.$store.commit('setNewJournalDiscipline', fixedName);
                }
            },
            newDiscipName(value) {
                this.$store.commit('setNewJournalDiscipline', value);
            }
        },
        methods: {
            incrementDiscip: function() {
                if (this.selectedDiscip < this.disciplines.length - 1)
                    this.selectedDiscip++;
            },
            decrementDiscip: function() {
                if (this.selectedDiscip > 0)
                    this.selectedDiscip--;
            },
        }
    }
</script>

<style>
    .subtitle {
        font-family: 'comfortaa';
    }
    .card {
        margin-right: auto;
        margin-left: auto;
        left: 0;
        right: 0;
    }
    .nav-arrow {
        margin: auto;
    }
    .label-container {
        width: 60%;
    }
    .colored input {
        text-align: center;
    }
    .colored input::placeholder {
        color: #FFFFFF !important;
        opacity: 1;
    }
    .discip-icon {
        margin: auto;
    }
</style>