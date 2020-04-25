<template>
    <v-container
        class='container'
        fluid
    >
        <h1>{{ journal.name }}</h1>
        <v-row no-gutters>
            <v-col>
                <v-btn
                    class='calendar-btn'
                    block
                    :height='40'
                    :width='windowDim.width * .8'
                    :color='colors.primary'
                    @click='toggleDatePicker'
                >
                    <p></p>
                    <v-icon
                        medium
                        color='white'
                    >
                        mdi-calendar-clock
                    </v-icon>
                </v-btn>
                <v-card
                    class='outer-card'
                    :height='windowDim.height - 320'
                    :width='windowDim.width * .9'
                    :style="{ borderColor: colors.primary + '50' }"
                    elevation=0
                >
                    <transition name='slide' mode='in-out'>
                        <v-date-picker
                            v-if='datePicker'
                            v-model='pickerModel' 
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
                                class='journal-item elevation-3'
                                :style='createItemStyle(item.hour)'
                                :selectable=false
                            >
                                <v-list-item-content>
                                    <v-card-title
                                        class='card-title'
                                        :style='{ color: getCardTextColor(item.hour) }'
                                    >
                                        {{ item.date }} {{ item.hour }}:00
                                    </v-card-title>
                                    <br>
                                    <v-card-text
                                        class='card-text'
                                        :style='{ color: getCardTextColor(item.hour) }'
                                    >
                                        {{ item.score }}
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
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';

    const FITA_TARGET = require.context('../../../assets/targets/small/archery/', false, /\.png$/)
    const RANGES_CONTEXT = require.context('../../../assets/ranges/', false, /\.png$/)

    export default {
        data() {
            return {
                windowDim: {
                    width: 0,
                    height: 0
                },
                datePicker: false,
                toggleDelay: false,
                showRanges: true,
                pickerModel: new Date().toISOString().substr(0, 10),
                list: [
                    {
                        date: '16/4/20',
                        score: '272/300',
                        hour: 2
                    },
                    {
                        date: '12/4/20',
                        score: '261/300',
                        hour: 5
                    },
                    {
                        date: '09/4/20',
                        score: '271/300',
                        hour: 8
                    },
                    {
                        date: '02/4/20',
                        score: '249/300',
                        hour: 11
                    },
                    {
                        date: '18/3/20',
                        score: '243/300',
                        hour: 15
                    },
                    {
                        date: '12/3/20',
                        score: '290/300',
                        hour: 18
                    },
                    {
                        date: '04/3/20',
                        score: '265/300',
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
            rangeItemClass() {
                let className = 'range-item';
                return this.showRanges ? className : className + ' transparent';
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
                //prevent opening the window again before fully closing it
                if (!this.datePicker && this.toggleDelay) return;

                if (this.datePicker) {
                    setTimeout(() => {
                        this.showRanges = true;
                        this.toggleDelay = false;
                    }, 500);
                }
                else this.showRanges = false;

                this.datePicker = !this.datePicker
                this.toggleDelay = true;
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

                const THREE = require('three')

                let dayPercent = (hour - hoursRange[0]) / (hoursRange[1] - hoursRange[0]);
                let minColor = new THREE.Color(colorRange[0]);
                let maxColor = new THREE.Color(colorRange[1]);
                let skyColor = minColor.lerp(maxColor, dayPercent).getHexString();

                let baseBackground = 'url(' + RANGES_CONTEXT(`./range_card_${grassLight}.png`) + ')';
                let hourGradient = 'linear-gradient(to top, #' + skyColor + ' ' + 50 + '%, #' + skyColor + ' ' + 50 + '%)';
                let data = [
                    {   //base image behind the sky
                        image: baseBackground,
                        size: 'auto auto',
                        pos: '0 0'
                    },
                    {   //color of the sky based on the hour of the day
                        image: hourGradient,
                        size: 'auto auto',
                        pos: '0 0'
                    }
                ]

                let images = '';
                let sizes = '';
                let positions = '';

                for (let i in data) {
                    let bg = data[i];
                    let comma = (i < data.length - 1) ? ',' : '';

                    images += bg.image + comma;
                    sizes += bg.size + comma;
                    positions += bg.pos + comma;
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
            getCardTextColor(hour) {
                if (hour === 5 || hour === 6) return '#ffffff';
                else if (hour > 6 && hour <= 16) return '#000000';
                else if (hour > 16 && hour < 18) return '#000000';
                else return '#ffffff';
            },
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
        border-style: none none dashed none;
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
        opacity: 0;
    }
    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    .ranges-list {
        list-style-type: none;
        overflow-y: hidden;
    }
    .transparent {
        opacity: 1;
    }
    .overflow-hidden {
        overflow-y: hidden;
    }
</style>