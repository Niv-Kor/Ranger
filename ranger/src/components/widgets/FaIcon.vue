<template>
    <span @click='onClick'>
        <i
            :class='`ico fas fa-${$props.icon} fa-${$props.size}`'
            id='icon'
            :style='{ color: $props.color }'
        />
    </span>
</template>

<script>
    export default {
        props: {
            /**
             * The name of the icon.
             * 
             * @example 'file-signature'
             */
            icon: {
                type: String,
                required: true
            },
            /**
             * The icon's size.
             * 
             * @example 'xs', 'sm', 'lg', '2x', '3x', ...
             */
            size: {
                type: String,
                required: false,
                default: 'lg'
            },
            /**
             * The icon's color.
             */
            color: {
                type: String,
                required: false,
                default: '#000000'
            },
            /**
             * True if the component is disabled (for clicks).
             */
            disabled: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        methods: {
            /**
             * Activate when the icon is clicked.
             * Not working if 'disabled' is set to true.
             * 
             * @emits {Event} click
             */
            onClick: function(ev) {
                if (!this.$props.disabled) this.$emit('click', ev);
            }
        }
    }
</script>