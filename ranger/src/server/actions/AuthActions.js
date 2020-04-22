const CONSTANTS = require('../Constants');
const GENERAL_ACTIONS = require('./GeneralActions');

module.exports = {
    validateUser,
    signUser
};

/**
 * Sign a user as a new entry in the data base.
 * Let the client know if the procedure succeeded.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} user - {
 *                           {String} email - User data token,
 *                           {String} password - User's password
 *                        }
 */
async function signUser(socket, user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email, options: {} },
        { name: 'password', type: CONSTANTS.SQL.VarChar(40), value: user.password, options: {} }
    ];

    //check if the user already exists
    let validationProc = await GENERAL_ACTIONS.runProcedure('validateUser', params);
    let exists = validationProc[0]['is_valid'];

    //sign and let the client know if the procedure succeeded
    if (!exists) await GENERAL_ACTIONS.runProcedure('signUp', params);
    socket.emit('sign_user', !exists);
}

/**
 * Check if a user already exists in the data base.
 * Let the client know the answer.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} user - {
 *                           {String} email - User data token,
 *                           {String} password - User's password
 *                        }
 */
async function validateUser(socket, user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email, options: {} },
        { name: 'password', type: CONSTANTS.SQL.VarChar(40), value: user.password, options: {} }
    ];

    let recSet = await GENERAL_ACTIONS.runProcedure('validateUser', params);
    let isValid = recSet[0]['is_valid'];
    socket.emit('validate_user', isValid);
}
