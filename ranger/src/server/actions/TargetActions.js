const CONSTANTS = require('../Constants');
const GENERAL_ACTIONS = require('./GeneralActions');
const FTP_SERVER = require('../FTPServer');
const TARGETS_CACHE = {};

module.exports = {
    TARGETS_CACHE,
    targetExists,
    getTargets
};

/**
 * Check if a target already exists in the database.
 * 
 * @param {String} user - The user's token (email address)
 * @param {String} discipline - The name of the target's discipline
 * @param {String} name - The chosen name of the target
 * @returns {Boolean} True if the target already exists in the database.
 */
async function targetExists(user, discipline, name) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: discipline, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(20), value: name, options: {} }
    ];

    let query = await GENERAL_ACTIONS.runProcedure('TargetExists', params);
    let exists = query[0]['target_exists'];
    return exists;
}

/**
 * Get all targets of a single user.
 * 
 * @param {String} user - The user that owns the targets ('default' is the owner of the default targets)
 * @param {Array} ignoreTargetIds - All targets' IDs that should not be fetched from the FTP server.
 *                                  These targets will have 'null' as their 'base64Image' value.
 * @returns {Object} {
 *                      {Number} id - Target's ID,
 *                      {String} user - The user of the target,
 *                      {String} discipline - Target's discipline,
 *                      {String} name - Target's name,
 *                      {String} base64Data - Base64 date of the target's image,
 *                      {Number} rings - Amount of rings in the target,
 *                      {Number} ringsDiameter - Diameter of each ring in the target,
 *                      {Object} center - {
 *                                           {Number} x - x coordinates (in percentages),
 *                                           {Number} y - y coordinates (in percentages)
 *                                        }
 *                   }
 */
async function getTargets(user, ignoreTargetIds) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
    ];

    let query = await GENERAL_ACTIONS.runProcedure('GetTargets', params);
    let targets = [];

    for (let i in query) {
        let obj = query[i];
        let targetId = obj['id'];
        
        //check if target's base64 code is already cached
        let cachedAtClient = ignoreTargetIds.includes(targetId);
        let cachedAtServer = !!TARGETS_CACHE[`target #${targetId}`];
        let targetBase64 = '';

        if (cachedAtClient) targetBase64 = null;
        else if (cachedAtServer) targetBase64 = TARGETS_CACHE[`target #${targetId}`];
        //fetch and cache it
        else {
            let targetPath = obj['image_path'];
            let targetPathSplit = targetPath.split('.');
            let fileType = targetPathSplit[targetPathSplit.length - 1];
            let base64Prefix = `data:image/${fileType};base64,`;
            let base64Suffix = await FTP_SERVER.downloadImage(targetPath);
            targetBase64 = base64Prefix + base64Suffix;
            TARGETS_CACHE[`target #${targetId}`] = targetBase64;
        }

        targets.push({
            id: targetId,
            user: obj['target_owner'],
            discipline: obj['discipline'],
            name: obj['image_name'],
            base64Data: targetBase64,
            rings: obj['rings'],
            ringsDiameter: obj['rings_diameter'],
            center: {
                x: obj['center_x'],
                y: obj['center_y']
            }
        })
    }

    return targets;
}