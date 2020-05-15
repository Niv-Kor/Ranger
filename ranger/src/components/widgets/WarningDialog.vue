<template>
    <div>
        <v-dialog
            v-model='model'
            :max-width=290
        >
            <v-card>
                <v-card-title
                    :color='colors.primary'
                    :style="{ backgroundColor: colors.primary }"
                >
                    <p
                        v-if='$props.title'
                        class='dialog-title'
                        align=center
                    >
                        {{ $props.title }}
                        <br><br>
                    </p>
                    <p
                        class='dialog-title-flex warning-dialog'
                        align=center
                    >
                        <span v-html='message'>{{ message }}</span>
                        <br><br>
                        <span v-if='irreversible'>
                            <span class='irreversible-warning'>This action is irreversible!</span>
                            <br><br>
                        </span>
                        <v-icon large :color='colors.secondary'>mdi-alert</v-icon>
                    </p>
                </v-card-title>
                <v-card-actions>
                    <v-btn
                        class='dialog-btn cancel-btn warning-dialog'
                        text
                        :color='colors.primaryDark'
                        @click='close'
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        class='dialog-btn ok-btn warning-dialog'
                        outlined
                        :color='colors.primaryDark'
                        @click='accept'
                    >
                        Accept
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <loading :model='load' />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import Loading from './Loading';

    export default {
        components: {
            Loading
        },
        props: {
            /**
             * The model of the dialog box.
             */
            model: {
                type: Boolean,
                required: true
            },
            title: {
                type: String,
                required: false,
                default: ''
            },
            /**
             * The function to call when the 'Accept' button is clicked.
             */
            callback: {
                type: Function,
                required: false,
                default: null
            },
            /**
             * The message to display as a warning.
             */
            message: {
                type: String,
                required: true
            },
            /**
             * Add an additional paragraph,
             * saying that this action is irreversible.
             */
            irreversible: {
                type: Boolean,
                required: false,
                default: false
            },
            /**
             * Wait for the callback function to finish before closing the window.
             * A loading effect will take place at this time.
             */
            asyncWait: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        data() {
            return {
                load: false
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        },
        methods: {
            /**
             * Activate when the 'Accept' button is clicked.
             * Call the callback function and close the window.
             */
            accept: async function() {
                let callback = this.$props.callback;
                let isAsync = this.$props.asyncWait;
                if (!callback) return;

                if (isAsync) {
                    this.load = true;
                    await callback();
                }
                else callback();

                this.load = false;
                this.close();
            },
            /**
             * Activate when the dialog is closed.
             * 
             * @emits {Null} close
             */
            close: function() { this.$emit('close'); }
        }
    }
</script>

<style scoped>
    .dialog-title {
        color: #ffffff;
        margin: auto;
        font-weight: bold;
        font-size: 25px;
    }
    .dialog-title-flex {
        word-break: normal;
        color: #ffffff;
        margin-top: 10px;
    }
    .dialog-title-flex.warning-dialog {
        font-size: 18px;
    }
    .irreversible-warning {
        font-weight: bold;
        font-size: 20px;
        letter-spacing: 2px;
    }
    .dialog-btn {
        text-transform: none;
    }
    .dialog-btn.ok-btn.warning-dialog {
        position: absolute;
        right: 8px;
    }
</style>