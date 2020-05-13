<template>
    <div>
        <target-canvas
            
        />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import TargetCanvas from '../../widgets/TargetCanvas';

    export default {
        components: {
            TargetCanvas
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                journalIndex: 'getSelectedJournalIndex',
                journals: 'getAllJournals'
            }),
            journal() {
                return this.journals[this.journalIndex];
            }
        }
    }
</script>