const state = {
    newJournalName: '',
    newJournalDiscipline: '',
    newJournalCustomDiscipline: '',
    newJournalDefaultTarget: '',
    newJournalTargetResetFlag: false,
    useUploadedCustomTarget: false,
    useCustomDisciplineFlag: false,
    newJournaluploadedTarget: {
        url: '',
        base64Data: '',
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
    getNewJournalCustomDiscipline: state => {
        return state.newJournalCustomDiscipline;
    },
    getNewJournalTarget: state => {
        return state.newJournalDefaultTarget;
    },
    getNewJournalUploadedTarget: state => {
        return state.newJournaluploadedTarget;
    },
    getNewJournalTargetResetFlag: state => {
        return state.newJournalTargetResetFlag;
    },
    useUploadedCustomTargetFlag: state => {
        return state.useUploadedCustomTarget;
    },
    useCustomDisciplineFlag: state => {
        return state.useCustomDisciplineFlag;
    }
};

const mutations = {
    setNewJournalName: (state, value) => {
        state.newJournalName = value;
    },
    setNewJournalDiscipline: (state, value) => {
        state.newJournalDiscipline = value;
    },
    setNewJournalCustomDiscipline: (state, value) => {
        state.newJournalCustomDiscipline = value;
    },
    setNewJournalTarget: (state, value) => {
        state.newJournalDefaultTarget = value;
    },
    setNewJournalUploadedTargetURL: (state, value) => {
        state.newJournaluploadedTarget.url = value;
    },
    setNewJournalUploadedTargetData: (state, value) => {
        state.newJournaluploadedTarget.base64Data = value;
    },
    setNewJournalUploadedTargetName: (state, value) => {
        state.newJournaluploadedTarget.chosenName = value;
    },
    setNewJournalTargetResetFlag: (state, flag) => {
        state.newJournalTargetResetFlag = flag;
    },
    setUseUploadedCustomTargetFlag: (state, flag) => {
        state.useUploadedCustomTarget = flag;
    },
    setUseCustomDisciplineFlag: (state, flag) => {
        state.useCustomDisciplineFlag = flag;
    }
};

const actions = {
    initNewJournalValues: ({ commit }) => {
        commit('setNewJournalName', '');
        commit('setNewJournalDiscipline', '');
        commit('setNewJournalCustomDiscipline', '');
        commit('setNewJournalTarget', '');
        commit('setNewJournalTargetResetFlag', false);
        commit('setUseUploadedCustomTargetFlag', false);
        commit('setUseCustomDisciplineFlag', false);
        commit('setNewJournalUploadedTargetURL', '');
        commit('setNewJournalUploadedTargetData', '');
        commit('setNewJournalUploadedTargetName', '');
    },
    createJournal: async ({ state, rootState }) => {
        //check if the discipline's name is customized
        let useCustomDiscip = state.useCustomDisciplineFlag;
        let customDiscipName = state.newJournalCustomDiscipline;
        let defDiscipName = state.newJournalDiscipline;
        let discipName = useCustomDiscip ? customDiscipName : defDiscipName;
        console.log('use custom discip: ', state.useCustomDisciplineFlag, useCustomDiscip);
        console.log('custom discip: ', customDiscipName, state.newJournalCustomDiscipline);
        console.log('last discip: ', discipName);
        console.log('image name: ', state.newJournaluploadedTarget.chosenName);

        return new Promise((resolve, reject) => {
            rootState.socket.emit('create_journal', {
                user: rootState.Auth.authEmail,
                discipline: discipName,
                name: state.newJournalName,
                storedTarget: state.newJournalDefaultTarget,
                customTarget: state.newJournaluploadedTarget,
                isTargetCustom: state.useUploadedCustomTarget,
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