const state = {
    newJournalName: '',
    newJournalDiscipline: '',
    newJournalOtherDiscipline: '',
    newJournalDefaultTarget: '',
    newJournaluploadedTarget: {
        tempName: '',
        chosenName: ''
    }
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
    },
    getNewJournalUploadedTarget: state => {
        return state.newJournaluploadedTarget;
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
    setNewJournalUploadedTarget: (state, value) => {
        state.newJournaluploadedTarget = value;
    },
};

const actions = {
    initNewJournalValues: ({ commit }) => {
        commit('setNewJournalName', '');
        commit('setNewJournalDiscipline', '');
        commit('setNewJournalOtherDiscipline', '');
        commit('setNewJournalTarget', '');
        commit('setNewJournalUploadedTarget', null);
    },
    createJournal: async ({ state, rootState }) => {
        let storedUploadedTarget = state.newJournaluploadedTarget;
        let isTargetCustom = storedUploadedTarget != null;
        
        return new Promise((resolve, reject) => {
            rootState.socket.emit('create_journal', {
                user: rootState.Auth.authEmail,
                discipline: state.newJournalDiscipline,
                name: state.newJournalName,
                storedTarget: state.newJournalDefaultTarget,
                customTarget: state.newJournaluploadedTarget,
                isTargetCustom: isTargetCustom,
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