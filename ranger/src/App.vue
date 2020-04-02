<template>
  <v-app :style='styleObj'>
      <auth-home-page
        v-if='!userAuthenticated'
        @userAuthenticated='onUserAuthenticated'
      />
      <app-home-page
        v-else
      />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import AuthHomePage from './components/authentication/AuthHomePage';
import AppHomePage from './components/application/AppHomePage';

export default {
  name: 'App',
  components: {
    AuthHomePage,
    AppHomePage
  },
  created() {
    let userData = this.fetchUserDataFromStorage();
    
    //let the user in if his data is already stored
    if (userData) {
      this.$store.commit('setAuthEmail', userData.email);
      this.$store.commit('setAuthPassword', userData.password);
      this.onUserAuthenticated();
    }
    //send the user to authentication page
    else this.$router.push({ path: '/auth' }).catch(() => {});
  },
  computed: {
    ...mapGetters({
      userAuthenticated: 'getAuthentication'
    }),
    styleObj() {
      if (!this.userAuthenticated)
        return {
          "background-image": 'url(' + require("./assets/background.png") + ')',
          'background-repeat': 'no-repeat',
          'background-position': '-60mm'
        };
      else return {};
    }
  },
  methods: {
    onUserAuthenticated: function() {
      this.$store.commit('setAuthentication', true);
      this.$router.push({ path: '/home' }).catch(() => {});
    },
    fetchUserDataFromStorage: function() {
      let userDataJSON = window.localStorage.getItem('user');
      return userDataJSON ? JSON.parse(userDataJSON) : null;
    }
  }
};
</script>