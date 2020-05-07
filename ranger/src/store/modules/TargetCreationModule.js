const MOMENT = require('moment');

const state = {
    newTargetName: '',
    newTargetBase64Data: '',
    newTargetCenter: null,
    newTargetRingsAmount: 1,
    newTargetRingDiameter: 20
}

const getters = {
    getNewTargetName: state => {
        return state.newTargetName;
    },
    getNewTargetData: state => {
        return state.newTargetBase64Data;
    },
    getNewTargetCenter: state => {
        return state.newTargetCenter;
    },
    getNewTargetRingsAmount: state => {
        return state.newTargetRingsAmount;
    },
    getNewTargetRingDiameter: state => {
        return state.newTargetRingDiameter;
    }
}

const mutations = {
    setNewTargetName: (state, value) => {
        state.newTargetName = value;
    },
    setNewTargetData: (state, value) => {
        state.newTargetBase64Data = value;
    },
    setNewTargetCenter: (state, value) => {
        state.newTargetCenter = value;
    },
    setNewTargetRingsAmount: (state, value) => {
        state.newTargetRingsAmount = value;
    },
    setNewTargetRingDiameter: (state, value) => {
        state.newTargetRingDiameter = value;
    }
}

const actions = {
    /**
     * Init all values.
     */
    initNewTargetValues: ({ commit }) => {
        commit('setNewTargetName', '');
        commit('setNewTargetData', '');
        commit('setNewTargetCenter', null);
        commit('setNewTargetRingsAmount', 1);
        commit('setNewTargetRingDiameter', 20);
    },
    /**
     * Create a new personal target.
     */
    createTarget: async ({ state, rootState }) => {
        let data = {
            user: rootState.Auth.authEmail,
            base64Data: state.newTargetBase64Data,
            name: state.newTargetName,
            center: state.newTargetCenter,
            rings: state.newTargetRingsAmount,
            ringDiameter: state.newTargetRingDiameter,
            date: MOMENT().format('YYYY-MM-DD HH:mm:ss')
        }

        return new Promise(resolve => {
            rootState.socket.once('create_target', res => resolve(res));
            rootState.socket.emit('create_target', data);
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}