const CONSTANTS = require('../Constants');
const GENERAL_ACTIONS = require('./GeneralActions');

module.exports = {
    gerHashedPassword,
    signUser
};

/**
 * Sign a user as a new entry in the data base.
 * Let the client know if the procedure succeeded.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} user - {
 *                           {String} username - User's name,
 *                           {String} email - User email token,
 *                           {String} password - User's password
 *                        }
 */
async function signUser(socket, user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email, options: {} },
        { name: 'hash', type: CONSTANTS.SQL.VarChar(512), value: user.password, options: {} },
        { name: 'username', type: CONSTANTS.SQL.VarChar(20), value: user.username, options: {} }
    ];

    //sign and let the client know if the procedure succeeded
    GENERAL_ACTIONS.runProcedure('signUp', params)
        .then(() => socket.emit('sign_user', {
            errorCode: 0,
            message: ''
        }))
        .catch(err => {
            let isDup = err.message.includes('duplicate');
            let reason;

            if (isDup) reason = 'This email address already belongs to a user.';
            else reason = 'Server error. Please try again later';

            socket.emit('sign_user', {
                errorCode: 1,
                message: reason
            })
        });
}

/**
 * Check if a user already exists in the data base.
 * Let the client know the answer.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {String} user - User data token
 */
async function gerHashedPassword(socket, userToken) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: userToken, options: {} }
    ];
    
    let recSet = await GENERAL_ACTIONS.runProcedure('GetUserHashedPassword', params);
    let hashPass = recSet.length ? recSet[0]['hashPass'] : null;
    socket.emit('get_hash_password', hashPass);
}