import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import vuetify from './plugins/vuetify';
import { STORE } from './store/Store';
import { ROUTES } from './Routes';

const ROUTER = new VueRouter({
  routes: ROUTES
});

Vue.config.productionTip = false;
Vue.use(VueRouter);

new Vue({
  vuetify,
  router: ROUTER,
  store: STORE,
  render: h => h(App),
}).$mount('#app')