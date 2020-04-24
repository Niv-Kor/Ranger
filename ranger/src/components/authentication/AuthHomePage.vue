<template>
    <div>
        <v-flex align-center>
            <v-img
                class='logo'
                contain
                :width=300
                src='../../assets/logos/logo.png'
                aspect-ratio="1.5"
            ></v-img>
        </v-flex>
        <transition name='fade' mode='out-in'>
            <router-view
                @cancel="goto('/auth')"
                @authenticate='authenticateUser'
            />
        </transition>
        <transition name='fade' mode='out-in'>
        <div
            v-if="currentPage === '/auth'"
            class='buttons-layout'
        >
            <v-layout justify-center>
                <div>
                    <v-btn
                        class='signup-btn'
                        rounded
                        color='white'
                        :width=150
                        @click='goto(signupPage)'
                    >
                        Sign Up
                    </v-btn>
                </div>
            </v-layout>
            <v-layout justify-center>
                <div>
                    <v-btn
                        class='login-btn'
                        text
                        color='white'
                        @click='goto(loginPage)'
                    >
                        Log In
                    </v-btn>
                </div>
            </v-layout>
        </div>
        </transition>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                loginPage: '/auth/login',
                signupPage: '/auth/signup',
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                wrongInput: 'isWrongAuthInput',
                userData: 'getUserData'
            }),
            currentPage() {
                return this.$router.app._route.path;
            }
        },
        methods: {
            /**
             * Push an address to the router.
             * 
             * @param {String} path - The address to push to the router
             */
            goto: function(path) {
                this.$router.push({ path: path }).catch(() => {});
            },
            /**
             * Based on the current page, authenticate the user via the server.
             * If the current page is the login page, check if the user exists in the database;
             * If the current page is the registration page, check if the user is able to be registered.
             * 
             * @emits {Null} userAuthenticated - When authentication is successful
             */
            authenticateUser: async function() {
                let act = async () => {
                    switch (this.currentPage) {
                        //sign up a new user
                        case this.signupPage:
                            return await this.$store.dispatch('signUser');

                        //sign in an existing user
                        case this.loginPage:
                            return await this.$store.dispatch('authenticateUser');
                    }
                }

                let authentication = await act();

                if (authentication.errorCode === 0) {
                    this.storeSuccessfulLogin();
                    this.$emit('userAuthenticated');
                }
                else {
                    this.$store.commit('setWrongAuthInput', true);
                    this.$store.commit('setAuthErrorMessage', authentication.errorMessage);
                }

                this.$store.commit('setAuthLoading', false);
            },
            /**
             * Store login tokens (email and password) in the web's local storage
             * under the object named 'user'.
             */
            storeSuccessfulLogin: function() {
                window.localStorage.setItem('user', JSON.stringify(this.userData));
            }
        }
    }
</script>

<style scoped>
    .logo {
        flex: 1 1 100%;
        margin: auto;
        margin-bottom: 3%;
        padding: 24px;
        width: 100%;
    }
    .buttons-layout {
        position: absolute;
        bottom: 2%;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }
    .signup-btn {
        position: absolute;
        bottom: 40px;
        margin: auto;
        left: 0;
        right: 0;
    }
    .unlock-btn {
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }
    .fade-enter {
        opacity: 0;
    }
    .fade-enter-active {
        transition: opacity .1s;
    }
    .fade-leave-active {
        transition: opacity .1s;
        opacity: 0;
    }
</style>