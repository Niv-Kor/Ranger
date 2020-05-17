const state = {
    targets: [],
    targetsListLoading: false
}

const getters = {
    getAllTargets: state => {
        return state.targets;
    },
    isTargetsListLoading: state => {
        return state.targetsListLoading;
    }
}

const mutations = {
    setTargetsListLoading: (state, flag) => {
        state.targetsListLoading = flag;
    }
}

const actions = {
    /**
     * Load all of the user's targets, including the default ones.
     */
    loadAllTargets: async ({ commit, state, rootState }) => {
        commit('setTargetsListLoading', true);
        let dataManager = rootState.data;
        let storedIDs = await dataManager.getTargetsIDs();
        let loadingCounter;
        state.targets = [];

        let loadUserTargets = async (res, counter) => {
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
            //finished all downloads
            if (counter === 0) commit('setTargetsListLoading', false);

            //sort array - defaults last
            state.targets.sort((e1, e2) => {
                let user1 = e1.user;
                let user2 = e2.user;

                if (user1 === 'default' && user2 === rootState.Auth.authEmail) return 1;
                else if (user1 === rootState.Auth.authEmail && user2 === 'default') return -1;
                else return 0;
            })
        }

        //load both default and personal targets
        let users = [rootState.Auth.authEmail, 'default'];
        loadingCounter = users.length;
        for (let user of users) {
            let data = {
                user,
                storedIDs,
                getNonActive: true
            }

            rootState.socket.once(`get_targets_${user}`, async res => loadUserTargets(res, --loadingCounter));
            rootState.socket.emit('get_targets', data);
        }
    },
    /**
     * Update a target.
     * 
     * @param {Object} {
     *                    {Number} id - The ID of the target to be updated,
     *                    {Number} rings - Amount of rings in the target,
     *                    {Number} ringDiameter - Diameter of each ring in the target,
     *                    {Object} center - {
     *                                         {Number} x - x coordinates (in percentages),
     *                                         {Number} y - y coordinates (in percentages)
     *                                      }
     *                 }
     * @returns {Boolean} True if the process is successful.
     */
    updateTarget: async ({ rootState }, data) => {
        return new Promise(resolve => {
            rootState.socket.once('update_target', res => resolve(res));
            rootState.socket.emit('update_target', data);
        })
    },
    /**
     * Delete a target.
     * Delete it permanently if it's not contained in any journals nor ranges,
     * otherwise just deactivate it.
     * 
     * @param {Number} targetId - The ID of the target to be deleted
     * @returns {Boolean} True if the process is successful.
     */
    deleteTarget: async ({ dispatch, rootState }, targetId) => {
        let data = {
            user: rootState.Auth.authEmail,
            id: targetId
        }

        return new Promise(resolve => {
            rootState.socket.once('delete_target', res => {
                if (res.success) {
                    //delete target cache from indexedDB
                    if (res.permanent) {
                        let dataManager = rootState.data;
                        dataManager.deleteTarget(targetId);
                    }

                    dispatch('reloadAllData').then(() => resolve(true));
                }
                else resolve(false);
            });
            rootState.socket.emit('delete_target', data);
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}