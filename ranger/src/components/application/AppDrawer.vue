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
                        <v-icon :color='colors.secondary'>{{ item.icon }}</v-icon>
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
                        <v-icon :color='colors.secondary'>{{ item.icon }}</v-icon>
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
                <v-card-title>Are you sure?</v-card-title>
                <v-card-text>
                    Logging out of the system might cancel any ongoing processes you are yet to finish.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class='confirmation-btn'
                        :color='colors.secondary'
                        text
                        @click='confirmLogout = false'
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        class='confirmation-btn'
                        :color='colors.secondary'
                        text
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
                            icon: 'mdi-home',
                            path: '/home',
                            func: () => {}
                        },
                        { 
                            title: 'My Journals',
                            icon: 'mdi-notebook',
                            path: '/home/journals',
                            func: () => {}
                        },
                        {
                            title: 'Performance',
                            icon: 'mdi-chart-arc',
                            path: '/home/performance',
                            func: () => {}
                        },
                    ],
                    system: [
                        {
                            title: 'Settings',
                            icon: 'mdi-cog',
                            path: '/home/settings',
                            func: () => {}
                        },
                        {
                            title: 'Log out',
                            icon: 'mdi-logout-variant',
                            path: '',
                            func: this.logoutConfirmation
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
            onItemClick: function(item) {
                if (item.path) this.goto(item.path);
                if (item.func) item.func();
                this.$emit('drawerClosed');
            },
            goto: function(path) {
                this.$router.push({ path: path }).catch(() => {});
            },
            logoutConfirmation: function() {
                this.confirmLogout = true;
            },
            logout: function() {
                this.confirmLogout = false;
                window.localStorage.removeItem('user');
                this.$store.commit('setAuthentication', false);
            }
        }
    }
</script>

<style>
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
</style>