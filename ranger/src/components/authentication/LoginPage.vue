<template>
    <div>
        <v-text-field
            label="Email"
            v-model='email'
            outlined
            clearable
            rounded
            color='blue-grey darken-3'
            background-color='white'
        />
        <v-text-field
            label="Password"
            width=100
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            v-model='password'
            outlined
            clearable
            rounded
            color='blue-grey darken-3'
            background-color='white'
            @click:append='showPassword = !showPassword'
        />
        <v-layout justify-center>
            <v-btn
                class='enter-btn white--text'
                color='blue-grey darken-3'
                elevation=1
                rounded
                x-large
                @click='login'
            >
                Login
            </v-btn>
        </v-layout>
        <v-icon
            class='close-icon'
            large
            @click='cancel'
        >
            mdi-close-circle-outline
        </v-icon>
        <v-dialog
            v-model='wrongInput'
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
                        @click='$store.commit("setWrongAuthInput", false)'
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <loading
            :active.sync='load'
            is-full-page
            loader='dots'
            :width=100
            :height=100
            :color='colors.secondary'
        />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                email: '',
                password: '',
                showPassword: false,
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                enableButton: 'getInputValidation',
                load: 'isAuthLoading',
                errorMessage: 'getAuthErrorMessage'
            }),
            wrongInput: {
                get() { return this.$store.getters.isWrongAuthInput; },
                set() { this.$store.commit('setWrongAuthInput', false); }
            }
        },
        watch: {
            email: function(value) {
                this.$store.commit('setAuthEmail', value);
            },
            password: function(value) {
                this.$store.commit('setAuthPassword', value);
            }
        },
        methods: {
            /**
             * Cancel and remove all inputs.
             * 
             * @emits {Null} cancel
             */
            cancel: function() {
                this.email = '';
                this.password = '';
                this.$store.commit('setWrongAuthInput', false);
                this.$emit('cancel');
            },
            /**
             * Log into the application.
             */
            login: function() {
                this.$store.commit('setAuthLoading', true);
                this.$emit('authenticate');
            }
        }
    }
</script>

<style scoped>
    .close-icon {
        position: absolute;
        left: -15px;
        margin: 0 50% 0 50%;
        bottom: 20px;
        color: #FFFFFF;
    }
    .v-text-field {
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }
    @media only screen and (min-width: 715px) {
        .close-icon {
            color: #000000;
        }
    }
    @media only screen and (max-width: 600px) {
        .v-text-field {
            width: 60%;
        }
    }
    @media only screen and (min-width: 600px) and (max-width: 900px) {
        .v-text-field {
            width: 50%;
        }
    }
    @media only screen and (min-width: 900px) and (max-width: 1600px) {
        .v-text-field {
            width: 40%;
        }
    }
    @media only screen and (min-width: 1600px) {
        .v-text-field {
            width: 30%;
        }
    }
    .enter-btn {
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        bottom: 150px;
        margin: 0 50% 0 50%;
        left: -47px;;
        text-transform: none;
    }
    .input-error {
        text-align: center;
        font-family: 'Comfortaa';
        margin: 0 5% 0 5%;
        color: red;
    }
</style>