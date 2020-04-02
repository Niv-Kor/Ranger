<template>
    <div>
        <v-flex align-center>
            <v-img
                class='logo'
                contain
                width=400
                src='../../assets/logo.png'
                aspect-ratio="1.5"
            ></v-img>
        </v-flex>
        <transition name='fade' mode='out-in'>
            <router-view
                @cancel="goto('/auth')"
                @authenticate="authenticateUser"
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
                        width=150
                        @click="goto(signupPage)"
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
                wrongInput: 'isWrongInput',
                userData: 'getUserData'
            }),
            currentPage() {
                return this.$router.app._route.path;
            }
        },
        methods: {
            goto: function(path) {
                this.$router.push({ path: path }).catch(() => {});
            },
            setValidation: function(flag) {
                this.inputValid = flag;
            },
            authenticateUser: function() {
                switch (this.currentPage) {
                    case this.signupPage:
                        //sign up a new user
                        this.$store.dispatch('signUser')
                            .then(authentication => {
                                if (authentication) {
                                    this.storeSuccessfulLogin();
                                    this.$emit('userAuthenticated');
                                }
                                else this.$store.commit('setWrongInput', !authentication);
                            });
                        break;
                    case this.loginPage:
                        //sign in an existing user
                        this.$store.dispatch('authenticateUser')
                            .then(authentication => {
                                if (authentication) {
                                    this.storeSuccessfulLogin();
                                    this.$emit('userAuthenticated');
                                }
                                else this.$store.commit('setWrongInput', !authentication);
                            });
                        break;
                }
            },
            storeSuccessfulLogin: function() {
                window.localStorage.setItem('user', JSON.stringify(this.userData));
            }
        }
    }
</script>

<style>
    .login-btn .v-btn__content {
            color: #000000;
    }
    @media only screen and (max-width: 715px) {
        .login-btn .v-btn__content {
            color: #FFFFFF;
        }
    }
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
        bottom: 10px;
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