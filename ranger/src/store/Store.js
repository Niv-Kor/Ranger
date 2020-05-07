import Vue from 'vue';
import Vuex from 'vuex';
import io from 'socket.io-client';
import AppView from './modules/AppViewModule';
import Auth from './modules/AuthenticationModule'
import JournalCreation from './modules/JournalCreationModule';
import RangeCreation from './modules/RangeCreationModule';
import TargetCreation from './modules/TargetCreationModule';
import Journals from './modules/JournalModule';
import Targets from './modules/TargetModule';
import Ranges from './modules/RangeModule';
import { DataManager } from '../db/DataManager';

const FRONT_SERVER_DOMAIN = 'http://localhost:19200';
const GRADIENT_CONTEXT = require.context('../assets', false, /\.png$/);
Vue.use(Vuex);

export const STORE = new Vuex.Store({
    state: {
        colors: {
            primary: '#de0d4d',
            primaryDark: '#820028',
            secondary: '#ffbd0c',
            neutral: '#78909c',
            gradient: GRADIENT_CONTEXT('./gradient.png')
        },
        socket: null,
        data: new DataManager()
    },
    getters: {
        getColors: state => {
            return state.colors;
        },
        getSocket: state => {
            return state.socket;
        },
        getDataManager: state => {
            return state.data;
        },
        isAnyListLoading: (_state, _getters, _rootState, rootGetters) => {
            let journals = rootGetters.isJournalsListLoading;
            let targets = rootGetters.isTargetsListLoading;
            let ranges = rootGetters.isRangesListLoading;
            return journals || targets || ranges;
        }
    },
    actions: {
        /**
         * Reload all journals, targets and ranges from the data base.
         */
        reloadAllData: async ({ dispatch }) => {
            await dispatch('loadAllJournals');
            await dispatch('loadAllTargets');
            dispatch('loadAllRanges');
        },
        /**
         * Request a client handler from the front server.
         */
        connectServer: async ({ state }) => {
            return new Promise(resolve => {
                state.socket = io(FRONT_SERVER_DOMAIN);
                state.socket.once('connection', port => {
                    state.socket = io(`http://localhost:${port}`);
                    resolve();
                })
            })
        }
    },
    modules: {
        Auth,
        AppView,
        JournalCreation,
        RangeCreation,
        TargetCreation,
        Journals,
        Targets,
        Ranges
    }
});