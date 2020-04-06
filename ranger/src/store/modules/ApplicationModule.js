const state = {
    buttonFunction: [
        {
            page: '/journals',
            title: 'Upload a survey',
            popupModel: false,
            tabColor: 'red'
        },
        {
            page: '/performance',
            title: 'Fill a survey',
            popupModel: false,
            tabColor: 'green'
        }
    ]
}

const getters = {
    getButtonFunction: (state) => page => {
        if (page) return state.buttonFunction.filter(x => x.page === page)[0];
        else return state.buttonFunction;
    }
};

const mutations = {
    emitPopupEvent: (state, { page, flag }) => {
        let event = state.buttonFunction.filter(x => x.page === page)[0];
        if (event) event.popupModel = flag;
    }
};

const actions = {
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}