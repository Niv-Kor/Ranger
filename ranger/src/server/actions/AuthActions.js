const CONSTANTS = require('../Constants');
const GENERAL_ACTIONS = require('./GeneralActions');
const LOGGER = require('../Logger');

module.exports = {
    getHashedPassword,
    signUser,
    loadAccountData,
    updateAccountData
};

/**
 * Sign a user as a new entry in the data base.
 * Let the client know if the procedure succeeded.
 * 
 * @param {Object} data - {
 *                           {String} username - User's name,
 *                           {String} email - User email token,
 *                           {String} password - User's password
 *                        }
 */
async function signUser(data) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: data.email, options: {} },
        { name: 'hash', type: CONSTANTS.SQL.VarChar(512), value: data.password, options: {} },
        { name: 'username', type: CONSTANTS.SQL.VarChar(20), value: data.username, options: {} }
    ];

    //sign and let the client know if the procedure succeeded
    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('signUp', params)
        .then(() => {
            resolve({
                errorCode: 0,
                message: ''
            });
        })
        .catch(err => {
            let isDup = err.message.includes('duplicate');
            let reason;

            if (isDup) reason = 'This email address already belongs to a user.';
            else reason = 'Server error. Please try again later';

            resolve({
                errorCode: 1,
                message: reason
            });
        });
    });
}

/**
 * Check if a user already exists in the data base.
 * Let the client know the answer.
 * 
 * @param {String} user - User email token
 */
async function getHashedPassword(user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} }
    ];
    
    let recSet = await GENERAL_ACTIONS.runProcedure('GetUserHashedPassword', params);

    return new Promise(resolve => {
        let hashPass = recSet.length ? recSet[0]['hashPass'] : null;
        resolve(hashPass);
    })
}

/**
 * Get all data of a particular user.
 * 
 * @param {String} user - User email token
 * @returns {Object} {
 *                      {String} username - The user's username
 *                   }
 */
async function loadAccountData(user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} }
    ];

    let data = await GENERAL_ACTIONS.runProcedure('GetAccountData', params);
    return new Promise(resolve => {
        resolve({ username: data[0]['username'] });
    });
}

/**
 * Update a user's account info (password, email, username, etc...).
 * 
 * @param {Object} user - {
 *                           {String} oldEmail - The user's original email address,
 *                           {String} newEmail - The user's new email address (optional)
 *                           {String} newHashPass - The user's new hashed password (optional)
 *                           {String} newUsername - The user's new username (optional)
 *                        }
 * @returns {Boolean} True if the process is successful.
 */
async function updateAccountData(user) {
    let newEmail = user.newEmail ? user.newEmail : null;
    let hashPass = user.newHashPass ? user.newHashPass : null;
    let username = user.newUsername ? user.newUsername : null;

    let params = [
        { name: 'old_email', type: CONSTANTS.SQL.VarChar(70), value: user.oldEmail, options: {} },
        { name: 'new_email', type: CONSTANTS.SQL.VarChar(70), value: newEmail, options: {} },
        { name: 'new_hash_pass', type: CONSTANTS.SQL.VarChar(512), value: hashPass, options: {} },
        { name: 'new_username', type: CONSTANTS.SQL.VarChar(20), value: username, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('UpdateAccountData', params)
        .then(() => resolve(true))
        .catch(err => {
            LOGGER.error(`Could not update account '${user.oldEmail}'`, err);
            resolve(false);
        })
    })
}