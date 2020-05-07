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
        <v-container
            class='label-container'
            :style='labelStyle'
        >
            <v-text-field
                v-if='disciplines[selectedDiscip].custom'
                v-model='newDiscipName'
                class='label-discip uncolored'
                height=10
                dense
                rounded
                outlined
                counter=20
                clearable
                :disabled='!disciplines[selectedDiscip].custom'
                :placeholder='disciplines[selectedDiscip].name'
                :color='colors.neutral'
            />
            <v-text-field
                v-else
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
        <v-container>
            <ul class='sub-discip-list'>
                <li
                    class='sub-discipline'
                    v-for='sub in disciplines[selectedDiscip].subDisciplines'
                    :key='sub'
                >
                    {{ sub }}
                </li>
            </ul>
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    
    const DISCIPLINE_ICONS = require.context('../../../../assets/disciplines/journal creation/', false, /\.png$/);
    const DEFAULT_OTHER_DISCIPLINE = 'Other';

    export default {
        data() {
            return {
                selectedDiscip: 0,
                newDiscipName: '',
                disciplines: [
                    {
                        name: 'Firearm',
                        labelWidth: '180px',
                        srcIcon: DISCIPLINE_ICONS('./firearm.png'),
                        custom: false,
                        subDisciplines: [
                            'Pistol',
                            'Air pistol',
                            'Assault rifle',
                            'Air Rifle',
                            'Rapid Fire'
                        ]
                    },
                    {
                        name: 'Archery',
                        labelWidth: '180px',
                        srcIcon: DISCIPLINE_ICONS('./archery.png'),
                        custom: false,
                        subDisciplines: [
                            'Barebow',
                            'Olympic Recurve',
                            'Compound Bow',
                            '3D Archery',
                            'Kyudo (Yumi)',
                            'Crossbow'
                        ]
                    },
                    {
                        name: 'Other',
                        labelWidth: '300px',
                        srcIcon: DISCIPLINE_ICONS('./other.png'),
                        custom: true,
                        subDisciplines: []
                    }
                ]
            }
        },
        created() {
            //store initial value
            this.$store.commit('setNewJournalDiscipline', this.disciplines[this.selectedDiscip].name);

            //set the other discipiline's name
            if (this.disciplines[this.selectedDiscip].custom) {
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
            labelStyle: function() {
                let property = this.disciplines[this.selectedDiscip];

                if (property) {
                    let width = property.labelWidth;
                    return { width }
                }
                else return {};
            }
        },
        watch: {
            selectedDiscip(value) {
                //reset target selection back to 0 if discipline changes
                if (this.storedDiscipline !== this.disciplines[value].name)
                    this.$store.commit('setNewJournalTargetResetFlag', true);
                
                //store discipline name
                let fixedName = this.disciplines[value].name;
                this.$store.commit('setNewJournalDiscipline', fixedName);

                //determine the use of a custom discipline
                let useCustom = this.disciplines[value].custom;
                this.$store.commit('setUseCustomDiscipline', useCustom);
            },
            newDiscipName(value) {
                this.$store.commit('setNewJournalCustomDiscipline', value);
            }
        },
        methods: {
            /**
             * Move to the next discipline in line.
             */
            incrementDiscip: function() {
                if (this.selectedDiscip < this.disciplines.length - 1)
                    this.selectedDiscip++;
            },
            /**
             * Return to the previous viewed discipline.
             */
            decrementDiscip: function() {
                if (this.selectedDiscip > 0)
                    this.selectedDiscip--;
            }
        }
    }
</script>

<style>
    * {
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
    .sub-discipline {
        font-size: 14px;
        color: #00000080;
    }
    .sub-discip-list {
        margin-top: -15px;
        list-style-type: circle;
    }
</style>