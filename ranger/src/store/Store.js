import Vue from 'vue';
import Vuex from 'vuex';
import io from 'socket.io-client';
import Auth from './modules/AuthenticationModule'
import App from './modules/ApplicationModule';
import JournalCreation from './modules/JournalCreationModule';

const SERVER_DOMAIN = 'http://localhost:19200';
Vue.use(Vuex);

export const STORE = new Vuex.Store({
    state: {
        colors: {
            primary: '#4fbe18',
            primaryDark: '#337115',
            secondary: '#de0d4d',
            neutral: '#78909c'
        },
        socket: io(SERVER_DOMAIN)
    },
    getters: {
        getColors: state => {
            return state.colors;
        },
        getSocket: state => {
            return state.socket;
        }
    },
    modules: {
        Auth,
        App,
        JournalCreation
    }
});