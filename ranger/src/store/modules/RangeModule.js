const state = {
    ranges: [],
    RangesListLoading: false,
}

const getters = {
    getAllRanges: state => {
        return state.ranges;
    },
    isRangesListLoading: state => {
        return state.RangesListLoading;
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
            processes--;
            state.ranges[`journal #${res.journalId}`] = res.ranges;

            //finish
            if (processes === 0) commit('setRangesListLoading', false);
        });

        let journalKeys = [];
        let userJournals = rootState.Journals.journals;
        let processes = userJournals.length;
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
     * Check if a range alredy exists in the data base.
     * 
     * @param {Number} journalId - The ID of the journal to which the range belong
     * @param {String} date - The date at which the range took place
     * @returns {Boolean} True if the range already exists.
     */
    checkRangeExists: async ({ rootState }, { journalId, date }) => {
        if (!date) return false;

        let data = {
            journalId,
            date
        };

        return new Promise((resolve) => {
            rootState.socket.emit('range_exists', data);
            rootState.socket.on('range_exists', res => resolve(res));
        });
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}