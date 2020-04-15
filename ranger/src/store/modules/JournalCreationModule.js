const state = {
    newJournalName: '',
    newJournalDiscipline: '',
    newJournalCustomDiscipline: '',
    newJournalDefaultTarget: '',
    newJournalTargetResetFlag: false,
    useUploadedCustomTarget: false,
    useCustomDiscipline: false,
    newJournaluploadedTarget: {
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
    useUploadedCustomTarget: state => {
        return state.useUploadedCustomTarget;
    },
    useCustomDiscipline: state => {
        return state.useCustomDiscipline;
    },
    getCustomTargetFileType: (_, getters) => {
        let name = getters.getNewJournalUploadedTarget.chosenName;
        let nameSplit = name.split('.');
        return nameSplit[nameSplit.length - 1];
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
    setNewJournalUploadedTargetData: (state, value) => {
        state.newJournaluploadedTarget.base64Data = value;
    },
    setNewJournalUploadedTargetName: (state, value) => {
        state.newJournaluploadedTarget.chosenName = value;
    },
    setNewJournalTargetResetFlag: (state, flag) => {
        state.newJournalTargetResetFlag = flag;
    },
    setUseUploadedCustomTarget: (state, flag) => {
        state.useUploadedCustomTarget = flag;
    },
    setUseCustomDiscipline: (state, flag) => {
        state.useCustomDiscipline = flag;
    }
};

const actions = {
    initNewJournalValues: ({ commit }) => {
        commit('setNewJournalName', '');
        commit('setNewJournalDiscipline', '');
        commit('setNewJournalCustomDiscipline', '');
        commit('setNewJournalTarget', '');
        commit('setNewJournalTargetResetFlag', false);
        commit('setUseUploadedCustomTarget', false);
        commit('setUseCustomDiscipline', false);
        commit('setNewJournalUploadedTargetData', '');
        commit('setNewJournalUploadedTargetName', '');
    },
    createJournal: async ({ state, rootState }) => {
        //check if the discipline's name is customized
        let useCustomDiscip = state.useCustomDiscipline;
        let customDiscipName = state.newJournalCustomDiscipline;
        let defDiscipName = state.newJournalDiscipline;
        let discipName = useCustomDiscip ? customDiscipName : defDiscipName;

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