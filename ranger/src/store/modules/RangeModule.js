const state = {
    ranges: [],
    RangesListLoading: false
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
        console.log('check for date ', date);
        if (!date) return false;

        let data = {
            journalId,
            date
        };

        return new Promise((resolve) => {
            rootState.socket.emit('range_exists', data);
            rootState.socket.on('range_exists', res => resolve(res));
        });
    },
    /**
     * Generate a URL path for a range.
     * The URL will always be the same, based on the range's date and the ID of the
     * journal to which it belongs.
     * 
     * @param {Number} journalName - The discipline of the range's journal,
     *                               followed by the journa's name, and separated by a dash.
     * @param {String} date - The date at which the range took place ('DD-MM-YYYY' format)
     * @returns {String} The appropriate URL path for the range.
     */
    generateRangeURL: (_, { journalName, date }) => {
        return new Promise(resolve => {
            let rangeId = 0;

            for (let i = 0; i < date.length; i++) {
                let ch = date.charCodeAt(i);
                rangeId = ((rangeId << 5) - rangeId) + ch;
                rangeId |= 0;
            }

            let path = `/home/journals/${journalName}/${rangeId}`;
            resolve({ path, journalName, rangeId });
        })
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}