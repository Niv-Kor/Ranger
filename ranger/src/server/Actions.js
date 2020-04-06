const CONSTANTS = require('./Constants')

module.exports = {
    validateUser,
    signUser,
    createJournal
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

/**
 * Create a new shooting journal for a user.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} data - {
 *                              user: '{user email}',
 *                              discipline: '{journal discipline}',
 *                              name: '{journal name}',
 *                              storedTarget: '{stored target path}',
 *                              customTarget: '{custom target image}',
 *                              isTargetCustom: '{true if the target is customized}',
 *                        }
 */
async function createJournal(socket, data) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name },
        { name: 'stored_default_target', type: CONSTANTS.SQL.VarChar(128), value: data.storedTarget },
        { name: 'custom_default_target', type: CONSTANTS.SQL.VarBinary(CONSTANTS.SQL.MAX), value: data.customTarget },
        { name: 'is_target_custom', type: CONSTANTS.SQL.TinyInt(1), value: data.isTargetCustom }
    ];

    runProcedure('CreateJournal', params)
        .then(() => { socket.emit('create_journal', true); })
        .catch(err => { console.log('error: ', err); socket.emit('create_journal', false); })
}