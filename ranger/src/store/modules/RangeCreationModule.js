const MOMENT = require('moment');

const state = {
    newRangeDate: {
        day: 0,
        month: 0,
        year: 0
    },
    newRangeTime: {
        hours: 0,
        minutes: 0,
        seconds: 0
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
    getNewRangeFormattedDateTime: state => {
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
        let HH = padZeros(time.hours, 2);
        let mm = padZeros(time.minutes, 2);
        let ss = padZeros(time.seconds, 2);

        //YYYY-MM-DD hh:mm:ss
        return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
    }
};

const mutations = {
    setNewRangeDate: (state, { day, month, year }) => {
        state.newRangeDate.day = day;
        state.newRangeDate.month = month;
        state.newRangeDate.year = year;
    },
    setNewRangeTime: (state, { hours, minutes, seconds }) => {
        state.newRangeTime.hours = hours;
        state.newRangeTime.minutes = minutes;
        state.newRangeTime.seconds = seconds;
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
        let today = MOMENT().format('DD-MM-YYYY-HH-mm-ss').split('-');

        commit('setNewRangeDate', {
            day: parseInt(today[0]),
            month: parseInt(today[1]),
            year: parseInt(today[2])
        });

        commit('setNewRangeTime', {
            hours: parseInt(today[3]),
            minutes: parseInt(today[4]),
            seconds: parseInt(today[5])
        });
    },
    /**
     * Create a new range in the data base.
     */
    createRange: async ({ dispatch, state, rootState, getters, rootGetters }) => {
        return new Promise(resolve => {
            //get journal id
            let journals = rootGetters.getAllJournals;
            let selectedJournalIndex = rootGetters.getSelectedJournalIndex;
            let selectedJournalId = journals[selectedJournalIndex].id;

            let data = {
                journalId: selectedJournalId,
                targetId: state.newRangeSelectedTargetId,
                date: getters.getNewRangeFormattedDateTime
            }

            rootState.socket.on('create_range', res => {
                dispatch('loadAllRanges');
                resolve(res)
            });
            rootState.socket.emit('create_range', data);
        });
    }
};

export default {
    state,
    getters,
    mutations,
    actions
}