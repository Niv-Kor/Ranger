<template>
    <div>
        <v-dialog 
            :value='model'
            persistent
        >
            <v-card class='main-card' :height=580>
                <v-app-bar
                    :color='colors.secondary' 
                    elevation=0
                >
                    <v-btn
                        class='close-btn'
                        color='gray'
                        x-small
                        fab
                        elevation=2
                        @click='close'
                    >
                        <v-icon
                            color='black'
                            medium
                        >
                            mdi-close
                        </v-icon>
                    </v-btn>
                    <span class='head'>
                        {{ target.name }}
                    </span>
                </v-app-bar>
                <v-container>
                    <v-card
                        class='inner-card'
                        :height=360
                        flat
                    >
                        <target-edit-page
                            :model='target'
                            :key='componentRefresher'
                            @center-changed='setCenter'
                            @rings-amount-changed='setRingsAmount'
                            @diameter-changed='setRingDiameter'
                        />
                    </v-card>
                    <v-container>
                        <!-- save button -->
                        <v-btn
                            class='save-btn'
                            :color='colors.secondary'
                            block
                            @click='updateTarget'
                        >
                            <span style='font-size: 17px'>Save</span>
                        </v-btn>
                    </v-container>
                </v-container>
            </v-card>
            <v-dialog
                v-model='errorDialog'
                :max-width=290
            >
                <v-card>
                    <v-card-title
                        class='error-title'
                        :color='colors.secondary'
                        :style="{ backgroundColor: colors.secondary }"
                    >
                        Hold on!
                    </v-card-title>
                    <v-container>
                        <div
                            class='error-headline'
                            align='center'
                        >
                            {{ errorMessage }}
                        </div>
                    </v-container>
                    <v-card-actions>
                        <v-btn
                            class='error-ok-btn'
                            text
                            block
                            :color='colors.secondary'
                            @click="errorDialog = false"
                        >
                            Ok
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-dialog>
        <Loading :model='load' />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import TargetEditPage from './TargetEditPage';
    import Loading from '../../../../widgets/Loading';

    export default {
        components: {
            TargetEditPage,
            Loading
        },
        props: {
            /**
             * The model of the dialog component (show or hide).
             */
            model: {
                type: Boolean,
                required: true,
            },
            /**
             * The target to edit.
             * 
             * @example {
             *             {Number} id - Target's ID,
             *             {String} user - The user of the target,
             *             {String} discipline - Target's discipline,
             *             {String} name - Target's name,
             *             {String} base64Data - Base64 date of the target's image,
             *             {Number} rings - Amount of rings in the target,
             *             {Number} ringDiameter - Diameter of each ring in the target,
             *             {Object} center - {
             *                                  {Number} x - x coordinates (in percentages),
             *                                  {Number} y - y coordinates (in percentages)
             *                               },
             *             {String} creationDate - The date at which the target was created [YYYY-MM-DD HH:mm:ss],
             *             {Boolean} active - True if the target is active
             *          }
             */
            target: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                load: false,
                center: null,
                ringsAmount: null,
                ringDiameter: null,
                errorDialog: false,
                errorMessage: '',
                componentRefresher: false
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
            })
        },
        methods: {
            /**
             * @param {Object} value - {
             *                            {Number} x - The new x coordinates of the center [%],
             *                            {Number} y - The new y coordinates of the center [%]
             *                         }
             */
            setCenter: function(value) { this.center = value; },
            /**
             * @param {Number} value - The new amount of rings inside the target
             */
            setRingsAmount: function(value) { this.ringsAmount = value; },
            /**
             * @param {Number} value - The new diameter of the center ring
             */
            setRingDiameter: function(value) { this.ringDiameter = value; },
            /**
             * Close the dialog box entirely.
             */
            close: async function() {
                this.$emit('close');
                setTimeout(() => this.componentRefresher = !this.componentRefresher, 100);
            },
            /**
             * Update the target based on the user's input.
             */
            updateTarget: async function() {
                if (!this.validate()) {
                    this.popError(`Any target must have a bull'seys point!`);
                    return;
                }
                else {
                    this.load = true;
                    let success = await this.$store.dispatch('updateTarget', {
                        id: this.$props.target.id,
                        center: this.center,
                        rings: this.ringsAmount,
                        diameter: this.ringDiameter
                    });

                    if (!success) {
                        this.load = false;
                        this.popError(`Could not update target '${this.props.target.name}'. ` +
                                      `Please try again later.`);
                    }
                    else {
                        this.close();
                        await this.$store.dispatch('loadAllTargets');
                        this.load = false;
                    }
                }
            },
            /**
             * Check if the user's input is valid for a save.
             */
            validate: function() { return this.center !== undefined; },
            /**
             * Pop an error message in a new dialog.
             * 
             * @param {String} message - The message to display
             */
            popError: function(message) {
                this.errorDialog = true;
                this.errorMessage = message;
            },
        }
    }
</script>

<style>
    .main-card {
        overflow-x: hidden;
    }
    .head {
        font-size: 30px;
        font-family: 'comfortaa';
        margin: auto;
        padding-right: 20px;
        color: #ffffff;
        font-weight: bold;
    }
    .close-btn {
        margin-left: -5px;
    }
    .inner-card {
        margin-top: 40px;
    }
    .save-btn {
        text-transform: none;
        position: absolute;
        margin: auto;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>