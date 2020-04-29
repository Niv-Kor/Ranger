const state = {
    journals: [],
    targets: [],
    journalsListLoading: false,
    selectedJournal: 0,
    testImage: ''
}

const getters = {
    getAllJournals: state => {
        return state.journals;
    },
    getAllTargets: state => {
        return state.targets;
    },
    isJournalsListLoading: state => {
        return state.journalsListLoading;
    },
    getSelectedJournalIndex: state => {
        return state.selectedJournalIndex;
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

                //push target to indexedDB
                if (target.base64Data) {
                    dataManager.insertTarget({
                        id: target.id,
                        image: target.base64Data
                    });
                }
                //pull target from indexedDB
                else {
                    let targetId = target.id;
                    let imageData = await dataManager.fetchTarget(targetId);
                    target.base64Data = imageData.image;
                }
            }

            //finish
            commit('setJournalsListLoading', false);
        });

        rootState.socket.emit('load_journals', rootState.Auth.authEmail, storedIDs);
    },
    /**
     * Load all of the user's targets.
     */
    loadAllTargets: async ({ state, rootState }) => {
        let dataManager = rootState.data;
        let storedIDs = await dataManager.getTargetsIDs();
        state.targets = [];

        rootState.socket.on('get_targets', async res => {
            for (let target of res) {
                //push target to indexedDB
                if (target.base64Data) {
                    dataManager.insertTarget({
                        id: target.id,
                        image: target.base64Data
                    });
                }
                //pull target from indexedDB
                else {
                    let targetId = target.id;
                    let imageData = await dataManager.fetchTarget(targetId);
                    target.base64Data = imageData.image;
                }

                state.targets.push(target);
            }

            //sort array - defaults last
            state.targets.sort((e1, e2) => {
                let user1 = e1.user;
                let user2 = e2.user;

                if (user1 === 'default' && user2 === rootState.Auth.authEmail) return 1;
                else if (user1 === rootState.Auth.authEmail && user2 === 'default') return -1;
                else return 0;
            })
        });

        //load both default and personal targets
        let users = [rootState.Auth.authEmail, 'default'];
        for (let user of users) rootState.socket.emit('get_targets', user, storedIDs);
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