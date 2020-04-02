import Vue from 'vue';
import Vuex from 'vuex';
import Auth from './modules/AuthenticationModule'
import App from './modules/ApplicationModule';
import io from 'socket.io-client';

const SERVER_DOMAIN = 'http://localhost:19200';
Vue.use(Vuex);

export const STORE = new Vuex.Store({
    state: {
        colors: {
            primary: '#4fbe18',
            primaryDark: '#337115',
            secondary: '#de0d4d',
            neutral: '#666666'
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
        App
    }
});