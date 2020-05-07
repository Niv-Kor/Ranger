<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Before we finish,<br>
                let's preview the target
            </p>
        </v-container>
        <v-container>
            <span class='details-header'>
                Name:<br>
            </span>
            <span :style="{ color: colors.primary }">
                {{ targetName }}
                <span
                    class='change-btn'
                    :style="{ color: colors.neutral + '!important' }"
                    @click='change(0)'
                >
                    change
                </span>
            </span>
            <br><br>
            <span class='details-header'>
                Bullseye point:<br>
            </span>
            <span :style="{ color: colors.primary }">
                {{ centerPoint }}
                <span class='fine-print'>from center</span>
                <span
                    class='change-btn'
                    :style="{ color: colors.neutral + '!important' }"
                    @click='change(1)'
                >
                    change
                </span>
            </span>
            <br><br>
            <span class='details-header'>
                <span :style="{ color: colors.primary }">{{ ringsAmount }} </span>
                <template v-if='ringsAmount === 1'>ring:</template>
                <template v-else>rings:</template>
                <br>
            </span>
            <span :style="{ color: colors.primary }">
                <span class='fine-print'>with diameter of </span>{{ ringDiameter }}%
                <span
                    class='change-btn'
                    :style="{ color: colors.neutral + '!important' }"
                    @click='change(1)'
                >
                    change
                </span>
            </span>
            <br><br>
            <v-img
                v-if='base64Data'
                class='target-thumbnail'
                :src='base64Data'
                :width=80
            />
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    
    export default {
        computed: {
            ...mapGetters({
                colors: 'getColors',
                targetName: 'getNewTargetName',
                center: 'getNewTargetCenter',
                base64Data: 'getNewTargetData',
                ringsAmount: 'getNewTargetRingsAmount',
                ringDiameter: 'getNewTargetRingDiameter'
            }),
            centerPoint() {
                if (this.center && this.center.x && this.center.y) {
                    let x = this.center.x;
                    let y = this.center.y;
                    let xLarge = x > 50;
                    let yLarge = y > 50;

                    //find distance from center
                    x = Math.abs(x - 50);
                    y = Math.abs(y - 50);

                    //find the correct sign
                    x *= xLarge ? 1 : -1;
                    y *= yLarge ? 1 : -1;

                    //round to 2 decimal places
                    x = (parseInt(x) === x) ? x : x.toFixed(1);
                    y = (parseInt(y) === y) ? y : y.toFixed(1);

                    return `(${x}%, ${y}%)`;
                }
                else return 'not defined';
            }
        },
        methods: {
            /**
             * Change the dialog's tab
             * 
             * @param {Number} tabIndex - The index of the target tab
             * @emits {Number} change_tab - The index of the target tab
             */
            change: function(tabIndex) { this.$emit('change-tab', tabIndex); }
        }
    }
</script>

<style scoped>
    .subtitle {
        font-family: 'Comfortaa';
        margin-top: -20px;
    }
    .fine-print {
        font-size: 14px;
        color: #000000bb;
    }
    .details-header {
        font-weight: bold;
    }
    .change-btn {
        margin-left: 10px;
        font-size: 13px;
    }
    .target-thumbnail {
        position: absolute;
        right: 15px;
        outline-width: 1px;
        outline-style: dashed;
        outline-color: #5e7075;
    }
</style>