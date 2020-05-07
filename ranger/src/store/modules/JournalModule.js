const state = {
    journals: [],
    journalsListLoading: false,
    selectedJournal: 0
}

const getters = {
    getAllJournals: state => {
        return state.journals;
    },
    isJournalsListLoading: state => {
        return state.journalsListLoading;
    },
    getSelectedJournalIndex: state => {
        return state.selectedJournal;
    }
};

const mutations = {
    setJournalsListLoading: (state, value) => {
        state.journalsListLoading = value;
    },
    setSelectedJournalIndex: (state, value) => {
        state.selectedJournal = value;
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

        return new Promise(resolve => {
            rootState.socket.once('load_journals', async res => {
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
                resolve();
            });

            rootState.socket.emit('load_journals', rootState.Auth.authEmail, storedIDs);
        })
    },
    /**
     * Update the order of a single journal card.
     * 
     * @param {Object} data - {
     *                           {String} user - User token,
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
    },
    /**
     * Update a journal's data.
     * 
     * @param {Object} data - {
     *                           {Number} id - Journal's ID,
     *                           {String} name - Journal's new name (optional),
     *                           {String discipline - Journal's new discipline (optional),
     *                           {Number} targetId - Journal's new default target ID (optional),
     *                           {String} colorTheme - Journal's new color theme (optional)
     *                        }
     * @returns {Boolean} True if the process was successful.
     */
    updateJournal: async ({ rootState }, data) => {
        return new Promise(resolve => {
            rootState.socket.once('update_journal', res => resolve(res));
            rootState.socket.emit('update_journal', data);
        })
    },
    /**
     * Delete all ranges of a particular journal.
     * 
     * @param {Number} id - The ID of the journal that contains the ranges to delete.
     * @returns {Boolean} True if the journal's ranges have been deleted successfully.
     */
    clearJournalRanges: async ({ rootState }, id) => {
        return new Promise(resolve => {
            rootState.socket.once('clear_journal_ranges', res => resolve(res));
            rootState.socket.emit('clear_journal_ranges', id);
        })
    },
    /**
     * Delete a journal.
     * 
     * @param {Number} id - The ID of the journal to delete.
     * @returns {Boolean} True if the journal has been deleted successfully.
     */
    deleteJournal: async ({ rootState }, id) => {
        return new Promise(resolve => {
            rootState.socket.once('delete_journal', res => resolve(res));
            rootState.socket.emit('delete_journal', id);
        })
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}