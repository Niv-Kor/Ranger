const state = {
    journals: []
}

const getters = {
    getAllJournals: (state) => {
        return state.journals;
    }
};

const mutations = {
};

const actions = {
    loadAllJournals: ({ state, rootState }) => {
        rootState.socket.emit('load_journals', rootState.Auth.authEmail);
        rootState.socket.on('load_journals', res => state.journals = res );
    },
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