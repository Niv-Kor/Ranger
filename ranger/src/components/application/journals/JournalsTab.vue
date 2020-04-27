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
                            @sortend='onSort($event, list)'
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
                            v-for='(item, index) in list'
                            :key="item.discipline + ', ' + item.name"
                            :index='index'
                            class='journal-item elevation-3'
                            dense
                            :selectable=false
                            :style='createItemStyle(item)'
                            @click='goto(index)'
                        >
                            <v-list-item-avatar
                                class='card-left'
                                size=70
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
        <Loading :model='isListLoading' />
    </v-container>
</template>

<script>
    import { mapGetters } from 'vuex';
    import Loading from '../../widgets/Loading';

    const JOURNAL_ASSETS = require.context('../../../assets/disciplines/journal card/', false, /\.png|\.jpg$/);

    export default {
        components: {
            Loading
        },
        data() {
            return {
                dragData: {},
                sortFlag: false,
                windowDim: {
                    width: 0,
                    height: 0
                },
                disciplines: [
                    {
                        name: 'Archery',
                        avatar: JOURNAL_ASSETS('./archery_avatar.png'),
                        background: JOURNAL_ASSETS('./archery_card.png')
                    },
                    {
                        name: 'Firearm',
                        avatar: JOURNAL_ASSETS('./firearm_avatar.png'),
                        background: JOURNAL_ASSETS('./firearm_card.png')
                    },
                    {
                        name: 'Other',
                        avatar: JOURNAL_ASSETS('./other_avatar.png'),
                        background: JOURNAL_ASSETS('./other_card.png')
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
                list: 'getAllJournals',
                isListLoading: 'isJournalsListLoading'
            }),
            tabSize() {
                return {
                    width: this.windowDim.width * .9,
                    height: 110
                }
            }
        },
        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
            this.updateOrder();
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize);
        },
        methods: {
            /**
             * Push an address to the router.
             * 
             * @param {String} path - The address to push to the router
             */
            goto: function(journalIndex) {
                let journal = this.list[journalIndex];
                let id = `${journal.discipline}-${journal.name}`;
                let path = `/home/journal/${id}`;
                this.$router.push({ path: path }).catch(() => {});
                this.$store.commit('setSelectedJournalIndex', journalIndex);
            },
            /**
             * Get the appropriate discipline object based on the discipline's name.
             * 
             * @param {String} discipline - The name of the discipline
             * @returns {Object} {
             *                      {String} name - Discipline's name,
             *                      {URL} avatar - Discipline's avatar,
             *                      {URL} background - Discipline's background
             *                   }
             */
            getDisciplineObj: function(discipline) {
                for (let discip of this.disciplines)
                    if (discip.name === discipline) return discip;
            },
            /**
             * Get the appropriate style for a journal card.
             * 
             * @param {Object} item - {
             *                           {String} discipline - The name of the journal's discipline,
             *                           {String} formalDiscipline - Same as discipline, but if it's customized then formal is 'Other',
             *                           {String} name - The journal's name,
             *                           {Number} targetId - Journal's default target's ID,
             *                           {String} color - The journal's color theme,
             *                           {Number} order - The journal's sorting order
             *                        }
             * @returns {Object} {
             *                      {String} backgroundImage - CSS attribute for background image,
             *                      {String} backgroundSize - CSS attribute for background size,
             *                      {String} backgroundPosition - CSS attribute for background position
             *                   }
             */
            createItemStyle: function(item) {
                let color = (item.color === this.colorPalette[0]) ? '#000000' : item.color;
                let discip = this.getDisciplineObj(item.formalDiscipline);
                let background = 'url(' + discip.background + ')';
                let gradientBlack = 'linear-gradient(to left, ' + color + '40 ' + 5 + '%, #000000 ' + 80 + '%)';
                let colorLine = 'linear-gradient(to left, ' + color + '99 ' + 10 + '%, #000000ff ' + 90 + '%)';
                let rangerPattern = 'url(' + JOURNAL_ASSETS('./ranger_pattern.png') + ')';
                let data = [
                    {   //discipline photo
                        image: colorLine,
                        size: 'auto 4px',
                        pos: 'center 50%'
                    },
                    {   //burn the image at the top
                        image: gradientBlack,
                        size: this.tabSize.width + 'px ' + (this.tabSize.height / 2) + 'px',
                        pos: '0 0'
                    },
                    {   //discipline photo
                        image: background,
                        size: 'auto',
                        pos: 'center top'
                    },
                    {   //3-color ranger patter
                        image: rangerPattern,
                        size: 'auto auto',
                        pos: '0 100%'
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
                    backgroundPosition: positions,
                }
            },
            /**
             * Activate when the journals' list is sortened.
             * Save the new sort.
             */
            onSort(event, list) {
                const { oldIndex, newIndex } = event;
                this.rearrange(list, oldIndex, newIndex);
            },
            /**
             * Rearrange the journals' list, based on a signle item that changed its order.
             * 
             * @param {Number} oldIndex - The item's old index
             * @param {Number} newIndex - The item's new index
             */
            rearrange(list, oldIndex, newIndex) {
                if (oldIndex > newIndex) {
                    list.splice(newIndex, 0, list[oldIndex])
                    list.splice(oldIndex + 1, 1)
                }
                else {
                    list.splice(newIndex + 1, 0, list[oldIndex])
                    list.splice(oldIndex, 1)
                }

                this.updateOrder();
                this.sortFlag = false; //turn off
            },
            /**
             * Activate when the window's size is changing.
             * Save the new size.
             */
            handleResize: function() {
                this.windowDim.width = window.innerWidth;
                this.windowDim.height = window.innerHeight;
            },
            /**
             * Update the new order in the database,
             * ans save the current order for later.
             */
            updateOrder: function() {
                //update order in database
                let changed = false;
                for (let i in this.list) {
                    let obj = this.list[i];

                    //found a journal out of order
                    if (this.currentOrder[i] && obj.order !== this.currentOrder[i]) {
                        this.$store.dispatch('updateJournalOrder', {
                            user: this.userData.email,
                            discipline: obj.discipline,
                            name: obj.name,
                            newOrder: parseInt(i) + 1
                        });

                        changed = true;
                    }
                }
                
                //save current order
                if (changed || !this.currentOrder.length) {
                    this.currentOrder = [];

                    for (let obj of this.list)
                        this.currentOrder.push(obj.order);
                }
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
        background-color: #ffffff;
    }
    .outer-card {
        margin-top: 15px;
        border-width: 1px;
        border-style: dashed none;
    }
    .card-left {
        border-width: 5px;
        border-color: #ffffff60;
        border-style: double;
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
</style>