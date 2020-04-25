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
        <plus-button
            v-if='buttonFunc(currentPage)'
            @click="$store.commit('emitPopupEvent', { page: currentPage, flag: true })"
        />
        <journal-dialog-box
            :model="buttonFunc('/journals').popupModel"
            @close="$store.commit('emitPopupEvent', { page: currentPage, flag: false })"
        />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import AppDrawer from './AppDrawer';
    import PlusButton from '../widgets/PlusButton';
    import JournalDialogBox from './dialogs/journal/JournalDialogBox';

    export default {
        components: {
            AppDrawer,
            PlusButton,
            JournalDialogBox
        },
        data() {
            return {
                drawer: false
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                buttonFunc: 'getButtonFunction'
            }),
            currentPage() {
                let path = this.$router.app._route.path;
                let homePrefix = '/home';
                if (path.includes(homePrefix)) path = path.substring(homePrefix.length);
                return path;
            }
        },
        methods: {
            /**
             * Activate when the plus button is pressed.
             */
            add: function() {
                this.$store.commit('emitPopupEvent', this.currentPage, true)
            }
        }
    }
</script>