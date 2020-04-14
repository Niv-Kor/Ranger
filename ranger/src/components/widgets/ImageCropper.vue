<template>
    <img class='thumbnail' width=100 ref='image' :src='$props.src' />
</template>

<script>
    import Cropper from 'cropperjs'

    export default {
        props: {
            src: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                cropper: {},
                destination: null,
                image: null
            }
        },
        mounted() {
            this.image = this.$refs.image;
            this.cropper = new Cropper(this.image, {
                zoomable: false,
                scaleable: false,
                rotatable: false,
                modal: false,
                guides: false,
                background: false,
                autoCrop: 1,
                viewMode: 1,
                aspectRatio: 1,
                crop: () => {
                    const canvas = this.cropper.getCroppedCanvas();
                    let dest = canvas.toDataURL('image/png');
                    this.destination = dest;
                    this.$emit('cropped', dest);
                    console.log('finish')
                }
            });
        }
    }
</script>

<style scoped>
    .thumbnail {
        display: block;
        max-width: 100%;
    }
</style>