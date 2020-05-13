const BCRYPT = require('bcryptjs');

const state = {
    authUsername: '',
    authEmail: '',
    authPass: '',
    authErrorMessage: '',
    authDataLoading: false,
    authWrongInput: false,
    authenticated: false,
    authLoading: false,
    authRegex: {
        email: /^[0-9A-Za-z_-]{1,}@[0-9A-Za-z_-]{1,}\.[0-9A-Za-z.]{1,}$/,
        password: /^[0-9A-Za-z]{8,25}$/,
        username: /^([0-9A-Za-z]+([0-9A-Za-z_-\w\s]*[0-9A-Za-z])*){2,20}$/
    },
};

const getters = {
    getUserData: (state) => {
        return {
            username: state.authUsername,
            email: state.authEmail,
            password: state.authPass
        }
    },
    getInputValidation: state => {
        let usernameValid = state.authRegex.username.test(state.authUsername);
        let emailValid = state.authRegex.email.test(state.authEmail);
        let passValid = state.authRegex.password.test(state.authPass);
        return usernameValid && emailValid && passValid;
    },
    isWrongAuthInput: state => {
        return state.authWrongInput;
    },
    getAuthRegex: state => {
        return state.authRegex;
    },
    getAuthentication: state => {
        return state.authenticated;
    },
    isAuthLoading: state => {
        return state.authLoading;
    },
    getAuthErrorMessage: state => {
        return state.authErrorMessage;
    },
    isAuthDataLoading: state => {
        return state.authDataLoading;
    }
};

const mutations = {
    setAuthUsername: (state, value) => {
        state.authUsername = value;
    },
    setAuthEmail: (state, value) => {
        state.authEmail = value;
    },
    setAuthPassword: (state, value) => {
        state.authPass = value;
    },
    setWrongAuthInput: (state, flag) => {
        state.authWrongInput = flag;
    },
    setAuthentication: (state, flag) => {
        state.authenticated = flag;
    },
    setAuthLoading: (state, flag) => {
        state.authLoading = flag;
    },
    setAuthErrorMessage: (state, msg) => {
        state.authErrorMessage = msg;
    },
    setAuthDataLoading: (state, flag) => {
        state.authDataLoading = flag;
    }
};

const actions = {
    /**
     * Load all account data for app use.
     */
    loadAccountData: async ({ commit, state, rootState }) => {
        commit('setAuthDataLoading', true);

        return new Promise(resolve => {
            rootState.socket.once('load_account_data', res => {
                state.authUsername = res.username;
                commit('setAuthDataLoading', false);
                resolve(true);
            });
            rootState.socket.emit('load_account_data', rootState.Auth.authEmail);
        });
    },
    /**
     * Check if the data entered by the user is authenticated with the server.
     * 
     * @returns {Boolean} True if the user is authenticated.
     */
    authenticateUser: async ({ state, rootState }) => {
        return new Promise((resolve) => {
            rootState.socket.once('get_hash_password', hash => {
                let match = hash ? BCRYPT.compareSync(state.authPass, hash) : false;
                let errorCode = match ? 0 : 1;
                let errorMessage = match ? '' : 'Some of the information you entered is not valid. Please check again.'

                resolve({
                    errorCode,
                    errorMessage
                })
            });
            rootState.socket.emit('get_hash_password', state.authEmail);
        });
    },
    /**
     * Register a user to the system with the entered personal data.
     * This method does not send the real password to the server.
     * 
     * @returns {Boolean} True if the registration is successful.
     */
    signUser: async ({ state, rootState }) => {
        //encrypt
        let salt = BCRYPT.genSaltSync(10);
        let hashPass = BCRYPT.hashSync(state.authPass, salt);

        return new Promise((resolve) => {
            rootState.socket.emit('sign_user', {
                username: state.authUsername,
                email: state.authEmail,
                password: hashPass
            });

            rootState.socket.once('sign_user', res => {
                resolve({
                    errorCode: res.errorCode,
                    errorMessage: res.message
                })
            });
        });
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}