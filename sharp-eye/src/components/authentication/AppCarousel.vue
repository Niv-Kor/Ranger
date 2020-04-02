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
                :key="period"
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
                    { text: 'Manage your Google Forms<br> surveys with great ease,<br> all in one place!', icon: 'mdi-clipboard-text-multiple'},
                    { text: 'Share your surveys with<br>the community<br>and collect more<br>authentic responses', icon: 'mdi-account-group'},
                    { text: 'Find the best fitting<br>respondents based on<br>demographic filters', icon: 'mdi-earth'},
                    { text: 'Help people and friends<br>reach their survey\'s goal<br><br>', icon: 'mdi-handshake'}
                ]
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        },
        methods: {
            getPeriodClass: function(period) {
                let defClass = 'periods';
                let focusClass = (this.periodPtr === period - 1) ? 'focus' : 'blur';
                return defClass + ' ' + focusClass;
            },
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