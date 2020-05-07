export {
    windowDimMixin
}

const windowDimMixin = {
    data() {
        return {
            windowDim: {
                width: 0,
                height: 0
            },
        }
    },
    created() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        /**
         * Activate when the window's size is changing.
         * Save the new size.
         */
        handleResize: function() {
            this.windowDim.width = window.innerWidth;
            this.windowDim.height = window.innerHeight;
        }
    }
}