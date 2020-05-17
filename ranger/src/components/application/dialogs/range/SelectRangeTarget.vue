<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Which one is your target?
            </p>
        </v-container>
        <v-row no-gutters>
            <fa-icon
                class='nav-arrow left'
                icon='angle-left'
                :color='colors.primary'
                size='3x'
                :disabled='selectedTargetIndex == 0'
                @click='decrementTarget'
            />
            <v-card
                class='card'
                id='card'
                width=160
                height=160
                outlined
                shaped
                color='blue-grey lighten-5'
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
                                class='thumbnail'
                                :src='selectedTarget.base64Data'
                                max-width=120
                                max-height=120
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <fa-icon
                class='nav-arrow right'
                icon='angle-right'
                :color='colors.primary'
                size='3x'
                :disabled='selectedTargetIndex >= targets.length - 1'
                @click='incrementTarget'
            />
        </v-row>
        <v-container :style='{ width: 230 + "px" }'>
            <v-row>
                <v-text-field
                    class='label-target'
                    :min-width='100'
                    :height='10'
                    dense
                    rounded
                    outlined
                    disabled
                    :placeholder='selectedTarget.name'
                />
            </v-row>
            <v-row>
                <p
                    v-if='selectedTargetIndex === 0'
                    class='default-label'
                    align='center'
                    :style='{ color: colors.primary }'
                >
                    default
                </p>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import Moment from 'moment';
    
    export default {
        data() {
            return {
                selectedTargetIndex: 0,
                targets: []
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storeTargets: 'getAllTargets',
                journals: 'getAllJournals',
                journalIndex: 'getSelectedJournalIndex'

            }),
            journal() {
                return this.journals[this.journalIndex];
            },
            selectedTarget() {
                return this.targets[this.selectedTargetIndex];
            }
        },
        created() {
            //sort targets and put the default one first
            let defTargetId = this.journal.target.id;
            this.targets = this.storeTargets.filter(x => x.active);
            this.targets.sort((el1, el2) => {
                if (el1.id === defTargetId) return -1;
                else {
                    if (el1.discipline === el2.discipline && !el1.discipline) {
                        let creationDate1 = Moment(el1.creationDate, 'YYYY-MM-DD HH:mm:ss');
                        let creationDate2 = Moment(el2.creationDate, 'YYYY-MM-DD HH:mm:ss');
                        return creationDate1.isAfter(creationDate2) ? -1 : 1;
                    }
                    return 0;
                }
            })

            //set range target as default to begin with
            this.$store.commit('setNewRangeSelectedTargetId', defTargetId);
        },
        watch: {
            selectedTargetIndex(value) {
                let targetId = this.targets[value].id;
                this.$store.commit('setNewRangeSelectedTargetId', targetId);
            }
        },
        methods: {
            /**
             * Move to the next target in line.
             */
            incrementTarget: function() {
                if (this.selectedTargetIndex < this.targets.length - 1)
                    this.selectedTargetIndex++;
            },
            /**
             * Return to the previous viewed target.
             */
            decrementTarget: function() {
                if (this.selectedTargetIndex > 0)
                    this.selectedTargetIndex--;
            }
        }
    }
</script>

<style scoped>
    * {
        font-family: 'Comfortaa';
    }
    .nav-arrow {
        margin: auto;
    }
    .nav-arrow.left {
        margin-right: -10px;
    }
    .nav-arrow.right {
        margin-left: -10px;
    }
    .default-label {
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        margin-top: -12px;
        left: 0;
        right: 0;
        font-size: 14px;
    }
    .label-target >>> input::placeholder {
        text-align: center;
    }
    .thumbnail {
        margin: auto;
    }
</style>