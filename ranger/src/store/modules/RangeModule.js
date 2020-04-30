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
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}