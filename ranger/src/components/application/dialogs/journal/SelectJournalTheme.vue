<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Give your journal some personality
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
                counter=12
                label='journal name'
                :color='colors.neutral'
            />
        </v-container>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Theme:
            </p>
        </v-container>
        <v-container>
            <v-card
                elevation=0
            >
                <ul class='color-list'>
                    <li
                        class='color-list-item'
                        v-for='color in palette'
                        :key='color'
                    >
                        <v-icon
                            class='color-icon'
                            :color='color'
                            :style='createIconStyle(color)'
                            @click='selectedColor = color'
                        >
                            mdi-checkbox-blank
                        </v-icon>
                    </li>
                </ul>
            </v-card>
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data() {
            return {
                name: '',
                selectedColor: ''
            }
        },
        created() {
            this.selectedColor = this.palette[0];
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storedName: 'getNewJournalName',
                palette: 'getNewJournalColorPalette'
            })
        },
        watch: {
            name(value) {
                this.$store.commit('setNewJournalName', value);
            },
            selectedColor(value) {
                this.$store.commit('setNewJournalColorTheme', value);
            }
        },
        methods: {
            /**
             * Create the appropriate style for a color icon.
             * 
             * @param {String} color - A hex representation of the selected color
             * @returns {Object} {
             *                      {String} borderColor - CSS attribute for border-color
             *                   }
             */
            createIconStyle(color) {
                let borderAlpha = (this.selectedColor === color) ? 'bb' : '20';
                return { borderColor: '#000000' + borderAlpha }
            }
        }
    }
</script>

<style scoped>
    .subtitle {
        font-family: 'comfortaa';
    }
    .color-list {
        list-style-type: none;
    }
    .color-list-item {
        display: inline;
    }
    .color-icon {
        border-width: 1px;
        border-color: #00000020;
        border-style: solid;
        border-radius: 15%;
        margin: 2px;
    }
</style>