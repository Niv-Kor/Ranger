const state = {
    authEmail: '',
    authPass: '',
    wrongInput: false,
    authenticated: false
};

const getters = {
    getUserData: (state) => {
        return {
            email: state.authEmail,
            password: state.authPass
        }
    },
    getInputValidation: (state, getters, rootState) => {
        let emailValid = rootState.regex.email.test(state.authEmail);
        let passValid = rootState.regex.password.test(state.authPass);
        return emailValid && passValid;
    },
    isWrongInput: (state) => {
        return state.wrongInput;
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
    setWrongInput: (state, flag) => {
        state.wrongInput = flag;
    },
    setAuthentication: (state, flag) => {
        state.authenticated = flag;
    }
};

const actions = {
    setAuthEmail: ({ commit }, value) => {
        commit('setAuthEmail', value);
    },
    setAuthPassword: ({ commit }, value) => {
        commit('setAuthPassword', value);
    },
    async authenticateUser({ state, rootState }) {
        return new Promise((resolve) => {
            rootState.socket.emit('validate_user', {
                email: state.authEmail,
                password: state.authPass
            });

            rootState.socket.on('validate_user', isValid => { resolve(isValid); });
        });
    },
    async signUser({ state, rootState }) {
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