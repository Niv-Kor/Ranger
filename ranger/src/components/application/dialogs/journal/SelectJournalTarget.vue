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
            <input
                type='file'
                accept='image/png, image/jpeg'
                @change='fileUploaded'
            />
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
            <v-text-field
                class='label-target'
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
                        src: { name: 'fita.png', icon: ARCHERY_CONTEXT('./fita.png') }
                    },
                    {
                        name: 'FITA Field',
                        labelWidth: '200px',
                        src: { name: 'fita_field.png', icon: ARCHERY_CONTEXT('./fita_field.png') }
                    }
                ],
                'Firearm': [
                    {
                        name: 'ISSF Air Pistol',
                        labelWidth: '200px',
                        src: { name: 'issf_air_pistol.png', icon: FIREARM_CONTEXT('./issf_air_pistol.png') }
                    },
                    {
                        name: 'ISSF Rapid Fire Pistol',
                        labelWidth: '240px',
                        src: { name: 'issf_rapid_fire_pistol.png', icon: FIREARM_CONTEXT('./issf_rapid_fire_pistol.png') }
                    },
                    {
                        name: 'ISSF Air Rifle',
                        labelWidth: '200px',
                        src: { name: 'issf_air_rifle.png', icon: FIREARM_CONTEXT('./issf_air_rifle.png') }
                    },
                    {
                        name: 'Man Silhouette',
                        labelWidth: '200px',
                        src: { name: 'man_silhouette.png', icon: FIREARM_CONTEXT('./man_silhouette.png') }
                    }
                ]
            };

            //target is already stored
            if (this.storedTarget) this.selectedTarget = this.getTargetIndex(this.storedTarget);
            //store first target
            else {
                let firstTarget = this.getDisciplineProperty()[0].src.name;
                this.$store.commit('setNewJournalTarget', firstTarget)
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                storedDiscipline: 'getNewJournalDiscipline',
                storedTarget: 'getNewJournalTarget',
                uploadedTarget: 'getNewJournalUploadedTarget'
            }),

        },
        watch: {
            selectedTarget(value) {
                let srcName = this.getDisciplineProperty()[value].src.name;
                this.$store.commit('setNewJournalTarget', srcName);
            },
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
            getTargetIndex: function(srcName) {
                let arr = this.getDisciplineProperty();

                for (let i in arr) {
                    let property = arr[i];
                    if (property.srcName === srcName) return i;
                }
            },
            getLabelWidthStyle: function() {
                let property = this.getDisciplineProperty()[this.selectedTarget];
                let width = property.labelWidth;
                return { 'width': width }
            },
            fileUploaded: async function() {
				let file = await event.target.files[0];
                let reader = new FileReader();
                let image = null;

                reader.onload = (ev) => {
                    image = ev.target.result;

                    //compose the image data
                    let uploadedTargetObj = {
                        base64Data: image,
                        chosenName: file.name
                    };

                    this.$store.commit('setNewJournalUploadedTarget', uploadedTargetObj);
                };

                await reader.readAsDataURL(file);
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
    .label-target input {
        text-align: center
    }
    .label-target input::placeholder {
        color: #ffffff !important;
        opacity: 1;
    }
    .target-icon {
        margin: auto;
    }
</style>