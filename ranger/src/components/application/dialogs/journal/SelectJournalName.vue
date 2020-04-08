<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Give your journal a name
            </p>
        </v-container>
        <v-container>
            <v-text-field
                v-model='name'
                height=10
                dense
                rounded
                outlined
                clearable
                counter=20
                :color='colors.neutral'
            />
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    const DEFAULT_NAME = 'My Journal';
    
    export default {
        data() {
            return {
                name: ''
            }
        },
        created() {
            this.name = this.storedName ? this.storedName : DEFAULT_NAME;
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storedName: 'getNewJournalName'
            }),
        },
        watch: {
            name(value) {
                this.$store.commit('setNewJournalName', value)
            }
        },
        methods: {
            canContinue: function() {
                
            }
        }
    }
</script>

<style scoped>
    .subtitle {
        font-family: 'comfortaa';
    }
</style>