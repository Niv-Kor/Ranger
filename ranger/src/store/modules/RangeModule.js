const state = {
    ranges: [],
    RangesListLoading: false,
}

const getters = {
    getAllRanges: state => {
        return state.ranges;
    }
};

const mutations = {
    setRangesListLoading: (state, value) => {
        state.RangesListLoading = value;
    }
};

const actions = {
    /**
     * Load all of the user's ranges.
     */
    loadAllRanges: async ({ commit, state, rootState }) => {
        commit('setRangesListLoading', true);

        rootState.socket.on('load_ranges', async res => {
            state.ranges[`journal #${res.journalId}`] = res.ranges;

            //finish
            commit('setRangesListLoading', false);
        });

        let journalKeys = [];
        let userJournals = rootState.Journals.journals;
        for (let journal of userJournals) journalKeys.push(journal.id);

        for (let id of journalKeys) {
            let data = {
                user: rootState.Auth.authEmail,
                journalId: id
            }

            rootState.socket.emit('load_ranges', data);
        }
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