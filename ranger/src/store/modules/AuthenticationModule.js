const BCRYPT = require('bcryptjs');

const state = {
    authEmail: '',
    authPass: '',
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
            rootState.socket.on('get_hash_password', hash => {
                let match = hash ? BCRYPT.compareSync(state.authPass, hash) : false;
                resolve(match)
            });
        });
    },
    /**
     * Register a user to the system with the entered personal data.
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

            rootState.socket.on('sign_user', success => resolve(success));
        });
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}