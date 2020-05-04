<template>
    <div>
        <v-row no-gutters>
            <v-col>
                <v-card
                    class='outer-card'
                    :width='windowDim.width * .93'
                    :height='windowDim.height * .9'
                    elevation=1
                >
                    <!-- name -->
                    <h4>Name</h4>
                    <v-text-field
                        v-model='newName'
                        class='name'
                        height=30
                        dense
                        counter=15
                        clearable
                        :color='colors.neutral'
                    />
                    <!-- discipline -->
                    <h4>Discipline</h4>
                    <v-select
                        v-model='selectedDiscipline'
                        class='discipline-selector'
                        :items='allDisciplines'
                        :height='-30'
                        label='Change Discipline'
                        outlined
                        :menu-props='{ top: false, offsetY: true }'
                    />
                    <v-text-field
                        v-if='selectedDiscipline === "Other"'
                        v-model='newDiscipName'
                        class='other-discipline'
                        height=30
                        dense
                        counter=20
                        clearable
                        placeholder='Enter a discipline name'
                        :color='colors.neutral'
                    />
                    <!-- default target -->
                    <h4>Default Target</h4>
                    <v-row no-gutters>
                        <v-icon
                            class='nav-arrow'
                            size=64
                            :color='colors.primary'
                            :disabled='selectedTargetIndex == 0'
                            @click='decrementTarget'
                        >
                            mdi-menu-left
                        </v-icon>
                        <v-card
                            class='targets-card'
                            :width=160
                            :height=160
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
                                            class='target-thumbnail'
                                            :src='selectedTarget.base64Data'
                                            max-width=120
                                            max-height=120
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card>
                        <v-icon
                            class='nav-arrow'
                            size=64
                            :color='colors.primary'
                            :disabled='selectedTargetIndex >= targets.length - 1'
                            @click='incrementTarget'
                        >
                            mdi-menu-right
                        </v-icon>
                    </v-row>
                    <p
                        class='target-label'
                        align='center'
                    >
                        <span>{{ selectedTarget.name }}</span>
                        <span
                            class='default-label'
                            :style='{ color: colors.primary }'
                        >
                            as default
                        </span>
                    </p>
                    <!-- theme -->
                    <h4>Color Theme</h4>
                    <v-card
                        elevation=0
                    >
                        <ul class='color-list'>
                            <li
                                class='color-list-item'
                                v-for='color in palette'
                                :key='color'
                            >
                                <v-icon
                                    class='color-icon'
                                    :color='color'
                                    :style='createIconStyle(color)'
                                    @click='selectedColor = color'
                                >
                                    mdi-checkbox-blank
                                </v-icon>
                            </li>
                        </ul>
                    </v-card>
                    <!-- dangerous options -->
                    <v-btn>
                        Clear
                    </v-btn>
                    <v-btn>
                        Delete
                    </v-btn>
                    <!-- save -->
                    <v-btn
                        @click='revert'
                    >
                        Revert
                    </v-btn>
                    <v-btn>
                        Save
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                windowDim: {
                    width: 0,
                    height: 0
                },
                newName: '',
                selectedDiscipline: '',
                newDiscipName: '',
                selectedColor: '',
                selectedTargetIndex: 0,
                targets: []
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journals: 'getAllJournals',
                storeTargets: 'getAllTargets',
                selectedIndex: 'getSelectedJournalIndex',
                palette: 'getNewJournalColorPalette'
            }),
            journal() {
                return this.journals[this.selectedIndex];
            },
            selectedTarget() {
                return this.targets[this.selectedTargetIndex];
            },
            allDisciplines() {
                let list = [];

                for (let journal of this.journals) {
                    let discip = journal.discipline;
                    if (!list.includes(discip)) list.push(discip);
                }
                
                list.sort();
                list.push('Other');
                return list;
            }
        },
        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
            this.revert();
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize);
        },
        methods: {
            /**
             * Activate when the window's size is changing.
             * Save the new size.
             */
            handleResize: function() {
                this.windowDim.width = window.innerWidth;
                this.windowDim.height = window.innerHeight;
            },
            /**
             * Create the appropriate style for a color icon.
             * 
             * @param {String} color - A hex representation of the selected color
             * @returns {Object} {
             *                      {String} borderColor - CSS attribute for border-color
             *                   }
             */
            createIconStyle(color) {
                let borderAlpha = (this.selectedColor === color) ? 'bb' : '20';
                return { borderColor: '#000000' + borderAlpha }
            },
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
            },
            /**
             * Return all values in the form to their default states.
             */
            revert() {
                //sort targets and put the default one first
                let defTargetId = this.journal.target.id;
                this.targets = this.storeTargets;
                this.targets.sort(element => {
                    if (element.id === defTargetId) return -1;
                    else return 0;
                })

                this.newName = this.journal.name;
                this.selectedDiscipline = this.journal.discipline;
                this.selectedTargetIndex = 0;
                this.selectedColor = this.journal.color;
            }
        }
    }
</script>

<style scoped>
    .outer-card {
        border-width: 1px;
        border-style: dashed none;
    }
    .discipline-selector {
        margin-top: 50px;
    }
    .color-list {
        list-style-type: none;
    }
    .color-list-item {
        display: inline;
    }
    .color-icon {
        border-width: 1px;
        border-color: #00000020;
        border-style: solid;
        border-radius: 15%;
        margin: 2px;
    }
    .label-target >>> input::placeholder {
        text-align: center;
    }
    .nav-arrow {
        margin: auto;
    }
    .target-thumbnail {
        margin: auto;
    }
</style>