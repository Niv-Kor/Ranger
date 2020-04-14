<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Select your default target<br>
            </p>
            <p
                class='subtitle small'
                align=center
            >
                (This can always be changed later)
            </p>
        </v-container>
        <v-row no-gutters>
            <v-icon
                class='nav-arrow'
                size=64
                :color='colors.primary'
                :disabled='selectedTargetIndex == 0'
                @click='decrementTarget'
            >
                mdi-menu-left
            </v-icon>
            <v-card
                class='card'
                id='card'
                width=160
                height=160
                outlined
                shaped
                color='blue-grey lighten-5'
            >
                <v-container
                    fill-height
                    fluid
                >
                    <v-row
                        align='center'
                        justify='center'
                    >
                        <v-col v-if='!selectedTarget.custom'>
                            <v-img
                                v-if='selectedTarget && selectedTarget.src.icon'
                                class='thumbnail'
                                :src='selectedTarget.src.icon'
                                max-width=120
                                max-height=120
                            />
                        </v-col>
                        <v-col v-else>
                            <cropper
                                v-if='selectedTarget.src.icon'
                                class='thumbnail custom'
                                :src='selectedTarget.src.icon'
                                :stencilProps="{ aspectRatio: 1 }"
                                @change='onCustomTargetChange'
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-icon
                class='nav-arrow'
                size=64
                :color='colors.primary'
                :disabled='selectedTargetIndex >= getDisciplineProperty().length - 1'
                @click='incrementTarget'
            >
                mdi-menu-right
            </v-icon>
        </v-row>
        <v-container
            class='label-container'
            :style='getLabelWidthStyle()'
        >
            <v-row>
                <v-text-field
                    v-if='selectedTarget && !selectedTarget.custom'
                    class='label-target colored'
                    min-width=100
                    height=10
                    dense
                    rounded
                    outlined
                    disabled
                    :placeholder='selectedTarget.name'
                    :background-color='colors.neutral'
                    :color='colors.neutral'
                />
                <v-file-input
                    v-else
                    class='label-target upload'
                    accept='image/png, image/jpeg'
                    max-width=120
                    max-height=120
                    :placeholder='fileUploadPlaceholder'
                    @change='onCustomTargetUpload'
                />
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { Cropper } from 'vue-advanced-cropper'
    
    const ARCHERY_CONTEXT = require.context('../../../../assets/targets/small/archery', false, /\.png$/);
    const FIREARM_CONTEXT = require.context('../../../../assets/targets/small/firearm', false, /\.png$/);

    export default {
        components: {
            Cropper,
        },
        data() {
            return {
                selectedTargetIndex: 0,
                customTargetThumbnail: null,
                targets: {}
            }
        },
        created() {
            //init targets
            this.targets = {
                'Archery': [
                    {
                        name: 'FITA',
                        labelWidth: '200px',
                        src: { name: 'fita.png', icon: ARCHERY_CONTEXT('./fita.png') },
                        custom: false
                    },
                    {
                        name: 'FITA Field',
                        labelWidth: '200px',
                        src: { name: 'fita_field.png', icon: ARCHERY_CONTEXT('./fita_field.png') },
                        custom: false
                    },
                    {
                        name: 'Other',
                        labelWidth: '220px',
                        src: { name: null, icon: null },
                        custom: true
                    }
                ],
                'Firearm': [
                    {
                        name: 'ISSF Air Pistol',
                        labelWidth: '200px',
                        src: { name: 'issf_air_pistol.png', icon: FIREARM_CONTEXT('./issf_air_pistol.png') },
                        custom: false
                    },
                    {
                        name: 'ISSF Rapid Fire Pistol',
                        labelWidth: '240px',
                        src: { name: 'issf_rapid_fire_pistol.png', icon: FIREARM_CONTEXT('./issf_rapid_fire_pistol.png') },
                        custom: false
                    },
                    {
                        name: 'ISSF Air Rifle',
                        labelWidth: '200px',
                        src: { name: 'issf_air_rifle.png', icon: FIREARM_CONTEXT('./issf_air_rifle.png') },
                        custom: false
                    },
                    {
                        name: 'Man Silhouette',
                        labelWidth: '200px',
                        src: { name: 'man_silhouette.png', icon: FIREARM_CONTEXT('./man_silhouette.png') },
                        custom: false
                    },
                    {
                        name: 'Other',
                        labelWidth: '220px',
                        src: { name: null, icon: null },
                        custom: true
                    }
                ],
                'Other': [
                    {
                        name: 'Other',
                        labelWidth: '220px',
                        src: { name: null, icon: null },
                        custom: true
                    }
                ],
            };

            //store first target
            if (!this.storedTarget) {
                this.selectedTargetIndex = 0;
                let firstTarget = this.selectedTarget.src.name;
                this.$store.commit('setNewJournalTarget', firstTarget);
                this.$store.commit('setNewJournalTargetResetFlag', false);
            }
        },
        updated() {
            let discipProperty = this.getDisciplineProperty();

            //reset target selection back to 0 if discipline changes
            if (this.targetResetFlag) {
                this.customTargetThumbnail = null;
                this.selectedTargetIndex = 0;
                let firstTarget = discipProperty[this.selectedTargetIndex].src.name;
                this.$store.commit('setNewJournalTarget', firstTarget);
                this.$store.commit('setNewJournalTargetResetFlag', false);
                this.$store.commit('setNewJournalUploadedTargetURL', '');
                this.$store.commit('setNewJournalUploadedTargetData', '');
                this.$store.commit('setNewJournalUploadedTargetName', '');
                
                //remove irrelevant thumbnails
                for (let [, discipVal] of Object.entries(this.targets))
                    for (let [, targetVal] of Object.entries(discipVal))
                        if (targetVal.custom) targetVal.src.icon = null;
            }

            //determine the use of a custom target
            let useCustom = discipProperty[this.selectedTargetIndex].custom;
            this.$store.commit('setUseUploadedCustomTarget', useCustom);
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storedDiscipline: 'getNewJournalDiscipline',
                storedTarget: 'getNewJournalTarget',
                uploadedTarget: 'getNewJournalUploadedTarget',
                uploadedTargetFileType: 'getCustomTargetFileType',
                targetResetFlag: 'getNewJournalTargetResetFlag'
            }),
            selectedTarget() {
                return this.getDisciplineProperty()[this.selectedTargetIndex];
            },
            fileUploadPlaceholder() {
                let defaultMsg = 'Upload a custom image';
                let uploadedName = this.uploadedTarget.chosenName;
                let fileType = uploadedName.split('.')[1];
                uploadedName = uploadedName.substr(0, 15) + '...' + fileType;
                return uploadedName ? uploadedName : defaultMsg;
            },
        },
        watch: {
            selectedTargetIndex(value) {
                let property = this.getDisciplineProperty();

                if (property) {
                    let srcName = property[value].src.name;
                    this.$store.commit('setNewJournalTarget', srcName);
                }
            }
        },
        methods: {
            incrementTarget: function() {
                if (this.selectedTargetIndex < this.getDisciplineProperty().length - 1)
                    this.selectedTargetIndex++;
            },
            decrementTarget: function() {
                if (this.selectedTargetIndex > 0)
                    this.selectedTargetIndex--;
            },
            getDisciplineProperty: function() {
                return this.targets['' + this.storedDiscipline];
            },
            getLabelWidthStyle: function() {
                let property = this.selectedTarget;

                if (property) {
                    let width = property.labelWidth;
                    return { 'width': width }
                }
                else return null;
            },
            onCustomTargetUpload: async function() {
                let file = await event.target.files[0];
                let reader = new FileReader();

                //extract base64 data
                reader.onload = (ev) => {
                    let imageData = ev.target.result;
                    this.saveCustomImage(imageData, file.name);
                };

                await reader.readAsDataURL(file);
            },
            onCustomTargetChange: async function(event) {
                let canvas = event.canvas;
                let base64 = canvas.toDataURL('image/' + this.uploadedTargetFileType);
                this.$store.commit('setNewJournalUploadedTargetData', base64);
            },
            saveCustomImage: function(base64, fileName) {
                this.selectedTarget.src.icon = base64;
                this.selectedTarget.src.name = fileName;
                this.$store.commit('setNewJournalUploadedTargetData', base64);
                this.$store.commit('setNewJournalUploadedTargetName', fileName);
            },
        }
    }
</script>

<style>
    .subtitle {
        font-family: 'comfortaa';
    }
    .small {
        margin-top: -10px;
        font-size: 13px;
    }
    .nav-arrow {
        margin: auto;
    }
    .label-target .colored input {
        text-align: center
    }
    .label-target .colored input::placeholder {
        color: #ffffff !important;
        opacity: 1;
    }
    .upload {
        margin-top: -10px;
        font-size: 14px;
    }
    .thumbnail {
        margin: auto;
    }
    .thumbnail.custom {
        max-width: 120px;
        max-height: 120px;
        background: #dddddd;
        margin: auto;
    }
</style>