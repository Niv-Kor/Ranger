<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Before we finish,<br>
                let's preview your new journal
            </p>
        </v-container>
        <v-container>
            <span class='details-header'>
                Name:<br>
            </span>
            <span :style="{ color: colors.primary }">
                {{ journalName }}
                <v-icon
                    class='theme-color-preview'
                    small
                    :color='colorTheme'
                >
                    mdi-checkbox-blank
                </v-icon>
                <span
                    class='change-btn'
                    :style="{ color: colors.neutral + '!important' }"
                    @click='change(3)'
                >
                    change
                </span>
            </span>
            <br><br>
            <span class='details-header'>
                Discipline:<br>
            </span>
            <span :style="{ color: colors.primary }">
                {{ discipline }}
                <span
                    class='change-btn'
                    :style="{ color: colors.neutral + '!important' }"
                    @click='change(0)'
                >
                    change
                </span>
            </span>
            <br><br>
            <span class='details-header'>
                Default Target:<br>
            </span>
            <span :style="{ color: colors.primary }">
                {{ defTarget }}
                <span
                    class='change-btn'
                    :style="{ color: colors.neutral + '!important' }"
                    @click='change(1)'
                >
                    change
                </span>
            </span>
            <v-img
                v-if='targetThumbnail'
                class='target-thumbnail'
                :src='targetThumbnail'
                :width=80
            />
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    
    export default {
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalName: 'getNewJournalName',
                defaultDisciplineName: 'getNewJournalDiscipline',
                customDisciplineName: 'getNewJournalCustomDiscipline',
                predefTarget: 'getNewJournalTarget',
                customTarget: 'getNewJournalUploadedTarget',
                usingCustomDiscipline: 'useCustomDiscipline',
                usingCustomTarget: 'useUploadedCustomTarget',
                colorTheme: 'getNewJournalColorTheme'
            }),
            discipline() {
                let custom = this.usingCustomDiscipline;
                return custom ? this.customDisciplineName : this.defaultDisciplineName;
            },
            defTarget() {
                let custom = this.usingCustomTarget;
                return custom ? this.customTarget.chosenName : this.predefTarget.name;
            },
            targetThumbnail() {
                let custom = this.usingCustomTarget;
                return custom ? this.customTarget.base64Data : this.predefTarget.base64Data;
            }
        },
        methods: {
            /**
             * Change the dialog's tab
             * 
             * @param {Number} tabIndex - The index of the target tab
             * @emits {Number} change_tab - The index of the target tab
             */
            change: function(tabIndex) { this.$emit('change-tab', tabIndex); }
        }
    }
</script>

<style scoped>
    .subtitle {
        font-family: 'Comfortaa';
        margin-top: -20px;
    }
    .details-header {
        font-weight: bold;
    }
    .change-btn {
        margin-left: 10px;
        font-size: 13px;
    }
    .target-thumbnail {
        margin: 5px;
        outline-width: 1px;
        outline-style: dashed;
        outline-color: #5e7075;
    }
    .theme-color-preview {
        border-width: 1px;
        border-color: #00000055;
        border-style: solid;
        border-radius: 15%;
        margin-top: -3px;
        margin-left: 5px;
    }
</style>