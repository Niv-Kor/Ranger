<template>
    <div>
        <v-app-bar
            app
            elevation=0
            :color='colors.primaryDark'
        >
            <v-app-bar-nav-icon
                dark
                @click='drawer = !drawer'
            />
            <div class='d-flex align-center'>
                <div v-if='appTitle.title' class='app-title'>
                    <span :style='{ color: colors.secondary + "aa" }' class='app-title prefix'>
                        {{ appTitle.prefix }}
                    </span>
                    <span class='app-title suffix'>
                        {{ appTitle.title }}
                    </span>
                </div>
                <div v-else class='d-flex align-center'>
                    <v-img
                        class='shrink mr-2'
                        contain
                        src='../../assets/logos/icon.png'
                        transition='scale-transition'
                        width='40'
                    />
                    <v-img
                        min-width='100'
                        src='../../assets/logos/name_white.png'
                        width='100'
                    />
                </div>
                <v-menu
                    offset-y
                    bottom
                    right
                    auto
                    transition="slide-y-transition"
                >
                    <template v-slot:activator='{ on }'>
                        <v-icon
                            class='settings-dots'
                            color='#ffffffbb'
                            v-on='on'
                        >
                            mdi-dots-vertical
                        </v-icon>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for='(item, index) in settingsMenu'
                            :key='index'
                            @click='gotoMenuOption(item)'
                        >
                        <v-icon class='settings-icon' v-if='item.icon'>{{ item.icon }}</v-icon>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
            <app-drawer
                v-bind:model='drawer'
                @drawerClosed='drawer = false'
            />
        </v-app-bar>
        <v-content>
            <v-container fluid fill-height>
                <router-view />
            </v-container>
        </v-content>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import AppDrawer from './AppDrawer';

    export default {
        components: {
            AppDrawer
        },
        data() {
            return {
                drawer: false,
                settingsMenuItems: []
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                buttonFunc: 'getButtonFunction'
            }),
            currentRouterPath() { return this.$router.app._route.path; },
            currentPage() {
                let path = this.currentRouterPath;
                let homePrefix = '/home';
                if (path.includes(homePrefix)) path = path.substring(homePrefix.length);
                return path;
            },
            settingsMenu() {
                return this.$store.getters.getMenuItems(this.currentRouterPath);
            },
            appTitle() {
                return this.$store.getters.getAppTitle(this.currentRouterPath);
            }
        },
        methods: {
            /**
             * Go to the appropriate settings page.
             * 
             * @param {Object} item - {
             *                           {String} title - The item's name,
             *                           {String} icon - Item's mdi icon,
             *                           {String} path - The path which the item should send the router,
             *                           {Boolean} pathAbsolute - True if the item's path is the whole path to be redirected to,
             *                                                    or just an addition to the current one.
             *                        }
             */
            gotoMenuOption(item) {
                if (this.currentRouterPath.includes(item.path)) return;

                let pathPrefix = item.pathAbsolute ? '' : this.currentRouterPath;
                let path = pathPrefix + item.path;
                this.$router.push({ path }).catch(() => {});
            }
        }
    }
</script>

<style scoped>
    .app-title {
        color: #ffffff;
    }
    .app-title .prefix {
        font-size: 22px !important;
        margin-right: 15px;
    }
    .app-title .suffix {
        font-size: 18px !important;
        margin-left: -10px;
    }
    .settings-dots {
        position: absolute;
        right: 10px;
    }
    .settings-icon {
        margin-right: 10px;
    }
</style>