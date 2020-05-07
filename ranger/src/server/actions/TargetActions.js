const CONSTANTS = require('../Constants');
const GENERAL_ACTIONS = require('./GeneralActions');
const FTP_SERVER = require('../FTPServer');
const LOGGER = require('../Logger');
const TARGETS_CACHE = {};

module.exports = {
    createTarget,
    TARGETS_CACHE,
    targetExists,
    getTargets,
    updateTarget,
    deleteTarget
};

/**
 * Create a new personal target.
 * 
 * @param {Object} data - {
 *                           {String} user - The token of the target owner
 *                           {String} base64Data - Base64 represntation of the target's image,
 *                           {String} name - Name of the target,
 *                           {Object} center - {
 *                                                {Number} x - x coordinate (in percentages),
 *                                                {Number} y - y coordinate (in percentages)
 *                                             },
 *                           {Number} rings - Amount of value rings,
 *                           {Number} ringDiameter - Diameter of inner ring [%],
 *                           {String} date - Target's creation date [YYYY-MM-DD HH:mm:ss]
 *                        },
 * @returns {Boolean} True if the process is successful.
 */
async function createTarget(data) {
    let imageType = data.base64Data.split('data:image/').pop().split(';')[0];
    let destName = data.user + '_' + data.name;
    let dir = '/db/targets/custom/';
    let destPath = `${dir}${destName}.${imageType}`;

    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: null, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(20), value: data.name, options: {} },
        { name: 'image_path', type: CONSTANTS.SQL.VarChar(256), value: destPath, options: {} },
        { name: 'cx', type: CONSTANTS.SQL.Decimal(6, 3), value: data.center.x.toFixed(3), options: {} },
        { name: 'cy', type: CONSTANTS.SQL.Decimal(6, 3), value: data.center.y.toFixed(3), options: {} },
        { name: 'rings', type: CONSTANTS.SQL.Int, value: data.rings, options: {} },
        { name: 'diam', type: CONSTANTS.SQL.Int, value: data.ringDiameter, options: {} },
        { name: 'date', type: CONSTANTS.SQL.VarChar(19), value: data.date, options: {} }
    ];

    return new Promise(resolve => {
        //add to db
        GENERAL_ACTIONS.runProcedure('AddTarget', params)
            .then(() => {
                //store target photo in the FTP server
                let compression = 400;
                FTP_SERVER.uploadImage(data.base64Data, destName, dir, compression)
                    .then(() => resolve(true))
                    .catch(err => {
                        LOGGER.error(`Could not store created target '${data.name}' in the server`, err);
                        resolve(false);
                    })
            })
            .catch(err => {
                LOGGER.error(`Could not create target '${data.name}'`, err);
                resolve(false);
            })
    })
}

/**
 * Check if a target already exists in the database.
 * 
 * @param {String} user - The user's token (email address)
 * @param {String} discipline - The name of the target's discipline
 * @param {String} name - The chosen name of the target
 * @returns {Boolean} True if the target already exists in the database.
 */
async function targetExists(user, name) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(20), value: name, options: {} }
    ];

    let query = await GENERAL_ACTIONS.runProcedure('TargetExists', params);
    let exists = query[0]['target_exists'];
    return exists;
}

/**
 * Get all targets of a single user.
 * 
 * @param {Object} data - {
 *                           {String} user - The user that owns the targets ('default' is the owner of the default targets),
 *                           {Array} storedIDs - All targets' IDs that should not be fetched from the FTP server.
 *                                                     These targets will have 'null' as their 'base64Image' value;
 *                           {Boolean} getNonActive - True to also get the non-active targets
 *                        } 
 * @returns {Object} {
 *                      {Number} id - Target's ID,
 *                      {String} user - The user of the target,
 *                      {String} discipline - Target's discipline,
 *                      {String} name - Target's name,
 *                      {String} base64Data - Base64 date of the target's image,
 *                      {Number} rings - Amount of rings in the target,
 *                      {Number} ringDiameter - Diameter of each ring in the target,
 *                      {Object} center - {
 *                                           {Number} x - x coordinates (in percentages),
 *                                           {Number} y - y coordinates (in percentages)
 *                                        },
 *                      {String} creationDate - The date at which the target was created [YYYY-MM-DD HH:mm:ss],
 *                      {Boolean} active - True if the target is active
 *                   }
 */
async function getTargets(data) {
    let nonActiveParam = data.getNonActive ? 1 : 0;

    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'get_non_active', type: CONSTANTS.SQL.TinyInt, value: nonActiveParam, options: {} }
    ];

    let query = await GENERAL_ACTIONS.runProcedure('GetTargets', params);
    let targets = [];

    for (let i in query) {
        let obj = query[i];
        let targetId = obj['id'];
        let targetActive = obj['active'] === 1;
        
        //check if target's base64 code is already cached
        let cachedAtClient = data.storedIDs.includes(targetId);
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
            ringDiameter: obj['rings_diameter'],
            center: {
                x: obj['center_x'],
                y: obj['center_y']
            },
            creationDate: obj['creation_date'],
            active: targetActive
        })
    }

    return targets;
}

/**
 * Update a target.
 * 
 * @param {Object} data - {
 *                           {Number} id - The id of the updated target,
 *                           {Object} center - {
 *                                                {Number} x - The x coordinates of the new target's center [%],
 *                                                {Number} y - The y coordinates of the new target's center [%]
 *                                             },
 *                           {Number} rings - Amount of value rings inside the target,
 *                           {Number} diameter - Diameter size of the center value ring
 *                        }
 * @returns {Boolean} True if the process is successful.
 */
async function updateTarget(data) {
    let params = [
        { name: 'id', type: CONSTANTS.SQL.Int, value: data.id, options: {} },
        { name: 'new_center_x', type: CONSTANTS.SQL.Decimal(6, 3), value: data.center.x, options: {} },
        { name: 'new_center_y', type: CONSTANTS.SQL.Decimal(6, 3), value: data.center.y, options: {} },
        { name: 'new_rings_amount', type: CONSTANTS.SQL.Int, value: data.rings, options: {} },
        { name: 'new_diameter', type: CONSTANTS.SQL.Int, value: data.diameter, options: {} },
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('UpdateTarget', params)
        .then(() => resolve(true))
        .catch(err => {
            LOGGER.error(`Could not update target #${data.id}`, err);
            resolve(false);
        });
    });
}

/**
 * Delete a target.
 * Delete it permanently if it's not contained in any journals nor ranges,
 * otherwise just deactivate it.
 * 
 * @param {Object} data - {
 *                           {String} user - User token
 *                           {Number} id - The ID of the target to be deleted
 *                        }
 * @returns {Boolean} True if the process is successful.
 */
async function deleteTarget(data) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'id', type: CONSTANTS.SQL.Int, value: data.id, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('DeleteTarget', params)
            .then(() => resolve(true))
            .catch(err => {
                LOGGER.error(`Could not delete target #${data.id}`, err);
                resolve(false);
            });
    })
}