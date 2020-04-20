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
                                v-if='selectedTarget && selectedTarget.src'
                                class='thumbnail'
                                :src='selectedTarget.src'
                                max-width=120
                                max-height=120
                            />
                        </v-col>
                        <v-col v-else>
                            <cropper
                                v-if='selectedTarget.src'
                                class='thumbnail custom'
                                :src='selectedTarget.src'
                                :stencilProps="{ aspectRatio: 1 }"
                                @change='onCustomTargetChange'
                                @ready='$emit("loading", false)'
                            />
                            <div
                                v-else
                                class='how-upload-info'
                                align='center'
                            >
                                Tap the button below to upload an image
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-icon
                class='nav-arrow'
                size=64
                :color='colors.primary'
                :disabled='selectedTargetIndex >= disciplineProperty.length - 1'
                @click='incrementTarget'
            >
                mdi-menu-right
            </v-icon>
        </v-row>
        <v-container :style='labelStyle'>
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
                <div v-else class='upload container'>
                    <v-text-field
                        v-model='customTargetName'
                        height=10
                        dense
                        rounded
                        outlined
                        counter=64
                        clearable
                        :disabled='!selectedTarget.src'
                        :placeholder='selectedTarget.name'
                        :color='colors.neutral'
                     />
                    <file-selector
                        accept-extensions='.jpg,.jpeg,.png'
                        :max-file-size='5 * 1024 * 1024'
                        @validated='onCustomTargetUpload'
                    >
                        <v-btn
                            class='upload btn'
                            fab
                            medium
                            elevation=3
                            :color='selectedTarget.src ? colors.neutral : colors.primary'
                        >
                            <v-icon color='white'>mdi-paperclip</v-icon>
                        </v-btn>
                    </file-selector>
                </div>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { Cropper } from 'vue-advanced-cropper';
    
    const ARCHERY_CONTEXT = require.context('../../../../assets/targets/small/archery', false, /\.png$/);
    const FIREARM_CONTEXT = require.context('../../../../assets/targets/small/firearm', false, /\.png$/);

    export default {
        components: {
            Cropper
        },
        data() {
            return {
                selectedTargetIndex: 0,
                customTargetName: '',
                customTargetThumbnail: null,
                targets: {
                    'Archery': [
                        {
                            name: 'FITA',
                            labelWidth: '200px',
                            src: ARCHERY_CONTEXT('./FITA.png'),
                            custom: false
                        },
                        {
                            name: 'FITA Field',
                            labelWidth: '200px',
                            src: ARCHERY_CONTEXT('./FITA Field.png'),
                            custom: false
                        },
                        {
                            name: 'Enter target name',
                            labelWidth: '220px',
                            src: null,
                            custom: true
                        }
                    ],
                    'Firearm': [
                        {
                            name: 'ISSF Air Pistol',
                            labelWidth: '200px',
                            src: FIREARM_CONTEXT('./ISSF Air Pistol.png'),
                            custom: false
                        },
                        {
                            name: 'ISSF Rapid Fire Pistol',
                            labelWidth: '240px',
                            src: FIREARM_CONTEXT('./ISSF Rapid Fire Pistol.png'),
                            custom: false
                        },
                        {
                            name: 'ISSF Air Rifle',
                            labelWidth: '200px',
                            src: FIREARM_CONTEXT('./ISSF Air Rifle.png'),
                            custom: false
                        },
                        {
                            name: 'Enter target name',
                            labelWidth: '220px',
                            src: null,
                            custom: true
                        }
                    ],
                    'Other': [
                        {
                            name: 'Enter target name',
                            labelWidth: '220px',
                            src: null,
                            custom: true
                        }
                    ],
                }
            }
        },
        created() {
            //store first target
            if (!this.storedTarget.base64Data) {
                this.selectedTargetIndex = 0;
                this.$store.commit('setNewJournalTargetName', this.selectedTarget.name);
                this.$store.commit('setNewJournalTargetData', this.selectedTarget.src);
                this.$store.commit('setNewJournalTargetResetFlag', false);
            }
        },
        updated() {
            let discipProperty = this.disciplineProperty;

            //reset target selection back to 0 if discipline changes
            if (this.targetResetFlag) {
                this.customTargetThumbnail = null;
                this.selectedTargetIndex = 0;
                let firstTarget = discipProperty[this.selectedTargetIndex];
                this.$store.commit('setNewJournalTargetName', firstTarget.name);
                this.$store.commit('setNewJournalTargetData', firstTarget.src);
                this.$store.commit('setNewJournalTargetResetFlag', false);
                this.$store.commit('setNewJournalUploadedTargetData', '');
                this.$store.commit('setNewJournalUploadedTargetName', '');
                
                //remove irrelevant thumbnails
                for (let [, discipVal] of Object.entries(this.targets))
                    for (let [, targetVal] of Object.entries(discipVal))
                        if (targetVal.custom) targetVal.src = null;
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
                return this.disciplineProperty[this.selectedTargetIndex];
            },
            fileUploadPlaceholder() {
                let defaultMsg = 'Upload a custom image';
                let uploadedName = this.uploadedTarget.chosenName;

                if (uploadedName) {
                    let fileType = uploadedName.split('.')[1];
                    uploadedName = uploadedName.substr(0, 15) + '...' + fileType;
                    return uploadedName;
                }
                else return defaultMsg;
            },
            disciplineProperty() {
                return this.targets['' + this.storedDiscipline];
            },
            labelStyle: function() {
                let property = this.selectedTarget;

                if (property) {
                    let width = property.labelWidth;
                    return { width }
                }
                else return {};
            },
        },
        watch: {
            selectedTargetIndex(value) {
                let property = this.disciplineProperty;

                if (property) {
                    let target = property[value];
                    this.$store.commit('setNewJournalTargetName', target.name);
                    this.$store.commit('setNewJournalTargetData', target.src);
                }
            },
            customTargetName(value) {
                this.$store.commit('setNewJournalUploadedTargetName', value);
            }
        },
        methods: {
            /**
             * Move to the next target in line.
             */
            incrementTarget: function() {
                if (this.selectedTargetIndex < this.disciplineProperty.length - 1)
                    this.selectedTargetIndex++;
            },
            /**
             * Return to the previous viewed target.
             */
            decrementTarget: function() {
                if (this.selectedTargetIndex > 0)
                    this.selectedTargetIndex--;
            },
            /**
             * Activate when a target image is uploaded.
             * 
             * @emits {Boolean] loading
             */
            onCustomTargetUpload: async function() {
                this.$emit('loading', true) //start loading
                let file = await event.target.files[0];
                let reader = new FileReader();

                //extract base64 data
                reader.onload = (ev) => {
                    let imageData = ev.target.result;

                    //check if this new image is the one that's already loaded
                    if (imageData === this.selectedTarget.src) {
                        this.$emit('loading', false) //finish loading
                        return;
                    }

                    this.selectedTarget.src = imageData;
                    this.$store.commit('setNewJournalUploadedTargetData', imageData);
                };

                await reader.readAsDataURL(file);
            },
            /**
             * Activate when the target image is changed.
             * 
             * @emits {Boolean] loading
             */
            onCustomTargetChange: async function(event) {
                let canvas = event.canvas;
                let base64 = canvas.toDataURL('image/' + this.uploadedTargetFileType);
                this.$store.commit('setNewJournalUploadedTargetData', base64);
                this.$emit('loading', false) //start loading
            }
        }
    }
</script>

<style scoped>
    * {
        font-family: 'Comfortaa';
    }
    .subtitle.small {
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
    .upload.container {
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
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
    .how-upload-info {
        font-size: 14px;
    }
</style>