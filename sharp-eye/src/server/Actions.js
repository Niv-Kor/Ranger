const CONSTANTS = require('./Constants')

module.exports = {
    validateUser,
    signUser
};

/**
 * Run an sql procedure.
 * 
 * @param {String} proc - Procedure's name
 * @param {Array} params - [{ name: '{param_name}', type: SQL.{type}, value: {input_value} }]
 * @returns {Object} The output recordset.
 */
async function runProcedure(proc, params) {
    let connection = await CONSTANTS.SQL.connect(CONSTANTS.DB_CONFIG);
    let req = connection.request();

    //set input
    for (let i in params) {
        let param = params[i]
        req.input(param.name, param.type, param.value);
    }
    
    let execution = await req.execute(proc);
    return execution.recordset;
}

/**
 * Sign a user as a new entry in the data base.
 * Let the client know if the procedure succeeded.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} user - { email: '{user email}', password: '{user password}' }
 */
async function signUser(socket, user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email },
        { name: 'password', type: CONSTANTS.SQL.VarChar(40), value: user.password }
    ];

    //check if the user already exists
    let validationProc = await runProcedure('validateUser', params);
    let exists = validationProc[0]['is_valid'];

    //sign and let the client know if the procedure succeeded
    if (!exists) await runProcedure('signUp', params);
    socket.emit('sign_user', !exists);
}

/**
 * Check if a user already exists in the data base.
 * Let the client know the answer.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} user - { email: '{user email}', password: '{user password}' }
 */
async function validateUser(socket, user) {
    let params = [
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email },
        { name: 'password', type: CONSTANTS.SQL.VarChar(40), value: user.password }
    ];

    let recSet = await runProcedure('validateUser', params);
    let isValid = recSet[0]['is_valid'];
    socket.emit('validate_user', isValid);
}