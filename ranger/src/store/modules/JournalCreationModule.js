const state = {
    newJournalName: '',
    newJournalDiscipline: '',
    newJournalCustomDiscipline: '',
    newJournalDefaultTarget: {
        base64Data: '',
        name: ''
    },
    newJournalTargetResetFlag: false,
    useUploadedCustomTarget: false,
    useCustomDiscipline: false,
    newJournaluploadedTarget: {
        base64Data: '',
        chosenName: '',
        center: null,
        rings: 1,
        ringDiameter: 20
    },
    newJournalRegex: {
        journalName: {
            expression: /^[a-zA-Z](([ _-])?[0-9A-Za-z'])*$/,
            message: 'A journal\'s name must start with a letter and contain no special characters. ' +
                     'Only one separator is allowed between two words.'
        },
        disciplineName: {
            expression: /^[a-zA-Z](([ _-])?[0-9A-Za-z'])*$/,
            message: 'A discipline\'s name must start with a letter and contain no special characters. ' +
                     'Only one separator is allowed between two words.'
        },
        targetName: {
            expression: /^[a-zA-Z](([ _-])?[0-9A-Za-z'])*$/,
            message: 'A target\'s name must start with a letter and contain no special characters. ' +
                     'Only one separator is allowed between two words.'
        }
    },
    newJournalColorTheme: '#ffffff',
    newJournalColorPalette: [
        '#fafafa',
        '#ff00ea',
        '#a800ff',
        '#6000ff',
        '#1800ff',
        '#005aff',
        '#009cff',
        '#00eaff',
        '#00ffa8',
        '#00ff12',
        '#18c900',
        '#c2f00b',
        '#ffde00',
        '#ff7e00',
        '#ff0030',
    ]
}

const getters = {
    getNewJournalName: state => {
        return state.newJournalName;
    },
    getNewJournalColorTheme: state => {
        return state.newJournalColorTheme;
    },
    getNewJournalColorPalette: state => {
        return state.newJournalColorPalette;
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
    getCustomTargetFileType: state => {
        let name = state.newJournaluploadedTarget.chosenName;
        let nameSplit = name.split('.');
        return nameSplit[nameSplit.length - 1];
    },
    getNewJournalRegex: state => {
        return state.newJournalRegex;
    }
};

const mutations = {
    setNewJournalName: (state, value) => {
        state.newJournalName = value;
    },
    setNewJournalColorTheme: (state, value) => {
        state.newJournalColorTheme = value;
    },
    setNewJournalDiscipline: (state, value) => {
        state.newJournalDiscipline = value;
    },
    setNewJournalCustomDiscipline: (state, value) => {
        state.newJournalCustomDiscipline = value;
    },
    setNewJournalTargetData: (state, value) => {
        state.newJournalDefaultTarget.base64Data = value;
    },
    setNewJournalTargetName: (state, value) => {
        state.newJournalDefaultTarget.name = value;
    },
    setNewJournalUploadedTargetData: (state, value) => {
        state.newJournaluploadedTarget.base64Data = value;
    },
    setNewJournalUploadedTargetName: (state, value) => {
        state.newJournaluploadedTarget.chosenName = value;
    },
    setNewJournalUploadedTargetCenter: (state, value) => {
        state.newJournaluploadedTarget.center = value;
    },
    setNewJournalUploadedTargetRingsAmount: (state, value) => {
        state.newJournaluploadedTarget.rings = value;
    },
    setNewJournalUploadedTargetRingsDiameter: (state, value) => {
        state.newJournaluploadedTarget.ringDiameter = value;
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
    /**
     * Init all values.
     */
    initNewJournalValues: ({ commit }) => {
        commit('setNewJournalName', '');
        commit('setNewJournalColorTheme', '#ffffff');
        commit('setNewJournalDiscipline', '');
        commit('setNewJournalCustomDiscipline', '');
        commit('setNewJournalTargetData', '');
        commit('setNewJournalTargetName', '');
        commit('setNewJournalTargetResetFlag', false);
        commit('setUseUploadedCustomTarget', false);
        commit('setUseCustomDiscipline', false);
        commit('setNewJournalUploadedTargetData', '');
        commit('setNewJournalUploadedTargetName', '');
        commit('setNewJournalUploadedTargetCenter', null);
        commit('setNewJournalUploadedTargetRingsAmount', 1);
        commit('setNewJournalUploadedTargetRingsDiameter', 20);
    },
    /**
     * Check if a target alredy exists in the database.
     * 
     * @param {String} name - The target's name
     * @returns {Boolean} True if the target already exists.
     */
    checkTargetExists: async ({ rootState }, name) => {
        if (!name) return false;

        let data = {
            user: rootState.Auth.authEmail,
            targetName: name
        };

        return new Promise((resolve) => {
            rootState.socket.emit('target_exists', data);
            rootState.socket.on('target_exists', res => resolve(res));
        });
    },
    /**
     * Check if a journal alredy exists in the database.
     * 
     * @param {String} name - The journal's name
     * @returns {Boolean} True if the journal already exists.
     */
    checkJournalExists: async ({ rootState }, name) => {
        if (!name) return false;

        let useCustomDiscip = state.useCustomDiscipline;
        let customDiscipName = state.newJournalCustomDiscipline;
        let defDiscipName = state.newJournalDiscipline;
        let discipName = useCustomDiscip ? customDiscipName : defDiscipName;
        let data = {
            user: rootState.Auth.authEmail,
            discipline: discipName,
            journalName: name
        };

        return new Promise((resolve) => {
            rootState.socket.emit('journal_exists', data);
            rootState.socket.on('journal_exists', res => resolve(res));
        });
    },
    /**
     * Create a new journal and insert it to the database.
     * 
     * @returns {Boolean} True if the journal is successfully created.
     */
    createJournal: async ({ dispatch, state, rootState }) => {
        //check if the discipline's name is customized
        let useCustomDiscip = state.useCustomDiscipline;
        let customDiscipName = state.newJournalCustomDiscipline;
        let defDiscipName = state.newJournalDiscipline;
        let discipName = useCustomDiscip ? customDiscipName : defDiscipName;

        return new Promise((resolve) => {
            rootState.socket.emit('create_journal', {
                user: rootState.Auth.authEmail,
                discipline: discipName,
                name: state.newJournalName,
                storedTarget: state.newJournalDefaultTarget.name,
                customTarget: state.newJournaluploadedTarget,
                isTargetCustom: state.useUploadedCustomTarget,
                colorTheme: state.newJournalColorTheme
            });

            rootState.socket.on('create_journal', res => {
                //load journals and targets anew
                dispatch('loadAllJournals');
                dispatch('loadAllTargets');
                dispatch('loadAllRanges');
                
                if (res.exitCode) console.error(res.message);
                resolve(res.exitCode === 0);
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