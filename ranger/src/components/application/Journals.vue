<template>
        <v-container
            class='container'
            fluid
        >
            <h1>Shooting Journals</h1>
            <p
                v-if='!list.length'
                class='no-surveys-message'
            >
                You don't own any journals yet.<br>
                Use the '+' button below<br>
                to get started.
            </p>
        <v-row v-else no-gutters>
            <v-col>
                <v-card
                    class="outer-card overflow-y-auto"
                    :height='windowDim.height - 320'
                    :width='tabSize.width'
                    :style="{ borderColor: colors.primary + '50' }"
                    elevation=0
                >
                    <v-list
                        v-if='sortFlag'
                        tile
                        nav
                        flat
                        dense
                        avatar
                        shaped
                    >
                        <sortable
                            v-for='(item, index) in list'
                            v-model='dragData'
                            :key="item.discipline + ', ' + item.name"
                            :index='index'
                            drag-direction='vertical'
                            replace-direction='vertical'
                            @sortend='sortend($event, list)'
                        >
                            <v-list-item
                                class='journal-item elevation-3'
                                dense
                                :selectable=false
                                :style='createItemStyle(item)'
                            >
                                <v-list-item-avatar
                                    class='card-left'
                                    size=70
                                    :style='createAvatarStyle(item)'
                                >
                                    <v-img :src='getDisciplineObj(item.formalDiscipline).avatar' />
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-card-title class='journal-discipline'>
                                        {{ item.discipline }}
                                    </v-card-title>
                                    <br>
                                    <v-card-text class='journal-name'>
                                        {{ item.name }}
                                    </v-card-text>
                                </v-list-item-content>
                            </v-list-item>
                        </sortable>
                    </v-list>
                    <v-list
                        v-else
                        tile
                        nav
                        flat
                        dense
                        avatar
                        shaped
                    >
                        <v-list-item
                            v-for='item in list'
                            :key="item.discipline + ', ' + item.name"
                            class='journal-item elevation-3'
                            dense
                            :selectable=false
                            :style='createItemStyle(item)'
                        >
                            <v-list-item-avatar
                                class='card-left'
                                size=70
                                :style='createAvatarStyle(item)'
                            >
                                <v-img :src='getDisciplineObj(item.formalDiscipline).avatar' />
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-card-title class='journal-discipline'>
                                    {{ item.discipline }}
                                </v-card-title>
                                <br>
                                <v-card-text class='journal-name'>
                                    {{ item.name }}
                                </v-card-text>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
                <v-switch
                    class='sort-switch'
                    v-model='sortFlag'
                    inset
                    :label='"Sort mode " + ((sortFlag) ? "on" : "off")'
                    :color='colors.secondary'
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';

    const DISCIPLINE_ICONS = require.context('../../assets/disciplines/', false, /\.png|\.jpg$/);

    export default {
        data() {
            return {
                dragData: {},
                sortFlag: false,
                windowDim: {
                    width: 0,
                    height: 0
                },
                tabSize: {
                    width: 350,
                    height: 110
                },
                lista: [
                    {
                        name: 'Ficell\'s Journal',
                        discipline: 'Archery',
                        formalDiscipline: 'Archery',
                        color: '#0000ff',
                        order: 0
                    },
                    {
                        name: 'Ficell\'s Journal2',
                        discipline: 'Firearm',
                        formalDiscipline: 'Firearm',
                        color: '#005aff',
                        order: 1
                    },
                    {
                        name: 'Ficell\'s Journal4',
                        discipline: 'Archery',
                        formalDiscipline: 'Archery',
                        color: '#18c900',
                        order: 2
                    },
                    {
                        name: 'Ficell\'s Journal7',
                        discipline: 'Firearm',
                        formalDiscipline: 'Firearm',
                        color: '#fafafa',
                        order: 3
                    },
                    {
                        name: 'Ficell\'s Journal9',
                        discipline: 'Other',
                        formalDiscipline: 'Other',
                        color: '#ff0030',
                        order: 4
                    },
                ],
                disciplines: [
                    {
                        name: 'Archery',
                        avatar: DISCIPLINE_ICONS('./archery_avatar.png'),
                        background: DISCIPLINE_ICONS('./archery_card.png')
                    },
                    {
                        name: 'Firearm',
                        avatar: DISCIPLINE_ICONS('./firearm_avatar.png'),
                        background: DISCIPLINE_ICONS('./firearm_card.png')
                    },
                    {
                        name: 'Other',
                        avatar: DISCIPLINE_ICONS('./other_avatar.png'),
                        background: DISCIPLINE_ICONS('./other_card.png')
                    }
                ],
                currentOrder: []
            }
        },
        computed: {
            ...mapGetters({
                userData: 'getUserData',
                colors: 'getColors',
                colorPalette: 'getNewJournalColorPalette',
                list: 'getAllJournals'
            })
        },
        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
            this.saveOrder();
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize);
        },
        watch: {
            list() {
                //update order in database
                let changed = false;
                for (let i in this.list) {
                    let obj = this.list[i];

                    //found a journal out of order
                    if (obj.order !== this.currentOrder[i]) {
                        this.$store.dispatch('updateJournalOrder', {
                            user: this.userData.email,
                            discipline: obj.discipline,
                            name: obj.name,
                            newOrder: obj.order
                        });
                        changed = true;
                    }
                }

                if (changed) this.saveOrder();
            }
        },
        methods: {
            getDisciplineObj: function(discipline) {
                for (let discip of this.disciplines)
                    if (discip.name === discipline) return discip;
            },
            createItemStyle: function(item) {
                let color = (item.color === this.colorPalette[0]) ? '#000000' : item.color;
                let discip = this.getDisciplineObj(item.formalDiscipline);
                let background = 'url(' + discip.background + ')';
                let gradient = 'url(' + DISCIPLINE_ICONS('./gradient_card.png') + ')';
                let gradientImage = 'linear-gradient(to right, #ffffff30, ' + color + '30)';
                let data = [
                    {
                        image: gradientImage,
                        size: this.tabSize.width + 'px ' + (this.tabSize.height / 2) + 'px',
                        pos: '0 100%'
                    },
                    {
                        image: gradient,
                        size: 'auto',
                        pos: 'left top'
                    },
                    {
                        image: background,
                        size: 'auto',
                        pos: 'left top'
                    }
                ]

                let images = '';
                let sizes = '';
                let positions = '';

                for (let i in data) {
                    let bg = data[i];
                    let comma = (i < data.length - 1) ? ',' : '';

                    images += bg.image + comma;
                    sizes += bg.size + comma;
                    positions += bg.pos + comma;
                }

                return {
                    backgroundImage: images,
                    backgroundSize: sizes,
                    backgroundPosition: positions
                }
            },
            createAvatarStyle(item) {
                let alpha = 60;
                return { backgroundColor: item.color + alpha }
            },
            sortend (ev, list) {
                const { oldIndex, newIndex } = ev
                this.rearrange(list, oldIndex, newIndex)
            },
            rearrange (array, oldIndex, newIndex) {
                if (oldIndex > newIndex) {
                    array.splice(newIndex, 0, array[oldIndex])
                    array.splice(oldIndex + 1, 1)
                }
                else {
                    array.splice(newIndex + 1, 0, array[oldIndex])
                    array.splice(oldIndex, 1)
                }
            },
            handleResize: function() {
                this.windowDim.width = window.innerWidth;
                this.windowDim.height = window.innerHeight;
            },
            /**
             * Save the current order of the journals.
             */
            saveOrder: function() {
                this.currentOrder = [];

                for (let obj of this.list)
                    this.currentOrder.push(obj.order);
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
    .journal-item {
        margin: 20px 0 20px 0;
    }
    .outer-card {
        margin-top: 15px;
        border-width: 1px;
        border-style: dashed none;
    }
    .card-left {
        background-color: #ffffff60;
        border-width: 1px;
        border-color: #00000060;
        border-style: solid;
    }
    .journal-discipline {
        color: #ffffff;
        font-size: 13px;
    }
    .journal-name {
        color: #000000;
        font-size: 16px;
        font-weight: bold;
    }
    .sort-switch {
    }
</style>