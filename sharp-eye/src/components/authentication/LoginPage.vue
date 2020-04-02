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
         <p
            class='input-error'
            v-if='wrongInput'
        >
            Some of the information you entered is not valid.<br>
            Please check again.
        </p>
        <v-layout justify-center>
            <v-btn
                class='enter-btn white--text'
                color='blue-grey darken-3'
                elevation=1
                rounded
                x-large
                @click="$emit('authenticate')"
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
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                email: '',
                password: '',
                showPassword: false
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                enableButton: 'getInputValidation',
                wrongInput: 'isWrongInput'
            })
        },
        watch: {
            email: function(value) {
                this.$store.dispatch('setAuthEmail', value);
            },
            password: function(value) {
                this.$store.dispatch('setAuthPassword', value);
            }
        },
        methods: {
            cancel: function() {
                this.email = '';
                this.password = '';
                this.$store.commit('setWrongInput', false);
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