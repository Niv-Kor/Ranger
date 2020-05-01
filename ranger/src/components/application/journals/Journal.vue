<template>
    <v-container
        class='container'
        fluid
    >
        <h1>{{ journal.name }}</h1>
        <v-row no-gutters>
            <v-col>
                <v-card
                    class='outer-card'
                    ref='vcard'
                    :height='windowDim.height - 420'
                    :width='windowDim.width * .9'
                    :style='createOuterCardStyle(cardRefresher)'
                    elevation=0
                    @scroll='cardRefresher = !cardRefresher'
                >
                    <transition name='slide' mode='in-out'>
                        <v-date-picker
                            v-if='datePicker'
                            v-model='datePickerModel' 
                            first-day-of-week=0
                            full-width
                            scrollable
                            :max='getNowDate()'
                            :color='colors.secondary'
                            @click:date='onDatePick'
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
                                class='range-item elevation-3'
                                ref='item'
                                v-for='(item, index) in filteredList'
                                :key='item.id'
                                :index='index'
                                :style='createItemStyle(item.time)'
                                :selectable=false
                            >
                                <v-list-item-content>
                                    <v-card-title
                                        class='card-title'
                                        :style='{ color: getCardTextColor(item.time) }'
                                    >
                                        {{ item.date }}
                                        <span
                                            :style='{
                                                fontSize: "14px",
                                                marginLeft: "20px",
                                                marginTop: "3px"
                                            }'
                                        >
                                            {{ item.time }}
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
                                    <v-img :src='item.targetSrc' />
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-list>
                    </transition>       
                </v-card>
                <!-- clear filter -->
                <v-row >
                    <v-col :cols=6>
                        <v-btn
                            class='calendar-btn'
                            block
                            :outlined='listFilter.active'
                            :disabled='!listFilter.active'
                            :height='40'
                            :width='windowDim.width * .4'
                            :color='colors.neutral'
                            @click='clearFilter'
                        >
                            <span class='filter-btn'>most recent</span>
                        </v-btn>
                    </v-col>
                    <v-col :cols=6>
                        <!-- pick date -->
                        <v-btn
                            class='calendar-btn'
                            block
                            outlined
                            :height='40'
                            :width='windowDim.width * .4'
                            :color='colors.neutral'
                            @click='toggleDatePicker'
                        >
                            <span class='filter-btn'>older</span>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <plus-button
            class='plus'
            @click='openRangeCreationDialog'
        />
        <range-dialog-box
            :model="createRangeModel"
            @close='createRangeModel = false'
        />
        <Loading :model='isListLoading' />
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';
    import Moment from 'moment';
    import Loading from '../../widgets/Loading';
    import PlusButton from '../../widgets/PlusButton';
    import RangeDialogBox from '../dialogs/range/RangeDialogBox';

    const JOURNAL_ASSETS = require.context('../../../assets/disciplines/journal card/', false, /\.png|\.jpg$/);
    const RANGES_CONTEXT = require.context('../../../assets/ranges/', false, /\.png$/)
    const FILTERED_RANGES = 5;
    const THREE = require('three');

    export default {
        components: {
            PlusButton,
            RangeDialogBox,
            Loading
        },
        data() {
            return {
                windowDim: {
                    width: 0,
                    height: 0
                },
                listFilter: {
                    from: -1,
                    to: -1,
                    active: false
                },
                cardRefresher: false,
                datePicker: false,
                toggleDelay: false,
                showRanges: true,
                createRangeModel: false,
                datePickerModel: this.getNowDate(),
                skyColors: [
                    [0x19042a, 0x357eec],
                    [0x56c5ff, 0x00a7ff],
                    [0x56c5ff, 0x115499],
                    [0x061647, 0x020611],
                    [0x020611, 0x020611]
                ],
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalIndex: 'getSelectedJournalIndex',
                journals: 'getAllJournals',
                allTargets: 'getAllTargets',
                allRanges: 'getAllRanges',
                isListLoading: 'isRangesListLoading'
            }),
            list() {
                if (this.isListLoading) return [];
                let journalRanges = this.allRanges[`journal #${this.journal.id}`];

                let list = [];
                for (let obj of journalRanges) {
                    //extract date
                    let DD = obj.date.substr(8, 2);
                    let MM = obj.date.substr(5, 2);
                    let YYYY = obj.date.substr(2, 2);
                    let hh = obj.date.substr(11, 2);
                    let mm = obj.date.substr(14, 2);
                    let date = `${DD} - ${MM} - ${YYYY}`;
                    let time = `${hh}:${mm}`

                    //extract target data
                    let target = this.allTargets.find(x => x.id === obj.targetId);
                    let targetSrc = target.base64Data;

                    list.push({
                        id: obj.id,
                        date,
                        time,
                        score: obj.score,
                        total: obj.total,
                        targetSrc
                    });
                }

                return list;
            },
            filteredList() {
                let from = this.listFilter.from;
                let to = this.listFilter.to;

                if (from === -1 || to === -1) return this.list;
                else return this.list.slice(from, to);
            },
            journal() {
                return this.journals[this.journalIndex];
            },
            outerCardClass() {
                let className = 'outer-card';
                return !this.toggleDelay ? className : className + ' overflow-hidden';
            }
        },
        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        },
        mounted() {
            this.clearFilter();
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
                        //scroll outer card back to top
                        let cardComponent = this.$refs.vcard;
                        if (cardComponent) cardComponent.$refs.link.scrollTop = 0;

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
            /**
             * Filter the list according to the selected date.
             * 
             * @param {String} selectedDate - The selected date in format 'YYYY-MM-DD'.
             *                                This parameter is fires as an event from the v-date-picker component.
             * @param {Number} amount - The amount of ranges to filter out around the selected date.
             */
            filterRanges: function(selectedDate, amount) {
                selectedDate = Moment(selectedDate, 'YYYY-MM-DD');
                this.listFilter.active = !!selectedDate.diff(this.getNowDate(), 'days');

                //find the ranges that took place before the selected date
                let prev = this.list.filter(x => {
                    let xDate = Moment(x.date, 'DD - MM - YYYY');
                    let difference = xDate.from(selectedDate);
                    return difference.includes('ago');
                })

                //find the ranges that take place after the selected date
                let next = this.list.filter(x => {
                    let xDate = Moment(x.date, 'DD - MM - YYYY');
                    let difference = xDate.from(selectedDate);
                    return difference.includes('in');
                })

                //find the correct amounts from before the selected date and after it
                let before = prev.length;
                let after = next.length;
                let beforePercent = .7;
                let beforeItems = Math.min(parseInt(beforePercent * amount), before);
                let afterItems = Math.min(amount - beforeItems, after);
                let difference = amount - (beforeItems + afterItems);
                beforeItems += difference; //in case there are not enough ranges after

                //filter the list (more recent ranges are in the beginning)
                let listLen = this.list.length;
                this.listFilter.to = listLen - before + beforeItems;
                this.listFilter.from = after - afterItems;
            },
            /**
             * Clear the ranges filter and show the most recent ones.
             */
            clearFilter: function() {
                this.filterRanges(this.getNowDate(), FILTERED_RANGES);
                this.listFilter.active = false;
            },
            /**
             * Activate when a filter date is selected.
             * Close the picker and filter the list accordingly.
             * 
             * @param {String} ev - The selected date in format 'YYYY-MM-DD'.
             *                      This parameter is fires as an event from the v-date-picker component.
             */
            onDatePick: function(ev) {
                this.toggleDatePicker();
                this.filterRanges(ev, FILTERED_RANGES);
            },
            /**
             * Get the appropriate color for the score lable.
             * 
             * @param {Number} score - The range's score
             * @param {Number} totla - The range's maximum achievable score
             * @returns {String} The appropriate color for the score label,
             *                   rangin from red (min) to green (max).
             */
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
            createItemStyle: function(time) {
                let hour = this.extractHour(time);
                let minutes = this.extractMinutes(time);
                let colorRange = [];
                let hoursRange = [];
                let grassLight = '';
                let useFlare = false;
                hour = parseInt(hour);
                minutes = parseInt(minutes);

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
                else if (hour > 18 && hour <= 24) {
                    colorRange = this.skyColors[3];
                    hoursRange = [19, 24];
                    grassLight = 'light'
                }
                else { //hour >= 0 && hour < 5
                    colorRange = this.skyColors[4];
                    hoursRange = [0, 4];
                    grassLight = 'light'
                }

                //calculate the percentage of color darkness
                let minRange = hoursRange[0] * 60;
                let maxRange = hoursRange[1] * 60;
                let minutesRange = Math.abs(maxRange - minRange) + 59;
                let dayParticle = hour * 60 + minutes;
                let dayPercent = (dayParticle - minRange) / minutesRange;
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
             * Generate a style for the outer card component.
             */
            createOuterCardStyle() {
                let fromTopScroll = 0;
                let scrollHeight = .1;
                let alphaGradient = null;

                if (this.$refs.vcard) {
                    let cardComponent = this.$refs.vcard.$refs.link;
                    fromTopScroll = cardComponent.scrollTop;
                    scrollHeight = cardComponent.offsetTop;
                    let opacity = 1 - (fromTopScroll / scrollHeight);
                    let gradientPercent = opacity * 20;
                    let transparency = Math.min(Math.max((80 + gradientPercent), 80), 100); //clamp 80-100
                    alphaGradient = 'linear-gradient(to top, #000000ff ' + transparency + '%, #00000000 100%)';
                }

                return {
                    maskImage: alphaGradient,
                    borderColor: this.colors.primary + '50'
                }
            },
            /**
             * Get the appropriate text color, according to the card's background color.
             */
            getCardTextColor: function(time) {
                let hour = this.extractHour(time);

                if (hour === 5 || hour === 6) return '#ffffff';
                else if (hour > 6 && hour <= 16) return '#000000';
                else if (hour > 16 && hour < 18) return '#000000';
                else return '#ffffff';
            },
            /**
             * Activate when the plus button is pressed.
             * Open the range creation dialog.
             */
            openRangeCreationDialog: function() {
                this.createRangeModel = true;
                this.$store.dispatch('initNewRangeValues');
            },
            /**
             * Extract the hour from a time string.
             * 
             * @param {String} time - hh:mm time format
             * @returns {Number} The hour as a number.
             */
            extractHour: function(time) { return time.substr(0, 2); },
            /**
             * Extract the minutes from a time string.
             * 
             * @param {String} time - hh:mm time format
             * @returns {Number} The minutes as a number.
             */
            extractMinutes: function(time) { return time.substr(3, 2); },
            /**
             * @returns {String} The date right now in YYYY-MM-DD format.
             */
            getNowDate: function() { return Moment().format('YYYY-MM-DD'); }
        }
    }
</script>

<style scoped>
    .container {
        text-align: center;
        font-family: 'Comfortaa';
    }
    .outer-card {
        border-width: 1px;
        margin-top: 100px;
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
            transform: translateY(300px);
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
            transform: translateY(300px);
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