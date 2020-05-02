<template>
    <v-card
        :height=35
        elevation=0
    >
        <div v-if='rank === 1' >
            <v-layout justify-center>
                <v-img
                    class='decor'
                    :max-height=24
                    :max-width=24
                    :src='star'
                    :style='decorStyle'
                />
            </v-layout>
        </div>
        <div v-else-if='rank === 2'>
            <v-layout justify-center>
                <v-img
                    class='decor'
                    :max-height=24
                    :max-width=24
                    :src='star'
                    :style='decorStyle'
                />
                <v-img
                    class='decor'
                    :max-height=24
                    :max-width=24
                    :src='star'
                    :style='decorStyle'
                />
            </v-layout>
        </div>
        <div v-else-if='rank === 3'>
            <v-layout justify-center>
                <v-img
                    class='decor'
                    :max-height=24
                    :max-width=24
                    :src='star'
                    :style='decorStyle'
                />
                <v-img
                    class='decor'
                    :max-height=32
                    :max-width=32
                    :src='star'
                    :style='decorStyle'
                />
                <v-img
                    class='decor'
                    :max-height=24
                    :max-width=24
                    :src='star'
                    :style='decorStyle'
                />
            </v-layout>
        </div>
        <div v-else-if='rank === 4'>
            <v-layout justify-center>
                <v-img
                    class='decor'
                    :max-height=35
                    :max-width=35
                    :src='crown'
                />
            </v-layout>
        </div>
    </v-card>
</template>

<script>
    import ColorsHandler from '../../util/ColorsHandler';

    const context = require.context('../../assets/misc', false, /.png$/);
    const STAR = 'decoration.png';
    const CROWN = 'crown.png';
    const BASE_HSL = {
        h: 38,
        s: 37,
        l: 81
    }

    export default {
        props: {
            /**
             * Decoration's color theme
             */
            color: {
                type: String,
                default: '#fafafa'
            },
            /**
             * The journal's overall achieved score,
             * as a sum of all of its ranges.
             */
            score: {
                type: Number,
                default: 0
            },
            /**
             * The journal's total achievable score,
             * as a sum of all of its ranges.
             */
            total: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                breakpoints: [
                    //no stars
                    {
                        minScore: 0,
                        successRate: 0
                    },
                    //1 star
                    {
                        minScore: 1000,
                        successRate: .3
                    },
                    //2 stars
                    {
                        minScore: 5000,
                        successRate: .4
                    },
                    //3 stars
                    {
                        minScore: 15000,
                        successRate: .5
                    },
                    //crown
                    {
                        minScore: 30000,
                        successRate: .65
                    }
                ]
            }
        },
        computed: {
            star() { return context('./' + STAR); },
            crown() { return context('./' + CROWN); },
            decorStyle() {
                let propHSL = ColorsHandler.RGBHexToHSL(this.$props.color);
                let targetColor = ColorsHandler.transistHSLDifference(BASE_HSL, propHSL);
                let hue = targetColor.h;
                let satur = propHSL.s;
                let light = targetColor.l;

                return {
                    filter: `hue-rotate(${hue}deg) saturate(${satur}%) brightness(${light}%)`
                };
            },
            rank() {
                let score = this.$props.score;
                let total = this.$props.total;
                let success = score / total;
                let achievedRank = 0;

                for (let i = 1; i < this.breakpoints.length; i++) {
                    let rank = this.breakpoints[i];
                    let meetScore = score >= rank.minScore;
                    let meetSuccess = success >= rank.successRate;

                    if (meetScore && meetSuccess) achievedRank = i;
                    else break;
                }

                return achievedRank;
            }
        }
    }
</script>

<style scoped>
    .decor {
        margin: 0 5px 0 5px;
    }
</style>