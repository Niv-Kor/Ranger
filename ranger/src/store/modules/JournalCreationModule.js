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
    },
    async createJournal({ state, rootState }) {
        console.log('user email: ', rootState.Auth.authEmail);

        return new Promise((resolve, reject) => {
            rootState.socket.emit('create_journal', {
                user: rootState.Auth.authEmail,
                discipline: state.newJournalDiscipline,
                name: state.newJournalName,
                storedTarget: state.newJournalDefaultTarget,
                customTarget: null,
                isTargetCustom: false,
            });

            rootState.socket.on('create_journal', res => {
                console.log('res: ', res);

                if (res) resolve(res);
                else reject(res);
            });
        });
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}