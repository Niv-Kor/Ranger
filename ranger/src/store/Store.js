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
            primary: '#4FBE18',
            primaryDark: '#337115',
            secondary: '#DE0D4D',
            neutral: '#78909C'
        },
        regex: {
            email: /^[0-9A-Za-z_-]{1,}@[0-9A-Za-z_-]{1,}\.[0-9A-Za-z.]{1,}$/,
            password: /^[0-9A-Za-z]{8,25}$/
        },
        socket: io(SERVER_DOMAIN)
    },
    getters: {
        getColors: state => {
            return state.colors;
        },
        getRegex: state => {
            return state.regex;
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