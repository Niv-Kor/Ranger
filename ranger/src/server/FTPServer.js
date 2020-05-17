const CONSTANTS = require('./Constants');
const LOGGER = require('./Logger');
const UTILS = require('./Utils');

module.exports = {
    uploadImage,
    downloadImage
}

/**
 * Upload an image to the FTP server.
 * 
 * @param {String} base64 - Base64 representation of the image
 * @param {String} destName - Name of the saved file at the destination
 * @param {String} destDir - Directory of the destination
 * @param {Number} compression - Maximum size for both the width and the height of the image
 * @returns {Boolean} True if the process is successful.
 */
async function uploadImage(base64, destName, destDir, compression) {
    let rawData = base64.split(';base64,').pop();
    let fileType = base64.split('data:image/').pop().split(';')[0];
    let destDirSuffix = (destDir.charAt(destDir.length - 1) == '/') ? '' : '/';
    let destPath = `${destDir}${destDirSuffix}${destName}.${fileType}`;
    let tempFile = CONSTANTS.TEMP(`.${fileType}`);

    return new Promise(resolve => {
        //convert from base64 to image
        CONSTANTS.FILE_SYSTEM.writeFile(tempFile, rawData, {encoding: 'base64'}, () => {
            //compress image
            if (compression) UTILS.compressImage(tempFile, compression);

            ///upload to FTP server
            CONSTANTS.FTP_CLIENT.put(tempFile, destPath, () => {
                //delete temp file
                CONSTANTS.FILE_SYSTEM.unlink(tempFile, () => {});
                resolve(true);
            });
        });
    });
}

/**
 * Download an image from the FTP server.
 * 
 * @param {String} path - The image's path
 * @returns {String} Base 64 data of the image.
 */
async function downloadImage(path) {
    return new Promise((resolve, reject) => {
        let pathSplit = path.split('.');
        let fileType = pathSplit[pathSplit.length - 1];
        let tempFilePath = CONSTANTS.TEMP(`.${fileType}`);

        CONSTANTS.FTP_CLIENT.get(path, async (err, stream) => {
            if (err) {
                LOGGER.error(`Could not download an image from ${path}`, err);

                //try again after 3 seconds
                setTimeout(() => downloadImage(path), 3000);
                reject();
            }
            else {
                stream.once('close', () => {
                    let buffer = CONSTANTS.FILE_SYSTEM.readFileSync(tempFilePath);
                    let base64 = buffer.toString('base64');
                    resolve(base64);
                })
                stream.pipe(CONSTANTS.FILE_SYSTEM.createWriteStream(tempFilePath));
            }
        });
    })
}