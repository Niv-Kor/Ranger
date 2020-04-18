<template>
    <v-container
        class='container'
        fluid
    >
        <h1>Shooting Journals</h1>
        <p
            v-if='!list.length'
            class='no-surveys-message'
        >
            You don't own any journals yet.<br>
            Use the '+' button below<br>
            to get started.
        </p>
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                list: []
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        }
    }
</script>

<style scoped>
    .container {
        text-align: center;
        font-family: 'Comfortaa';
    }
    .no-surveys-message {
        margin-top: 20px;
    }
</style>