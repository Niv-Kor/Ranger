<template>
  <v-app class='app' :style='styleObj'>
    <transition name='fade' mode='out-in'>
      <splash-screen
        v-if='!splashTimerOver || !isConnectedToServer'
        :timer='6000'
        @over='splashTimerOver = true'
      />
      <auth-home-page
        v-else-if='!userAuthenticated'
        @userAuthenticated='onUserAuthenticated'
      />
      <app-home-page v-else />
    </transition>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import SplashScreen from './components/widgets/SplashScreen';
import AuthHomePage from './components/authentication/AuthHomePage';
import AppHomePage from './components/application/AppHomePage';

export default {
  name: 'App',
  components: {
    SplashScreen,
    AuthHomePage,
    AppHomePage
  },
  data() {
    return {
      splashTimerOver: false
    }
  },
  computed: {
    ...mapGetters({
      userAuthenticated: 'getAuthentication',
      isConnectedToServer: 'isConnectedToServer'
    }),
    styleObj() {
      if (!this.splashTimerOver || !this.isConnectedToServer) {
        return {
          backgroundColor: '#000000'
        };
      }
      else if (!this.userAuthenticated)
        return {
          backgroundImage: 'url(' + require("./assets/background.png") + ')',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '-60mm'
        };
      else return {};
    }
  },
  created() {
    this.onCreated();
  },
  methods: {
    /**
     * Activate when the user is authenticated.
     */
    onUserAuthenticated: async function() {
      this.$store.commit('setAuthentication', true);
      this.$router.push({ path: '/home' }).catch(() => {});
      this.$store.dispatch('reloadAllData');
    },
    /**
     * @returns {Object} {
     *                      email: <String>{The user's authenticated email}
     *                      password: <String>{The user's authenticated password}
     *                   }
     */
    fetchUserDataFromStorage: function() {
      let userDataJSON = window.localStorage.getItem('user');
      return userDataJSON ? JSON.parse(userDataJSON) : null;
    },
    /**
     * Connect to the server and startup the application.
     */
    onCreated: async function() {
      let userData = this.fetchUserDataFromStorage();
      await this.$store.dispatch('connectServer');
      
      //let the user in if his data is already stored
      if (userData) {
        this.$store.commit('setAuthEmail', userData.email);
        this.$store.commit('setAuthPassword', userData.password);
        this.onUserAuthenticated();
      }
      //send the user to authentication page
      else this.$router.push({ path: '/auth' }).catch(() => {});
    }
  }
};
</script>

<style scoped>
  .app {
    overflow: hidden;
  }
  .fade-enter-active {
        animation: fade-in 1s ease-out forwards;
  }
  .fade-leave-active {
      animation: fade-out .5s ease-out forwards;
  }
  @keyframes fade-in {
      from {
          opacity: 0;
      }
      to {
          opacity: 1;
      }
  }
  @keyframes fade-out {
      from {
          opacity: 1;
      }
      to {
          opacity: 0;
      }
  }
</style>