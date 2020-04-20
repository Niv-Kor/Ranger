<template>
    <div>
        <v-text-field
            label="Email"
            v-model='email'
            :rules='[inputRules.required, inputRules.validEmail]'
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
            :rules='[inputRules.required, inputRules.length]'
            v-model='password'
            outlined
            clearable
            rounded
            color='blue-grey darken-3'
            background-color='white'
            @click:append='showPassword = !showPassword'
        />
          <v-text-field
            label="Repeat Password"
            width=100
            :type="showRepeatPassword ? 'text' : 'password'"
            :append-icon="showRepeatPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :rules='[inputRules.required, inputRules.match]'
            v-model='repeatPassword'
            outlined
            clearable
            rounded
            color='blue-grey darken-3'
            background-color='white'
            @click:append='showRepeatPassword = !showRepeatPassword'
        />
        <v-layout justify-center>
            <v-btn
                class='enter-btn white--text'
                color='blue-grey darken-3'
                elevation=1
                :disabled='!valid'
                rounded
                x-large
                @click="$emit('authenticate')"
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
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                email: '',
                password: '',
                repeatPassword: '',
                showPassword: false,
                showRepeatPassword: false,
                inputRules: {
                    required: value => !!value || 'Required.',
                    length: v => v.length >= 8 && v.length <= 25 || 'Between 8-25 characters',
                    match: value => value === this.password || 'Passwords don\'t match',
                    validEmail: value => this.regex.email.test(value) || 'Not a valid email address'
                }
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                regex: 'getAuthRegex',
                wrongInput: 'isWrongAuthInput'
                
            }),
            valid() {
                return this.isEmailValid() && this.isPasswordValid() && this.isRepeatPasswordValid();
            }
        },
        watch: {
            valid: function(value) {
                this.$store.dispatch('setValidation', value);
            },
            email: function(value) {
                this.$store.dispatch('setAuthEmail', value);
            },
            password: function(value) {
                this.$store.dispatch('setAuthPassword', value);
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
        left: -56px;;
        text-transform: none;
    }
</style>