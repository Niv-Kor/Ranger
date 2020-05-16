const state = {
    ranges: [],
    RangesListLoading: false,
    rangeIndex: 0
}

const getters = {
    getAllRanges: state => {
        return state.ranges;
    },
    isRangesListLoading: state => {
        return state.RangesListLoading;
    },
    getRangeIndex: state => {
        return state.rangeIndex;
    }
};

const mutations = {
    setRangesListLoading: (state, value) => {
        state.RangesListLoading = value;
    },
    setRangeIndex: (state, value) => {
        state.rangeIndex = value;
    }
};

const actions = {
    /**
     * Load all of the user's ranges.
     */
    loadAllRanges: async ({ commit, state, rootState }) => {
        commit('setRangesListLoading', true);

        return new Promise(resolve => {
            let finish = () => {
                commit('setRangesListLoading', false);
                resolve();
            }
    
            let journalKeys = [];
            let userJournals = rootState.Journals.journals;
            let processes = userJournals.length;
    
            if (processes === 0) finish();
            else {
                for (let journal of userJournals) journalKeys.push(journal.id);
                for (let id of journalKeys) {
                    let data = {
                        user: rootState.Auth.authEmail,
                        journalId: id
                    }

                    rootState.socket.once('load_ranges', async res => {
                        processes--;
                        state.ranges[`journal #${res.journalId}`] = res.ranges;
                        let journalObj = state.ranges[`journal #${res.journalId}`];
                        
                        //load all hits for each range
                        if (journalObj.length) {
                            for (let i in journalObj) {
                                let range = journalObj[i];
                                let rangeId = range.id;
    
                                rootState.socket.once(`load_hits_${rangeId}`, res => {
                                    range.rounds = res
                                    
                                    //finish loading ranges and their hits
                                    if (i == journalObj.length - 1 && processes === 0) finish();
                                });
                                
                                rootState.socket.emit('load_hits', rangeId);
                            }
                        }
                        //finish loading without ranges
                        else if (processes === 0) finish();
                    });
    
                    rootState.socket.emit('load_ranges', data);
                }
            }
        })
    },
    /**
     * Reload a single range.
     * 
     * @param {Number} rangeId - The ID of the range to load.
     * @param {Number} journalId - The ID of the journal to which the range belongs.
     */
    reloadRangeHits: async ({ commit, state, rootState }, { rangeId, rangeIndex, journalId }) => {
        commit('setRangesListLoading', true);

        rootState.socket.once(`load_hits_${rangeId}`, res => {
            let range = state.ranges[`journal #${journalId}`][rangeIndex];
            range.rounds = res;

            //finish loading
            commit('setRangesListLoading', false);
        });
        rootState.socket.emit('load_hits', rangeId);
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
            rootState.socket.once('range_exists', res => resolve(res));
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
    },
    /**
     * Record a hit in the database.
     * 
     * @param {Object} hit - {
     *                          {Number} hitId - The ID of the hit (in range context),
     *                          {Number} rangeId - The ID of the range,
     *                          {Object} point - {
     *                                              {Number} x - x coordinates [%],
     *                                              {Number} y - y coordinates [%]
     *                                           },
     *                          {Number} score - The achieved score of the hit,
     *                          {Number} round - The round number in which the hit was made
     *                       }
     */
    recordHit: ({ rootState }, hit) => {
        rootState.socket.emit('record_hit', hit);
    },
    /**
     * Remove a hit from the database.
     * 
     * @param {Object} hit - {
     *                          {Number} hitId - The ID of the hit (in range context),
     *                          {Number} rangeId - The ID of the range
     *                       }
     */
    removeHit: ({ rootState }, hit) => {
        rootState.socket.emit('remove_hit', hit);
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}