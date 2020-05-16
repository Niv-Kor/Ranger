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
     * @param {Number} rangeId - The ID of the range to load
     * @param {Number} rangeIndex - The index of the range within its journal
     * @param {Number} journalId - The ID of the journal to which the range belongs
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
     * Clear a range from hits entirely.
     * 
     * @param {Number} rangeId - The ID of the range to clear
     * @returns {Boolean} True if the process is succesfull.
     */
    clearRange: async ({ commit, rootState }, { rangeId }) => {
        commit('setRangesListLoading', true);

        return new Promise(resolve => {
            rootState.socket.once('clear_range', res => {
                resolve(res);
    
                //finish loading
                commit('setRangesListLoading', false);
            });
            rootState.socket.emit('clear_range', rangeId);
        });
    },
    /**
     * Delete a range permanently.
     * 
     * @param {Number} rangeId - The ID of the range to delete
     * @returns {Boolean} True if the process is succesfull.
     */
    deleteRange: async ({ commit, rootState }, { rangeId }) => {
        commit('setRangesListLoading', true);

        return new Promise(resolve => {
            rootState.socket.once('delete_range', res => {
                resolve(res);
    
                //finish loading
                commit('setRangesListLoading', false);
            });
            rootState.socket.emit('delete_range', rangeId);
        });
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
     * @param {String} date - The date at which the range took place [DD-MM-YYYY]
     * @returns {String} The appropriate URL path for the range.
     */
    generateRangeURL: (_, { journalName, date }) => {
        return new Promise(resolve => {
            let rangeHash = 0;

            for (let i = 0; i < date.length; i++) {
                let ch = date.charCodeAt(i);
                rangeHash = ((rangeHash << 5) - rangeHash) + ch;
                rangeHash |= 0;
            }

            let path = `/home/journals/${journalName}/${rangeHash}`;
            resolve({ path, journalName, rangeHash });
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
    },
    /**
     * Update a range.
     * 
     * @param {Object} data - {
     *                           {Number} rangeId - The ID of the range to update,
     *                           {String} date - The date at which the range took place
     *                                           [YYYY-MM-DD HH:mm:ss] (optional),
     *                           {Boolean} protocoled - True if the range's data should be
     *                                                  saved for performance analysis (optional)
     *                        }
     * @returns {Boolean} True if the process is successful.
     */
    updateRange: async ({ rootState }, data) => {
        return new Promise(resolve => {
            rootState.socket.once('update_range', res => resolve(res));
            rootState.socket.emit('update_range', data);
        })
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}