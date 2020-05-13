const BCRYPT = require('bcryptjs');

const state = {
    accountNewUsername: '',
    accountNewEmail: '',
    accountNewPassword: ''
}

const getters = {
    getAccountNewUsername: state => {
        return state.accountNewUsername;
    },
    getAccountNewEmail: state => {
        return state.accountNewEmail;
    },
    getAccountNewPassowrd: state => {
        return state.accountNewPassword;
    }
}

const mutations = {
    setAccountNewUsername: (state, value) => {
        state.accountNewUsername = value;
    },
    setAccountNewEmail: (state, value) => {
        state.accountNewEmail = value;
    },
    setAccountNewPassowrd: (state, value) => {
        state.accountNewPassword = value;
    }
}

const actions = {
    /**
     * Initialize all account change values
     */
    initAccountValues: ({ commit }) => {
        commit('setAccountNewUsername', '');
        commit('setAccountNewEmail', '');
        commit('setAccountNewPassowrd', '');
    },
    updateAccountData: ({ commit, state, rootState, getters }) => {
        let hashPass = null;

        //encrypt password
        if (state.accountNewPassword) {
            let salt = BCRYPT.genSaltSync(10);
            hashPass = BCRYPT.hashSync(state.accountNewPassword, salt);
        }

        let data = {
            oldEmail: rootState.Auth.authEmail,
            newEmail: state.accountNewEmail,
            newHashPass: hashPass,
            newUsername: state.accountNewUsername
        }

        return new Promise(resolve => {
            rootState.socket.on('update_account', res => {
                if (res) {
                    if (data.newEmail) commit('setAuthEmail', data.newEmail);
                    if (state.accountNewPassword) commit('setAuthPassword', state.accountNewPassword);
                    if (data.newUsername) commit('setAuthUsername', data.newUsername);
                    
                    //insert new values to local storage
                    let userData = getters.getUserData;
                    window.localStorage.setItem('user', JSON.stringify(userData));
                }

                resolve(res);
            });
            rootState.socket.emit('update_account', data);
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}