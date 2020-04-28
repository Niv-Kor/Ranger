import Vue from 'vue';
import Vuex from 'vuex';
import io from 'socket.io-client';
import Auth from './modules/AuthenticationModule'
import JournalCreation from './modules/JournalCreationModule';
import Journals from './modules/JournalModule';
import Ranges from './modules/RangeCreationModule';
import { DataManager } from '../db/DataManager';

const SERVER_DOMAIN = 'http://localhost:19200';
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
        socket: io(SERVER_DOMAIN),
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
        }
    },
    modules: {
        Auth,
        JournalCreation,
        Journals,
        Ranges
    }
});