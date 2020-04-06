const state = {
    newJournalName: '',
    newJournalDiscipline: '',
    newJournalOtherDiscipline: '',
    newJournalDefaultTarget: ''
}

const getters = {
    getNewJournalName: state => {
        return state.newJournalName;
    },
    getNewJournalDiscipline: state => {
        return state.newJournalDiscipline;
    },
    getNewJournalOtherDiscipline: state => {
        return state.newJournalOtherDiscipline;
    },
    getNewJournalTarget: state => {
        return state.newJournalDefaultTarget;
    }
};

const mutations = {
    setNewJournalName: (state, value) => {
        state.newJournalName = value;
    },
    setNewJournalDiscipline: (state, value) => {
        state.newJournalDiscipline = value;
    },
    setNewJournalOtherDiscipline: (state, value) => {
        state.newJournalOtherDiscipline = value;
    },
    setNewJournalTarget: (state, value) => {
        state.newJournalDefaultTarget = value;
    },
};

const actions = {
    initNewJournalValues: ({ commit }) => {
        commit('setNewJournalName', '');
        commit('setNewJournalDiscipline', '');
        commit('setNewJournalOtherDiscipline', '');
        commit('setNewJournalTarget', '');
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}