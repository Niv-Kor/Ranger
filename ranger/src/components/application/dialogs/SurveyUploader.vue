<template>
    <v-dialog 
        :value='model'
        persistent
    >
        <v-card class='confirmation-card'>
            <span>
                <v-btn
                    class='close-btn'
                    color='red'
                    x-small
                    fab
                    elevation=1
                    @click="$emit('close')"
                >
                    <v-icon
                        color='white'
                        medium
                    >
                        mdi-close
                    </v-icon>
                </v-btn>
                <v-card-title primary-title class='justify-center head'>Upload a survey</v-card-title>
            </span>
            <span class='label'>
                Enter the survey's URL below
            </span>
            <v-text-field
                v-model='url'
                type='text'
                outlined
                solo
                clearable
                :color='colors.primary'
                label=". . ."
            />
            <v-spacer></v-spacer>
            <v-flex align-center>
                <v-btn
                    class='upload-btn'
                    :color='colors.primary'
                    block
                    text
                >
                    UPLOAD
                </v-btn>
            </v-flex>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        props: [
            'model'
        ],
        data() {
            return {
                url: ''
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            })
        },
        methods: {
        }
    }
</script>

<style>
    .head {
        margin-top: -35px;
    }
    .close-btn {
        margin: 5px;
    }
    .label {
        font-size: 12px;
        margin: 5px;
    }
    .upload-btn {
        margin-right: auto;
        margin-left: auto;
        left: 0;
        right: 0;
        text-transform: none;
    }
</style>