<template>
    <div class='tab-container'>
        <v-row class='mb-1' no-gutters>
            <v-col cols=6>
                <v-btn
                    class='calendar-btn'
                    block
                    :height='40'
                    :color='colors.neutral'
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
                    :height='40'
                    :color='colors.neutral'
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
                class='elevation-0'
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
                class='time-picker elevation-0'
                v-model='timePickerModel' 
                full-width
                scrollable
                :disabled='toggleDelay'
                :height='100'
                :color='colors.secondary'
            />
        </transition>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                datePicker: false,
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
                if (this.toggleDelay) return;
                this.toggleDelay = true;

                //close date picker
                if (this.datePicker) {
                    this.datePicker = false;
                    setTimeout(() => this.toggleDelay = false, 300);
                }
                //open date picker
                else {
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
                }
            },
            /**
             * Toggle the time picker widget on or off.
             */
            toggleTimePicker: function() {
                if (this.toggleDelay) return;
                this.toggleDelay = true;

                //close time picker
                if (this.timePicker) {
                    this.timePicker = false;
                    setTimeout(() => this.toggleDelay = false, 300);
                }
                //open time picker
                else {
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
                }
            }
        }
    }
</script>

<style scoped>
    .tab-container {
        overflow-y: hidden;
    }
    .time-picker >>> .v-picker__title {
        padding-top: 0px !important;
        padding-bottom: 20px !important;
    }
    .time-picker >>> .v-time-picker-title {
        height: 40px !important;
    }
    .time-picker >>> .v-time-picker-title__time span {
        font-size: 40px !important;
    }
    .time-picker >>> .v-time-picker-title__time .v-picker__title__btn {
        font-size: 40px !important;
        padding-top: 0px !important;
    }
    .time-picker >>> .v-time-picker-title__ampm {
        font-size: 14px !important;
        margin-left: 80px !important;
    }
    .label {
        color: #ffffff;
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
            transform: translateY(-100px);
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
            transform: translateY(-100px);
            opacity: 0;
        }
    }
</style>