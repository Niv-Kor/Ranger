const CONSTANTS = require('./Constants');
const IMAGE_SIZE = require('image-size');
const SHARP = require('sharp');

module.exports = {
    resizeImage,
    compressImage
}

/**
 * Resize an image.
 * This function modifies the original image.
 * 
 * @param {Image} imagePath - Path of the image to resize
 * @param {Number} width - New image width
 * @param {Number} height - New image height
 */
async function resizeImage(imagePath, width, height) {
    SHARP(imagePath).resize(width, height).toBuffer((_, buffer) => {
        CONSTANTS.FILE_SYSTEM.writeFile(imagePath, buffer, () => {});
    });
}

/**
 * Compress an image to a maximum size, while keeping its origianl ratio.
 * This function modifies the original image.
 * 
 * @param {Image} imagePath - Path of the image to compress
 * @param {Number} maxSize - Maximum size for both the width and the height of the image
 */
async function compressImage(imagePath, maxSize) {
    await IMAGE_SIZE(imagePath, (_, dimensions) => {
        let width = dimensions.width;
        let height = dimensions.height;

        let overwidth = width > maxSize;
        let overheight = height > maxSize;

        if (overwidth || overheight) {
            if (width > height) {
                let ratio = width / maxSize;
                let calcHeight = Math.round(height / ratio);
                this.resizeImage(imagePath, maxSize, calcHeight);
            }
            else {
                let ratio = height / maxSize;
                let calcWidth = Math.round(width / ratio);
                this.resizeImage(imagePath, calcWidth, maxSize);
            }
        }
    });
}