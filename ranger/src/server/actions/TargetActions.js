const CONSTANTS = require('../Constants');
const GENERAL_ACTIONS = require('./GeneralActions');

module.exports = {
    targetExists
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