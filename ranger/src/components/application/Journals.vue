<template>
    <v-container
        class='container'
        fluid
    >
        <h1>Shooting Journals</h1>
        <p
        class='no-surveys-message'
        v-if='!list.length'
        >
            You don't own any journals.<br>
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