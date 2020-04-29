const MOMENT = require('moment');

const state = {
    newRangeDate: {
        day: 0,
        month: 0,
        year: 0
    },
    newRangeTime: {
        hours: 0,
        minutes: 0
    },
    newRangeSelectedTargetId: -1,
}

const getters = {
    getNewRangeDate: state => {
        return state.newRangeDate;
    },
    getNewRangeTime: state => {
        return state.newRangeTime;
    },
    getNewRangeDefaultTarget: state => {
        return state.newRangeDefaultTarget;
    }
};

const mutations = {
    setNewRangeDate: (state, { day, month, year }) => {
        state.newRangeDate.day = day;
        state.newRangeDate.month = month;
        state.newRangeDate.year = year;
    },
    setNewRangeTime: (state, { hours, minutes }) => {
        state.newRangeTime.hours = hours;
        state.newRangeTime.minutes = minutes;
    },
    setNewRangeSelectedTargetId: (state, value) => {
        state.newRangeSelectedTargetId = value;
    }
};

const actions = {
    initNewRangeValues: ({ commit }) => {
        //find this moment
        let today = MOMENT().format('DD-MM-YYYY-hh-mm').split('-');
        let dayPart = MOMENT().format('a');

        //convert am:pm to 24 model
        if (dayPart === 'pm') {
            today[3] = parseInt(today[3]) + 12;
            if (today[3] === 24) today[3] = 0;
        }

        commit('setNewRangeDate', {
            day: parseInt(today[0]),
            month: parseInt(today[1]),
            year: parseInt(today[2])
        });
        commit('setNewRangeTime', {
            hours: parseInt(today[3]),
            minutes: parseInt(today[4])
        });
    },
    createRange: (/*{ state }*/) => {
        //TODO
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}