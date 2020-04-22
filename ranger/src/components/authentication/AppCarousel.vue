<template>
    <div>
        <div class='ico'>
            <v-icon
                x-large
                :color='colors.secondary'
            >
                {{ info[periodPtr].icon }}
            </v-icon>
        </div>
        <div
            class='info-p'
            v-html='info[periodPtr].text'
        >
            {{ info[periodPtr].text }}
        </div>
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
                periodPtr: 0,
                info: [
                    {
                        text: 'Manage and document<br>all of your ranges<br> in one place!',
                        icon: 'mdi-table-edit'
                    },
                    {
                        text: 'Select from a variaty of targets, or customize<br>one of your own',
                        icon: 'mdi-bullseye'
                    },
                    {
                        text: 'Receive feedback<br>regarding your<br>performance and<br>personal progress',
                        icon: 'mdi-graphql'
                    },
                    {
                        text: 'It doesn\'t matter<br>what you shoot,<br>just enjoy shooting<br>and let us do the work!',
                        icon: 'mdi-ammunition'
                    }
                ]
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
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
</style>