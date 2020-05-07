<template>
    <div>
        <v-container>
            <p
                class='subtitle'
                align=center
            >
                Upload an image from<br>your device
            </p>
        </v-container>
        <v-row no-gutters>
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
                        <v-col>
                            <cropper
                                v-if='targetSrc'
                                class='thumbnail custom'
                                :src='targetSrc'
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
        </v-row>
        <v-container :style="{ width: 200 + 'px' }">
            <v-row>
                <div class='upload container'>
                    <v-text-field
                        v-model='targetName'
                        height=10
                        dense
                        rounded
                        outlined
                        counter=20
                        clearable
                        placeholder='Enter target name'
                        :disabled='!targetSrc'
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
                            :color='targetSrc ? colors.neutral : colors.primary'
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

    export default {
        components: {
            Cropper
        },
        data() {
            return {
                targetName: '',
                targetSrc: ''
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            }),
        },
        watch: {
            targetName(value) {
                this.$store.commit('setNewTargetName', value);
            }
        },
        methods: {
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
                    if (imageData === this.targetSrc) {
                        this.$emit('loading', false) //finish loading
                        return;
                    }

                    this.targetSrc = imageData;
                    this.$store.commit('setNewTargetData', imageData);
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
                this.$store.commit('setNewTargetData', base64);
                this.$emit('loading', false) //finish loading
            }
        }
    }
</script>

<style scoped>
    * {
        font-family: 'Comfortaa';
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