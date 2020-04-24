<template>
    <div>
        <v-text-field
            class='field'
            label="Email"
            v-model='email'
            outlined
            clearable
            rounded
            color='blue-grey darken-3'
            background-color='#ffffff90'
        />
        <v-text-field
            class='field'
            label="Password"
            width=100
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            v-model='password'
            outlined
            clearable
            rounded
            color='blue-grey darken-3'
            background-color='#ffffff90'
            @click:append='showPassword = !showPassword'
        />
        <v-layout justify-center>
            <v-btn
                class='enter-btn white--text'
                :color='enterButtonColor'
                elevation=1
                rounded
                x-large
                @click='login'
            >
                Log in
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
            },
            enterButtonColor() { return this.colors.secondary + 'aa'; }
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
        left: -55px;;
        text-transform: none;
    }
    .input-error {
        text-align: center;
        font-family: 'Comfortaa';
        margin: 0 5% 0 5%;
        color: red;
    }
    .error-title {
        color: #ffffff;
        margin-right: auto;
        margin-left: auto;
        left: 0;
        right: 0;
    }
</style>