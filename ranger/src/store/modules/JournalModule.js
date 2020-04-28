const state = {
    journals: [],
    journalsListLoading: false,
    selectedJournal: 0,
    testImage: ''
}

const getters = {
    getAllJournals: state => {
        return state.journals;
    },
    isJournalsListLoading: state => {
        return state.journalsListLoading;
    },
    getSelectedJournalIndex: state => {
        return state.selectedJournalIndex;
    },
    getTestImage: state => {
        return state.testImage;
    }
};

const mutations = {
    setJournalsListLoading: (state, value) => {
        state.journalsListLoading = value;
    },
    setSelectedJournalIndex: (state, value) => {
        state.selectedJournalIndex = value;
    }
};

const actions = {
    /**
     * Load all of the user's journals.
     */
    loadAllJournals: async ({ commit, state, rootState }) => {
        commit('setJournalsListLoading', true);
        let dataManager = rootState.data;
        let storedIDs = await dataManager.getTargetsIDs();

        rootState.socket.on('load_journals', async res => {
            state.journals = res;

            for (let obj of res) {
                let target = obj.target;

                //store target in indexedDB
                if (target.base64Data) {
                    dataManager.insertTarget({
                        id: target.id,
                        image: target.base64Data
                    });
                }
                //pull target from indexedDB
                else {
                    let targetId = target.id;
                    let imageData = await dataManager.fetchTarget(targetId).image;
                    target.base64Data = imageData;
                }
            }

            //finish
            commit('setJournalsListLoading', false);
        });

        rootState.socket.emit('load_journals', rootState.Auth.authEmail, storedIDs);
    },
    /**
     * Update the order of a single journal card.
     * 
     * @param {Object} data - {
     *                           {String} user - User data token,
     *                           {String discipline - The name of the journal's discipline,
     *                           {String} name - The journal's name,
     *                           {Number} newOrder - The journal's new order to update
     *                        }
     */
    updateJournalOrder: ({ state, rootState }, data) => {
        rootState.socket.emit('update_journal_order', data);

        for (let obj in state.journals)
            if (obj.name === data.name && obj.discipline === data.discipline)
                obj.order = data.newOrder;
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}