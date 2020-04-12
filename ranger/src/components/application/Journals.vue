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

        <target-canvas
            :src='src'
            :hits=50
            @hit='hit'
        />
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';
    import TargetCanvas from '../widgets/TargetCanvas';

    const ARCHERY_CONTEXT = require.context('../../assets/targets/large/archery', false, /\.png$/);

    export default {
        components: {
            TargetCanvas
        },
        data() {
            return {
                list: [],
                center: {x: 10, y: 10}
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            }),
            src() {
                return ARCHERY_CONTEXT('./fita.png');
            },
        },
        methods: {
            hit(data) {
                console.log(data);
            }
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