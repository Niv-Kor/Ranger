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
    getNewRangeSelectedTargetId: state => {
        return state.newRangeSelectedTargetId;
    },
    getNewRangeDateTimeFormat: state => {
        let padZeros = (num, pad) => {
            let numLen = ('' + num).length;
            
            for (let i = 0; i < pad - numLen; i++)
                num = 0 + num;

            return num;
        }

        let date = state.newRangeDate;
        let time = state.newRangeTime;
        let YYYY = padZeros(date.year, 4);
        let MM = padZeros(date.month, 2);
        let DD = padZeros(date.day, 2);
        let hh = padZeros(time.hours, 2);
        let mm = padZeros(time.minutes, 2);

        //YYYY-MM-DD hh:mm:ss
        return `${YYYY}-${MM}-${DD} ${hh}:${mm}:00`;
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
    /**
     * Init all values.
     */
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
    /**
     * Create a new range in the data base.
     */
    createRange: async ({ state, rootState, getters, rootGetters }) => {
        return new Promise(resolve => {
            //get journal id
            let journals = rootGetters.getAllJournals;
            let selectedJournalIndex = rootGetters.getSelectedJournalIndex;
            let selectedJournalId = journals[selectedJournalIndex].id;

            let data = {
                journalId: selectedJournalId,
                targetId: state.newRangeSelectedTargetId,
                date: getters.getNewRangeDateTimeFormat
            }

            rootState.socket.on('create_range', res => resolve(res));
            rootState.socket.emit('create_range', data);
        });
    }
};

export default {
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
}