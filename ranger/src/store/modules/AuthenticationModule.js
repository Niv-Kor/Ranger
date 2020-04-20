const state = {
    authEmail: '',
    authPass: '',
    authWrongInput: false,
    authenticated: false,
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
    getInputValidation: (state) => {
        let emailValid = state.authRegex.email.test(state.authEmail);
        let passValid = state.authRegex.password.test(state.authPass);
        return emailValid && passValid;
    },
    isWrongAuthInput: (state) => {
        return state.authWrongInput;
    },
    getAuthRegex: state => {
        return state.authRegex;
    },
    getAuthentication: (state) => {
        return state.authenticated;
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
            rootState.socket.emit('validate_user', {
                email: state.authEmail,
                password: state.authPass
            });

            rootState.socket.on('validate_user', isValid => { resolve(isValid); });
        });
    },
    /**
     * Sign a user up with the entered data.
     * 
     * @returns {Boolean} True if the registration is successful.
     */
    signUser: async ({ state, rootState }) => {
        return new Promise((resolve) => {
            rootState.socket.emit('sign_user', {
                email: state.authEmail,
                password: state.authPass
            });

            rootState.socket.on('sign_user', success => { resolve(success); });
        });
    },
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}