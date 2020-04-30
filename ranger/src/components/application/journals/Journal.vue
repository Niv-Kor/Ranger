<template>
    <v-container
        class='container'
        fluid
    >
        <h1>{{ journal.name }}</h1>
        <v-row no-gutters class='mb-1'>
            <v-col>
                <v-btn
                    class='calendar-btn'
                    block
                    :height='40'
                    :width='windowDim.width * .4'
                    :color='colors.primary'
                    @click='toggleDatePicker'
                >
                    <v-icon
                        medium
                        color='white'
                    >
                        mdi-calendar-clock
                    </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row no-gutters>
            <v-col>
                <v-card
                    class='outer-card'
                    :height='windowDim.height - 350'
                    :width='windowDim.width * .9'
                    :style="{ borderColor: colors.primary + '50' }"
                    elevation=0
                >
                    <transition name='slide' mode='in-out'>
                        <v-date-picker
                            v-if='datePicker'
                            v-model='datePickerModel' 
                            first-day-of-week=0
                            full-width
                            scrollable
                            :color='colors.secondary'
                            @click:date='toggleDatePicker'
                        />
                    </transition>
                    <transition transition name='fade' mode='in-out'>
                        <v-list
                            v-if='showRanges'
                            class='ranges-list'
                            tile
                            nav
                            flat
                            dense
                        >
                            <v-list-item
                                v-for='(item, index) in list'
                                :key='item.date'
                                :index='index'
                                class='range-item elevation-3'
                                :style='createItemStyle(item.hour)'
                                :selectable=false
                            >
                                <v-list-item-content>
                                    <v-card-title
                                        class='card-title'
                                        :style='{ color: getCardTextColor(item.hour) }'
                                    >
                                        {{ item.date }}
                                        <span
                                            :style='{
                                                fontSize: "14px",
                                                marginLeft: "10px",
                                                marginTop: "3px"
                                            }'
                                        >
                                            {{ item.hour }}:00
                                        </span>
                                    </v-card-title>
                                    <br>
                                    <v-card-text
                                        class='card-text'
                                    >
                                        <span
                                            :style='{
                                                color: getScoreColor(item.score, item.total),
                                                filter: "drop-shadow(0 0 10px #00ffff)",
                                                fontWeight: "bold"
                                            }'
                                        >
                                            {{ item.score }}
                                        </span>
                                        <span :style='{ color: "#000000" }'>
                                            / {{ item.total }}
                                        </span>
                                    </v-card-text>
                                </v-list-item-content>
                                <v-list-item-avatar
                                    class='card-left'
                                    size=70
                                    :right=true
                                >
                                    <v-img :src='src' />
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-list>
                    </transition>                        
                </v-card>
                <v-card
                    class='control-line'
                    :height='30'
                    :width='windowDim.width * .9'
                    :color='colors.primary'
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <plus-button
                    class='plus'
                    @click='openRangeCreationDialog'
                />
                <range-dialog-box
                    :model="createRangeModel"
                    @close='createRangeModel = false'
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';
    import PlusButton from '../../widgets/PlusButton';
    import RangeDialogBox from '../dialogs/range/RangeDialogBox';

    const FITA_TARGET = require.context('../../../assets/targets/small/archery/', false, /\.png$/)
    const JOURNAL_ASSETS = require.context('../../../assets/disciplines/journal card/', false, /\.png|\.jpg$/);
    const RANGES_CONTEXT = require.context('../../../assets/ranges/', false, /\.png$/)
    const THREE = require('three');

    export default {
        components: {
            PlusButton,
            RangeDialogBox
        },
        data() {
            return {
                windowDim: {
                    width: 0,
                    height: 0
                },
                datePicker: false,
                toggleDelay: false,
                showRanges: true,
                createRangeModel: false,
                datePickerModel: new Date().toISOString().substr(0, 10),
                list: [
                    {
                        date: '16 - 04 - 20',
                        score: 272,
                        total: 300,
                        hour: 2
                    },
                    {
                        date: '12 - 04 - 20',
                        score: 261,
                        total: 280,
                        hour: 5
                    },
                    {
                        date: '09 - 04 - 20',
                        score: 271,
                        total: 300,
                        hour: 8
                    },
                    {
                        date: '02 - 04 - 20',
                        score: 249,
                        total: 1700,
                        hour: 11
                    },
                    {
                        date: '18 - 03 - 20',
                        score: 143,
                        total: 300,
                        hour: 15
                    },
                    {
                        date: '12 - 03 - 20',
                        score: 290,
                        total: 300,
                        hour: 18
                    },
                    {
                        date: '04 - 03 - 20',
                        score: 265,
                        total: 270,
                        hour: 21
                    }
                ],
                skyColors: [
                    [0x19042a, 0x357eec],
                    [0x56c5ff, 0x00a7ff],
                    [0x56c5ff, 0x115499],
                    [0x061647, 0x020611]
                ]
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalIndex: 'getSelectedJournalIndex',
                journals: 'getAllJournals'
            }),
            journal() {
                return this.journals[this.journalIndex];
            },
            outerCardClass() {
                let className = 'outer-card';
                return !this.toggleDelay ? className : className + ' overflow-hidden';
            },
            src() {
                return FITA_TARGET("./FITA.png");
            }
        },
        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
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
             * Toggle the date picker window.
             */
            toggleDatePicker: function() {
                if (this.toggleDelay) return;
                this.toggleDelay = true;

                //toggle from ranges to calendar
                if (this.showRanges) {
                    this.showRanges = false;
                    setTimeout(() => {
                        this.datePicker = true;
                        this.toggleDelay = false;
                    }, 200);
                }
                //toggle from calendar to ranges
                else {
                    this.datePicker = false;
                    setTimeout(() => {
                        this.showRanges = true;
                        this.toggleDelay = false;
                    }, 500);
                }
            },
            getScoreColor: function(score, total) {
                let percent = score / total;
                let zeroScore = new THREE.Color('#b70000');
                let fullScore = new THREE.Color('#11b700');
                let lerpedColor = zeroScore.lerp(fullScore, percent);
                return `#${lerpedColor.getHexString()}`;
            },
            /**
             * Get the appropriate style for a journal card.
             * 
             * @param {int} hour - The hour of the day (0 to 24)
             * @returns {Object} {
             *                      {String} backgroundImage - CSS attribute for background image,
             *                      {String} backgroundSize - CSS attribute for background size,
             *                      {String} backgroundPosition - CSS attribute for background position
             *                   }
             */
            createItemStyle: function(hour) {
                let colorRange = [];
                let hoursRange = [];
                let grassLight = '';
                let useFlare = false;
                hour = parseInt(hour);

                if (hour === 5 || hour === 6) {
                    colorRange = this.skyColors[0];
                    hoursRange = [5, 6];
                    grassLight = 'light'
                }
                else if (hour > 6 && hour <= 16) {
                    colorRange = this.skyColors[1];
                    hoursRange = [7, 16];
                    grassLight = 'dark'
                    useFlare = true;
                }
                else if (hour > 16 && hour <= 18) {
                    colorRange = this.skyColors[2];
                    hoursRange = [17, 18];
                    grassLight = 'dark'
                }
                else if ((hour > 18 && hour <= 24) || (hour >= 0 && hour < 5)) {
                    colorRange = this.skyColors[3];
                    hoursRange = [19, 4];
                    grassLight = 'light'
                }

                let dayPercent = (hour - hoursRange[0]) / (hoursRange[1] - hoursRange[0]);
                let minColor = new THREE.Color(colorRange[0]);
                let maxColor = new THREE.Color(colorRange[1]);
                let skyColor = minColor.lerp(maxColor, dayPercent).getHexString();

                let grass = 'url(' + RANGES_CONTEXT(`./grass_${grassLight}.png`) + ')';
                let stars = 'url(' + RANGES_CONTEXT(`./stars.png`) + ')';
                let flare = 'url(' + RANGES_CONTEXT(`./flare.png`) + ')';
                let hourGradient = 'linear-gradient(to right, #' + skyColor + ' ' + 60 + '%, #000000bb ' + 120 + '%)';
                let scoreLine = 'linear-gradient(to right, #ffffff ' + 40 + '%, #00000000 ' + 100 + '%)';
                let rangerPattern = 'url(' + JOURNAL_ASSETS('./ranger_pattern.png') + ')';
                let data = [
                    {   //base image behind the sky
                        image: grass,
                        size: 'auto auto',
                        pos: '0 0',
                        condition: true
                    },
                    {   //base image behind the sky
                        image: stars,
                        size: 'auto auto',
                        pos: '0 0',
                        condition: true
                    },
                    {   //sun flare effect
                        image: flare,
                        size: 'auto auto',
                        pos: '0 0',
                        condition: useFlare
                    },
                    {   //3-color ranger patter
                        image: rangerPattern,
                        size: 'auto 20px',
                        pos: '0 77px',
                        condition: true
                    },
                    {   //a white line behind the range results
                        image: scoreLine,
                        size: this.windowDim.width * .6 + 'px 20px',
                        pos: '0 77px',
                        condition: true
                    },
                    {   //color of the sky based on the hour of the day
                        image: hourGradient,
                        size: 'auto auto',
                        pos: '0 0',
                        condition: true
                    }
                ]

                let images = '';
                let sizes = '';
                let positions = '';

                for (let i in data) {
                    let bg = data[i];

                    if (bg.condition) {
                        let comma = (i < data.length - 1) ? ',' : '';

                        images += bg.image + comma;
                        sizes += bg.size + comma;
                        positions += bg.pos + comma;
                    }
                }

                return {
                    backgroundImage: images,
                    backgroundSize: sizes,
                    backgroundPosition: positions,

                }
            },
            /**
             * Get the appropriate text color, according to the card's background color.
             */
            getCardTextColor: function(hour) {
                if (hour === 5 || hour === 6) return '#ffffff';
                else if (hour > 6 && hour <= 16) return '#000000';
                else if (hour > 16 && hour < 18) return '#000000';
                else return '#ffffff';
            },
            openRangeCreationDialog: function() {
                this.createRangeModel = true;
                this.$store.dispatch('initNewRangeValues');
            }
        }
    }
</script>

<style scoped>
    .container {
        text-align: center;
        font-family: 'Comfortaa';
    }
    .calendar-btn {
        margin-top: 20px;
    }
    .outer-card {
        border-width: 1px;
        border-style: none dashed none dashed;
        overflow: auto;
    }
    .slide-enter-active {
        animation: slide-in .5s ease-out forwards;
    }
    .slide-leave-active {
        animation: slide-out .5s ease-out forwards;
        opacity: 0;
    }
    @keyframes slide-in {
        from {
            transform: translateY(-300px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slide-out {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-300px);
            opacity: 0;
        }
    }
    .fade-enter-active {
        animation: fade-in .5s ease-out forwards;
    }
    .fade-leave-active {
        animation: fade-out .2s ease-out forwards;
        /* opacity: 0; */
    }
    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes fade-out {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    .ranges-list {
        list-style-type: none;
        overflow-y: hidden;
    }
    .range-item {
        margin: 10px 0 10px 0;
    }
    .overflow-hidden {
        overflow-y: hidden;
    }
    .hor-score-line {
        background-position: 0 0;
        background-size: 100px 20px;
        background-color: #ffffff;
    }
    .plus {
        position: fixed;
        margin: auto;
        left: 0;
        right: 0;
        bottom: 40px;
    }
</style>