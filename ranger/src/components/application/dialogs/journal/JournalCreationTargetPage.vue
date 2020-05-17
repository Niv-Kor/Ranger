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
            <fa-icon
                class='nav-arrow left'
                icon='angle-left'
                :color='colors.primary'
                size='3x'
                :disabled='selectedTargetIndex == 0'
                @click='decrementTarget'
            />
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
                        <v-col v-if='!selectedTarget.new'>
                            <v-img
                                v-if='selectedTarget && selectedTarget.base64Data'
                                class='thumbnail'
                                :src='selectedTarget.base64Data'
                                max-width=120
                                max-height=120
                            />
                        </v-col>
                        <v-col v-else :key='croppedImageRefresher'>
                            <cropper
                                v-if='selectedTarget.base64Data'
                                class='thumbnail new'
                                :src='selectedTarget.base64Data'
                                :stencilProps="{ aspectRatio: 1 }"
                                @change='onCustomTargetChange'
                                @ready='$emit("loading", false)'
                            />
                            <div
                                v-else
                                class='how-upload-info'
                                align='center'
                            >
                                <span style='color: #00000070;'>Tap the button below to upload an image</span>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <fa-icon
                class='nav-arrow right'
                icon='angle-right'
                :color='colors.primary'
                size='3x'
                :disabled='selectedTargetIndex >= targets.length - 1'
                @click='incrementTarget'
            />
        </v-row>
        <v-container :style="{ width: 200 + 'px' }">
            <v-row>
                <v-text-field
                    v-if='selectedTarget && !selectedTarget.new'
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
                        v-model='newTargetName'
                        height=10
                        dense
                        rounded
                        outlined
                        counter=20
                        clearable
                        :disabled='!selectedTarget.base64Data'
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
                            :color='selectedTarget.base64Data ? colors.neutral : colors.primary'
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
    import Moment from 'moment';
    
    export default {
        components: {
            Cropper
        },
        data() {
            return {
                selectedTargetIndex: 0,
                newTargetName: '',
                croppedImageRefresher: false
            }
        },
        created() {
            //store first target
            if (!this.storedTarget.base64Data) {
                this.selectedTargetIndex = 0;
                this.$store.commit('setNewJournalTargetName', this.selectedTarget.name);
                this.$store.commit('setNewJournalTargetData', this.selectedTarget.base64Data);
                this.$store.commit('setNewJournalTargetResetFlag', false);
            }
        },
        updated() {
            //reset target selection back to 0 if discipline changes
            if (this.targetResetFlag) {
                this.selectedTargetIndex = 0;
                let firstTarget = this.targets[this.selectedTargetIndex];
                this.$store.commit('setNewJournalTargetName', firstTarget.name);
                this.$store.commit('setNewJournalTargetData', firstTarget.base64Data);
                this.$store.commit('setNewJournalTargetResetFlag', false);
                this.$store.commit('setNewJournalUploadedTargetData', '');
                this.$store.commit('setNewJournalUploadedTargetName', '');
                
                //remove irrelevant thumbnails
                this.targets.find(x => x.new).base64Data = null;
            }

            //determine the use of a custom target
            let useNew = this.selectedTarget.new;
            let useCustom = this.selectedTarget.custom;
            this.$store.commit('setUseNewJournalNewCustomTarget', useNew);
            this.$store.commit('setUseNewJournalUploadedCustomTarget', useCustom);
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                allTargets: 'getAllTargets',
                storedDiscipline: 'getNewJournalDiscipline',
                storedTarget: 'getNewJournalTarget',
                uploadedTarget: 'getNewJournalUploadedTarget',
                uploadedTargetFileType: 'getCustomTargetFileType',
                targetResetFlag: 'getNewJournalTargetResetFlag'
            }),
            selectedTarget() {
                return this.targets[this.selectedTargetIndex];
            },
            targets() {
                let list = this.allTargets.filter(x => {
                    let active = x.active;
                    let discipMatch = !x.discipline || x.discipline === this.storedDiscipline;
                    return active && discipMatch;
                });
                
                //mark all as non-customable target
                for (let target of list) {
                    target.custom = target.user !== 'default';
                    target.new = false;
                }

                //sort personal targets first
                list.sort((el1, el2) => {
                    if (!el1.discipline && el2.discipline) return -1;
                    else if (el1.discipline === el2.discipline) {
                        //both personal targets
                        if (!el1.discipline) {
                            let creationDate1 = Moment(el1.creationDate, 'YYYY-MM-DD HH:mm:ss');
                            let creationDate2 = Moment(el2.creationDate, 'YYYY-MM-DD HH:mm:ss');
                            return creationDate1.isAfter(creationDate2) ? -1 : 1;
                        }
                        //both common targets
                        else return 0;
                    }
                    else return 1;
                });

                //add the customable target
                list.push({
                    name: 'Enter target name',
                    base64Data: '',
                    custom: true,
                    new: true
                });
                
                return list;
            }
        },
        watch: {
            selectedTargetIndex(value) {
                let target = this.targets[value];
                this.$store.commit('setNewJournalTargetName', target.name);
                this.$store.commit('setNewJournalTargetData', target.base64Data);
            },
            newTargetName(value) {
                this.$store.commit('setNewJournalUploadedTargetName', value);
            }
        },
        methods: {
            /**
             * Move to the next target in line.
             */
            incrementTarget: function() {
                if (this.selectedTargetIndex < this.targets.length - 1)
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
                    if (imageData === this.selectedTarget.base64Data) {
                        this.$emit('loading', false) //finish loading
                        return;
                    }

                    this.$store.commit('setNewJournalUploadedTargetData', imageData);
                    this.selectedTarget.base64Data = imageData;
                    this.croppedImageRefresher = !this.croppedImageRefresher;
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
                this.$emit('loading', false) //finish loading
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
    .nav-arrow.left {
        margin-right: -10px;
    }
    .nav-arrow.right {
        margin-left: -10px;
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
    .thumbnail.new {
        max-width: 120px;
        max-height: 120px;
        background: #dddddd;
        margin: auto;
    }
    .how-upload-info {
        font-size: 14px;
    }
</style>