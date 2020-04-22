import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import vuetify from './plugins/vuetify';
import { STORE } from './store/Store';
import { ROUTES } from './Routes';
import Vue2TouchEvents from 'vue2-touch-events';
import VueKonva from 'vue-konva';
import { longClickDirective } from 'vue-long-click'
import ImageMagnifier from 'vue-image-magnifier';
import FileSelector from 'vue-file-selector';
import Sortable from 'vue-drag-sortable';

const ROUTER = new VueRouter({
  routes: ROUTES
});

const longClickInstance = longClickDirective({delay: 800, interval: 0});
Vue.directive('longclick', longClickInstance);
Vue.config.productionTip = false;
Vue.use(Vue2TouchEvents);
Vue.use(ImageMagnifier);
Vue.use(FileSelector);
Vue.use(VueRouter);
Vue.use(VueKonva);
Vue.component('sortable', Sortable);

new Vue({
  vuetify,
  router: ROUTER,
  store: STORE,
  render: h => h(App),
}).$mount('#app')