<template>
    <div class='tab-container'>
        <v-container class='subtitle-container'>
            <p
                class='subtitle'
                align=center
            >
                <span v-if='askDate'>
                    Is it taking place right now?
                </span>
                <span v-else>
                    At what date did it take place?
                </span>
            </p>
        </v-container>
        <!-- question -->
        <transition name='fade' mode='in-out'>
            <div v-if='askDate && !showDatePickers'>
                <v-btn
                    class='option-btn yes'
                    elevation=3
                    block
                    :color='colors.secondary'
                    :style='{ borderColor: colors.neutral }'
                    @click='$emit("change-tab", 1)'
                >
                    Starting now!
                </v-btn>
                <v-btn
                    class='option-btn no'
                    elevation=0
                    block
                    :style='{ borderColor: colors.neutral }'
                    @click='toggleAnotherDateSelection'
                >
                    No, select date
                </v-btn>
            </div>
        </transition>
        <!-- date selection -->
        <transition name='fade' mode='in-out'>
            <div 
                v-if='!askDate && showDatePickers'
                class='picker-div'
            >
                <v-row class='mb-1' no-gutters>
                    <v-col cols=6>
                        <v-btn
                            class='calendar-btn'
                            block
                            :height='30'
                            elevation=0
                            @click='toggleDatePicker'
                        >
                            <span class='date label'>
                                {{ datePickerModel }}
                            </span>
                        </v-btn>
                    </v-col>
                    <v-col cols=6>
                        <v-btn
                            class='calendar-btn'
                            block
                            :height='30'
                            elevation=0
                            @click='toggleTimePicker'
                        >
                            <span class='time label'>
                                {{ timePickerModel }}
                            </span>
                        </v-btn>
                    </v-col>
                </v-row>
                <transition name='slide' mode='in-out'>
                    <v-date-picker
                        v-show='datePicker'
                        class='date-label date-picker elevation-0'
                        v-model='datePickerModel' 
                        first-day-of-week=0
                        full-width
                        scrollable
                        :disabled='toggleDelay'
                        :color='colors.secondary'
                    />
                </transition>
                <transition name='slide' mode='in-out'>
                    <v-time-picker
                        v-show='timePicker'
                        class='date-label time-picker elevation-0'
                        v-model='timePickerModel' 
                        full-width
                        scrollable
                        ampm-in-title
                        :disabled='toggleDelay'
                        :height='100'
                        :color='colors.secondary'
                    />
                </transition>
            </div>
        </transition>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                askDate: true,
                showDatePickers: false,
                datePicker: true,
                timePicker: false,
                toggleDelay: false,
                datePickerModel: new Date().toISOString().substr(0, 10),
                timePickerModel: '00:00',
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        },
        methods: {
            /**
             * Toggle the date picker widget on or off.
             */
            toggleDatePicker: function() {
                if (this.datePicker || this.toggleDelay) return;
                this.toggleDelay = true;

                //close time picker first
                if (this.timePicker) {
                    this.timePicker = false;
                    setTimeout(() => {
                        this.datePicker = true;
                        setTimeout(() => this.toggleDelay = false, 500);
                    }, 300);
                }
                else {
                    this.datePicker = true;
                    setTimeout(() => this.toggleDelay = false, 500);
                }
            },
            /**
             * Toggle the time picker widget on or off.
             */
            toggleTimePicker: function() {
                if (this.timePicker || this.toggleDelay) return;
                this.toggleDelay = true;

                //close date picker first
                if (this.datePicker) {
                    this.datePicker = false;
                    setTimeout(() => {
                        this.timePicker = true;
                        setTimeout(() => this.toggleDelay = false, 500);
                    }, 300);
                }
                else {
                    this.timePicker = true;
                    setTimeout(() => this.toggleDelay = false, 500);
                }
            },
            toggleAnotherDateSelection: function() {
                if (this.askDate) {
                    this.askDate = false;
                    setTimeout(() => this.showDatePickers = true, 300);
                }
                else {
                    this.showDatePickers = false;
                    setTimeout(() => this.askDate = true, 300);
                }
            }
        }
    }
</script>

<style scoped>
    .tab-container, .subtitle, .pickers-div {
        overflow-y: hidden;
    }
    .date-picker >>> .v-date__title {
        padding-top: 0px !important;
        padding-bottom: 20px !important;
    }
    .date-picker >>> .v-date-picker-title__date {
        height: 20px !important;
    }
    .date-picker >>> .v-date-picker-title__date {
        font-size: 20px !important;
        padding-top: 0px !important;
    }
    .time-picker >>> .v-picker__title {
        padding-top: 0px !important;
        padding-bottom: 20px !important;
    }
    .time-picker >>> .v-time-picker-title {
        height: 30px !important;
    }
    .time-picker >>> .v-time-picker-title__time span {
        font-size: 30px !important;
        padding-bottom: 10px !important;
    }
    .time-picker >>> .v-time-picker-title__time .v-picker__title__btn {
        font-size: 30px !important;
        padding-bottom: 20px !important;
    }
    .time-picker >>> .v-time-picker-title__ampm {
        font-size: 14px !important;
        margin-left: 78px !important;
        margin-bottom: -10px !important;
    }
    .option-btn {
        text-transform: none;
        font-weight: bold;
        margin-top: 30px;
        border-width: 1px;
        border-style: solid;
    }
    .fade-enter-active {
        animation: fade-in .5s ease-out forwards;
    }
    .fade-leave-active {
        animation: fade-out .2s ease-out forwards;
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
    @keyframes fade-out {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    .slide-enter-active {
        animation: slide-in .5s ease-out forwards;
    }
    .slide-leave-active {
        animation: slide-out .2s ease-out forwards;
        opacity: 0;
    }
    @keyframes slide-in {
        from {
            transform: translateY(-50px);
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
            transform: translateY(-50px);
            opacity: 0;
        }
    }
</style>