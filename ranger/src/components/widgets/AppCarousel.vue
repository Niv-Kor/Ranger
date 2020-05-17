<template>
    <div class='t'>
        <div class='ico'>
            <transition name='scale' mode='out-in'>
                <v-icon
                    v-if='info[periodPtr].iconType === 0'
                    x-large
                    :color='colors.secondary'
                    :key='periodPtr + 0'
                >
                    {{ info[periodPtr].icon }}
                </v-icon>
                <fa-icon
                    v-else
                    :icon='info[periodPtr].icon'
                    :color='colors.secondary'
                    size='2x'
                    :key='periodPtr + 0'
                />
            </transition>
        </div>
        <transition
            :name='slideDirection'
            mode='out-in'
        >
            <div
                class='info-p'
                v-html='info[periodPtr].text'
                :key='periodPtr'
            >
                {{ info[periodPtr].text }}
            </div>
        </transition>
        <hr class='hr' width=0%>
        <v-layout
            class='text-layout'
            justify-center
        >
            <div
                v-for='period in info.length'
                :class='getPeriodClass(period)'
                :key='period'
                @click='periodPtr = period - 1'
            >
                <v-icon
                    class='single-period'
                    small
                >
                    {{ getPeriodIcon(periodPtr === period - 1) }}
                </v-icon>
            </div>
        </v-layout>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        data() {
            return {
                currentPeriodPtr: 0,
                lastPtr: 0,
                info: [
                    {
                        text: 'Manage and document<br>all of your ranges<br> in one place!',
                        icon: 'file-signature',
                        iconType: 1
                    },
                    {
                        text: 'Select from a variaty of targets, or customize<br>one of your own',
                        icon: 'mdi-bullseye',
                        iconType: 0
                    },
                    {
                        text: 'Receive feedback<br>regarding your<br>performance and<br>personal progress',
                        icon: 'mdi-graphql',
                        iconType: 0
                    },
                    {
                        text: 'It doesn\'t matter<br>what you shoot,<br>just enjoy shooting<br>and let us do the work!',
                        icon: 'mdi-ammunition',
                        iconType: 0
                    }
                ]
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            }),
            periodPtr: {
                get() { return this.currentPeriodPtr; },
                set(value) {
                    this.lastPtr = this.currentPeriodPtr;
                    this.currentPeriodPtr = value;
                }
            },
            slideDirection() {
                if (this.currentPeriodPtr > this.lastPtr) return 'slide-left';
                else return 'slide-right';
            }
        },
        methods: {
            /**
             * @param {Number} period - The index of the period
             * @returns {String} The appropriate css class for the specified period.
             */
            getPeriodClass: function(period) {
                let defClass = 'periods';
                let focusClass = (this.periodPtr === period - 1) ? 'focus' : 'blur';
                return defClass + ' ' + focusClass;
            },
            /**
             * @param {Boolean} selected - True if the period is the selected one
             * @returns {String} The period's appropriate mdi icon.
             */
            getPeriodIcon: function(selected) {
                return selected ? 'mdi-circle-slice-8' : 'mdi-circle-outline';
            }
        }
    }
</script>

<style scoped>
    .ico {
        position: absolute;
        margin-left: auto;
        margin-right: 15px;
        top: 35%;
        bottom: 50%;
        left: 50%;
        right: 50%;
    }
    .info-p {
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        top: 45%;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 24px;
        font-family: 'Comfortaa';
    }
    .periods {
        justify-items: center;
        margin-top: -2%;
        font-size: 60px;
    }
    .single-period {
        margin-left: 3px;
        margin-right: 3px;
    }
    .text-layout {
        position: absolute;
        top: 60%;
        bottom: 50%;
        left: 50%;
        right: 50%;
    }
    .slide-right-enter-active {
        animation: slide-right-in .3s ease-out forwards;
        transition: opacity .2s;
    }
    .slide-right-leave-active {
        animation: slide-right-out .3s ease-out forwards;
        transition: opacity .2s;
        opacity: 0;
    }
    @keyframes slide-right-in {
        from {
            transform: translateX(-100px);
        }
        to {
            transform: translateX(0);
        }
    }
    @keyframes slide-right-out {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(100px);
        }
    }
    .slide-left-enter-active {
        animation: slide-left-in .3s ease-out forwards;
        transition: opacity .2s;
    }
    .slide-left-leave-active {
        animation: slide-left-out .3s ease-out forwards;
        transition: opacity .2s;
        opacity: 0;
    }
    @keyframes slide-left-in {
        from {
            transform: translateX(100px);
        }
        to {
            transform: translateX(0);
        }
    }
    @keyframes slide-left-out {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-100px);
        }
    }
    .scale-enter-active {
        animation: scale-in .3s ease-out forwards;
        transition: opacity .2s;
    }
    .scale-leave-active {
        animation: scale-out .3s ease-out forwards;
        transition: opacity .2s;
        opacity: 0;
    }
    @keyframes scale-in {
        from {
            transform: scale(0);
        }
        to {
            transform: scale(1);
        }
    }
    @keyframes scale-out {
        from {
            transform: scale(1);
        }
        to {
            transform: scale(0);
        }
    }
</style>