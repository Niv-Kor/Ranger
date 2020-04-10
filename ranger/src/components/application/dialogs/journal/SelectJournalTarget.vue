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
                :disabled='selectedTarget == 0'
                @click='decrementTarget'
            >
                mdi-menu-left
            </v-icon>
            <v-card
                class='card'
                width=130
                height=130
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
                            <v-img
                                v-if='getDisciplineProperty()[selectedTarget] && getDisciplineProperty()[selectedTarget].src.icon'
                                class='target-icon'
                                :src='getDisciplineProperty()[selectedTarget].src.icon'
                                max-width=90
                                max-height=90
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-icon
                class='nav-arrow'
                size=64
                :color='colors.primary'
                :disabled='selectedTarget >= getDisciplineProperty().length - 1'
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
                    v-if='getDisciplineProperty()[selectedTarget] && !getDisciplineProperty()[selectedTarget].custom'
                    class='label-target colored'
                    min-width=100
                    height=10
                    dense
                    rounded
                    outlined
                    disabled
                    :placeholder='getDisciplineProperty()[selectedTarget].name'
                    :background-color='colors.neutral'
                    :color='colors.neutral'
                />
                <v-file-input
                    v-else
                    v-model='customTargetThumbnail'
                    class='label-target upload'
                    accept='image/png, image/jpeg'
                    :placeholder='getUploadPlaceholder()'
                    @change='onTargetUploaded'
                />
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    
    const ARCHERY_CONTEXT = require.context('../../../../assets/targets/small/archery', false, /\.png$/);
    const FIREARM_CONTEXT = require.context('../../../../assets/targets/small/firearm', false, /\.png$/);

    export default {
        data() {
            return {
                selectedTarget: 0,
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
                this.selectedTarget = 0;
                let firstTarget = this.getDisciplineProperty()[this.selectedTarget].src.name;
                this.$store.commit('setNewJournalTarget', firstTarget);
                this.$store.commit('setNewJournalTargetResetFlag', false);
            }
        },
        updated() {
            let discipProperty = this.getDisciplineProperty();

            //reset target selection back to 0 if discipline changes
            if (this.targetResetFlag) {
                this.customTargetThumbnail = null;
                this.selectedTarget = 0;
                let firstTarget = discipProperty[this.selectedTarget].src.name;
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
            let useCustom = discipProperty[this.selectedTarget].custom;
            this.$store.commit('setUseUploadedCustomTargetFlag', useCustom);
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storedDiscipline: 'getNewJournalDiscipline',
                storedTarget: 'getNewJournalTarget',
                uploadedTarget: 'getNewJournalUploadedTarget',
                targetResetFlag: 'getNewJournalTargetResetFlag'
            }),
        },
        watch: {
            selectedTarget(value) {
                let property = this.getDisciplineProperty();

                if (property) {
                    let srcName = property[value].src.name;
                    this.$store.commit('setNewJournalTarget', srcName);
                }
            }
        },
        methods: {
            incrementTarget: function() {
                if (this.selectedTarget < this.getDisciplineProperty().length - 1)
                    this.selectedTarget++;
            },
            decrementTarget: function() {
                if (this.selectedTarget > 0)
                    this.selectedTarget--;
            },
            getDisciplineProperty: function() {
                return this.targets['' + this.storedDiscipline];
            },
            getLabelWidthStyle: function() {
                let property = this.getDisciplineProperty()[this.selectedTarget];

                if (property) {
                    let width = property.labelWidth;
                    return { 'width': width }
                }
                else return null;
            },
            getUploadPlaceholder: function() {
                let uploadedName = this.uploadedTarget.chosenName;
                return uploadedName ? uploadedName : 'Upload a custom image';
            },
            onTargetUploaded: async function() {
				let file = await event.target.files[0];
                let reader = new FileReader();

                //upload image preview thumbnail
                let url = URL.createObjectURL(file);
                this.getDisciplineProperty()[this.selectedTarget].src.icon = url;
                this.getDisciplineProperty()[this.selectedTarget].src.name = file.name;

                reader.onload = (ev) => {
                    let imageData = ev.target.result;
                    this.$store.commit('setNewJournalUploadedTargetURL', url);
                    this.$store.commit('setNewJournalUploadedTargetData', imageData);
                    this.$store.commit('setNewJournalUploadedTargetName', file.name);
                };

                await reader.readAsDataURL(file);
            }
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
    .target-icon {
        margin: auto;
    }
</style>