const BCRYPT = require('bcryptjs');

const state = {
    authEmail: '',
    authPass: '',
    authErrorMessage: '',
    authWrongInput: false,
    authenticated: false,
    authLoading: false,
    authRegex: {
        email: /^[0-9A-Za-z_-]{1,}@[0-9A-Za-z_-]{1,}\.[0-9A-Za-z.]{1,}$/,
        password: /^[0-9A-Za-z]{8,25}$/
    },
};

const getters = {
    getUserData: (state) => {
        return {
            email: state.authEmail,
            password: state.authPass
        }
    },
    getInputValidation: state => {
        let emailValid = state.authRegex.email.test(state.authEmail);
        let passValid = state.authRegex.password.test(state.authPass);
        return emailValid && passValid;
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
    }
};

const mutations = {
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
    }
};

const actions = {
    /**
     * Check if the data entered by the user is authenticated with the server.
     * 
     * @returns {Boolean} True if the user is authenticated.
     */
    authenticateUser: async ({ state, rootState }) => {
        return new Promise((resolve) => {
            rootState.socket.emit('get_hash_password', state.authEmail);
            rootState.socket.once('get_hash_password', hash => {
                let match = hash ? BCRYPT.compareSync(state.authPass, hash) : false;
                let errorCode = match ? 0 : 1;
                let errorMessage = match ? '' : 'Some of the information you entered is not valid. Please check again.'

                resolve({
                    errorCode,
                    errorMessage
                })
            });
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