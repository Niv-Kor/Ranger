<template>
    <div>
        <v-text-field
            class='field'
            label="Name"
            v-model='username'
            :rules='[inputRules.required, inputRules.validUsername]'
            outlined
            clearable
            rounded
            solo-inverted
            color='#000000aa'
            background-color='#ffffff90'
        />
        <v-text-field
            class='field'
            label="Email"
            v-model='email'
            :rules='[inputRules.required, inputRules.validEmail]'
            outlined
            clearable
            rounded
            solo-inverted
            color='#000000aa'
            background-color='#ffffff90'
        />
        <v-text-field
            class='field'
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :rules='[inputRules.required, inputRules.length]'
            v-model='password'
            outlined
            clearable
            rounded
            solo-inverted
            color='#000000aa'
            background-color='#ffffff90'
            @click:append='showPassword = !showPassword'
        />
          <v-text-field
            class='field'
            label="Repeat Password"
            :type="showRepeatPassword ? 'text' : 'password'"
            :append-icon="showRepeatPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :rules='[inputRules.required, inputRules.match]'
            v-model='repeatPassword'
            outlined
            clearable
            rounded
            solo-inverted
            color='#000000aa'
            background-color='#ffffff90'
            @click:append='showRepeatPassword = !showRepeatPassword'
        />
        <v-layout justify-center>
            <v-btn
                class='enter-btn white--text'
                :color='enterButtonColor'
                elevation=3
                :disabled='!valid'
                rounded
                dense
                x-large
                @click='signUp'
            >
                Sign Up
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
        <Loading :model='load' />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import Loading from '../widgets/Loading';

    export default {
        components: {
            Loading
        },
        data() {
            return {
                username: '',
                email: '',
                password: '',
                repeatPassword: '',
                showPassword: false,
                showRepeatPassword: false,
                inputRules: {
                    required: value => !!value || 'Required.',
                    length: v => v && v.length >= 8 && v.length <= 25 || 'Between 8-25 characters',
                    match: value => value === this.password || 'Passwords don\'t match',
                    validEmail: value => this.regex.email.test(value) || 'Not a valid email address',
                    validUsername: value => this.regex.username.test(value) || 'Not a valid username'
                }
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                regex: 'getAuthRegex',
                load: 'isAuthLoading',
                errorMessage: 'getAuthErrorMessage'
            }),
            valid() {
                return this.isEmailValid() && this.isPasswordValid() && this.isRepeatPasswordValid();
            },
            wrongInput: {
                get() { return this.$store.getters.isWrongAuthInput; },
                set() { this.$store.commit('setWrongAuthInput', false); }
            },
            enterButtonColor() { return this.colors.secondary + 'aa'; }
        },
        watch: {
            username(value) {
                this.$store.commit('setAuthUsername', value);
            },
            email(value) {
                this.$store.commit('setAuthEmail', value);
            },
            password(value) {
                this.$store.commit('setAuthPassword', value);
            }
        },
        methods: {
            /**
             * Check if the entered email address is regex valid.
             * 
             * @returns {Boolean} True if the email value is valid.
             */
            isEmailValid: function() {
                return this.regex.email.test(this.email);
            },
            /**
             * Check if the entered password is regex valid.
             * 
             * @returns {Boolean} True if the password value is valid.
             */
            isPasswordValid: function() {
                return this.regex.password.test(this.password);
            },
            /**
             * Check if the repeated password is the same as the first one.
             * 
             * @returns {Boolean} True if both values are the same.
             */
            isRepeatPasswordValid: function() {
                return this.repeatPassword === this.password;
            },
            /**
             * Cancel and remove all inputs.
             * 
             * @emits {Null} cancel
             */
            cancel: function() {
                this.email = '';
                this.password = '';
                this.repeatPassword = '';
                this.$store.commit('setWrongAuthInput', false);
                this.$emit('cancel');
            },
            /**
             * Register the user.
             */
            signUp: function() {
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
        color: #ffffff;
    }
    .field {
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }
    .field.error--text {
        color: #de0d4d !important;
    }
    .field >>> .v-label {
        color: #2e2e2e !important;
    }
    .field >>> input {
        color: #2e2e2e !important;
    }
    .field >>> .error--text {
        color: #2e2e2e !important;
    }
    @media only screen and (min-width: 715px) {
        .close-icon {
            color: #000000;
        }
    }
    @media only screen and (max-width: 600px) {
        .v-text-field {
            width: 80%;
        }
    }
    @media only screen and (min-width: 600px) and (max-width: 900px) {
        .v-text-field {
            width: 60%;
        }
    }
    @media only screen and (min-width: 900px) and (max-width: 1600px) {
        .v-text-field {
            width: 50%;
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
        left: -56px;;
        text-transform: none;
    }
    .error-title {
        color: #ffffff;
        margin-right: auto;
        margin-left: auto;
        left: 0;
        right: 0;
    }
    .ff {
        opacity: 1;
    }
</style>