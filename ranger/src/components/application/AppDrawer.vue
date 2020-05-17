<template>
    <div class='drawer'>
        <v-navigation-drawer
            v-bind:value='model'
            color='white'
            app
            absolute
        >
            <v-list nav>
                <!-- functionality -->
                <v-list-item
                    v-for='item in items.functionality'
                    :key='item.title'
                    link
                    @click='onItemClick(item)'
                >
                    <v-list-item-icon>
                        <v-icon
                            v-if='item.icon.type === 0'
                            :color='colors.secondary'
                        >
                            {{ item.icon.name }}
                        </v-icon>
                        <fa-icon
                            v-else
                            :icon='item.icon.name'
                            :color='colors.secondary'
                            size='lg'
                        />
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title >{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <!-- system -->
                <v-list-item
                    v-for='item in items.system'
                    :key='item.title'
                    link
                    @click='onItemClick(item)'
                >
                    <v-list-item-icon>
                        <v-icon
                            v-if='item.icon.type === 0'
                            :color='colors.secondary'
                        >
                            {{ item.icon.name }}
                        </v-icon>
                        <fa-icon
                            v-else
                            :icon='item.icon.name'
                            :color='colors.secondary'
                            size='lg'
                        />
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-dialog
            v-model='confirmLogout'
            persistent
        >
            <v-card class='confirmation-card'>
                <v-card-title
                    class='logout-title'
                    :color='colors.secondary'
                    :style="{ backgroundColor: colors.secondary }"
                >
                    Are you sure?
                </v-card-title>
                <v-card-text class='logout-text'>
                    Logging out of the system might cancel any ongoing processes you are yet to finish.
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        class='confirmation-btn'
                        text
                        :color='colors.secondary'
                        @click='confirmLogout = false'
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        class='confirmation-btn'
                        text
                        :color='colors.primary'
                        @click='logout'
                    >
                        Log out
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        props: [
            'model'
        ],
        data() {
            return {
                items: {
                    functionality: [
                        { 
                            title: 'Dashboard',
                            icon: {
                                name: 'home',
                                type: 1
                            },
                            path: '/home',
                            func: () => {}
                        },
                        { 
                            title: 'My Journals',
                            icon: {
                                name: 'journal-whills',
                                type: 1
                            },
                            path: '/home/journals',
                            func: () => {}
                        },
                        {
                            title: 'Performance',
                            icon: {
                                name: 'chart-pie',
                                type: 1
                            },
                            path: '/home/performance',
                            func: () => {}
                        },
                    ],
                    system: [
                        {
                            title: 'Settings',
                            icon: {
                                name: 'mdi-cog',
                                type: 0
                            },
                            path: '/home/settings',
                            func: () => {}
                        },
                        {
                            title: 'Log out',
                            icon: {
                                name: 'sign-out-alt',
                                type: 1
                            },
                            path: '',
                            func: () => { this.confirmLogout = true; }
                        }
                    ]
                },
                confirmLogout: false
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        },
        methods: {
            /**
             * Activate when an item in the drawer is clicked.
             * 
             * @emits {Null} drawerClosed
             */
            onItemClick: function(item) {
                if (item.path) this.goto(item.path);
                if (item.func) item.func();
                this.$emit('drawerClosed');
            },
            /**
             * Push an address to the router.
             * 
             * @param {String} path - The address to push to the router
             */
            goto: function(path) {
                this.$router.push({ path: path }).catch(() => {});
            },
            /**
             * Log out of the application and return to the authentication page.
             */
            logout: function() {
                this.confirmLogout = false;
                window.localStorage.removeItem('user');
                this.$store.commit('setAuthentication', false);
                this.goto('/auth');
            }
        }
    }
</script>

<style scoped>
    .drawer {
        position: absolute;
        top: 55px;
        left: 0;
        right: 0;
        font-family: 'Comfortaa';
    }
    .list-title {
        font-size: 42px;
    }
    .confirmation-card {
        font-family: 'Comfortaa';
    }
    .confirmation-btn {
        text-transform: none;
        font-weight: 700;
    }
    .logout-text {
        margin: 20px 0 20px 0;
    }
    .logout-title {
        color: #ffffff;
    }
</style>