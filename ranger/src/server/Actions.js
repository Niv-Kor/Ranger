const CONSTANTS = require('./Constants');
const LOGGER = require('./Logger');
const FTP_SERVER = require('./FTPServer');

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
 *                            user: <String>{user email},
 *                            discipline: <String>{journal discipline},
 *                            name: <String>{journal name},
 *                            storedTarget: <String>{stored target path},
 *                            customTarget: {
 *                                            base64Img: <String>{base64 represntation of the image},
 *                                            chosenName: <String>{name of the image}
 *                                            fileType: <String>{image file type}
 *                                          }
 *                            isTargetCustom: <Boolean>{true if the target is customized},
 *                        }
 */
async function createJournal(socket, data) {
    //check if the journal already exists
    let existanceCheckParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name }
    ];

    let existanceCheck = await runProcedure('JournalExists', existanceCheckParams);
    let journalExists = existanceCheck[0]['journal_exists'];

    //journal exists - reject
    if (journalExists) {
        socket.emit('create_journal', {
            exitCode: 1,
            message: 'A journal of ' + data.discipline + ' with that name alredy exists.'
        });

        return;
    }

    let uploadedTargetDestPath = '';

    //add custom target if needed
    if (data.isTargetCustom) {
        let chosenName = data.customTarget.chosenName.split('.')[0];
        let base64 = data.customTarget.base64Data;
        let imageType = base64.split('data:image/').pop().split(';')[0];
        let destName = data.user + '_' + chosenName;
        let dir = '/db/custom targets/';
        uploadedTargetDestPath = dir + destName + imageType;

        let tagetExistanceCheckParams = [
            { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user },
            { name: 'image_name', type: CONSTANTS.SQL.VarChar(128), value: chosenName },
            { name: 'image_type', type: CONSTANTS.SQL.VarChar(16), value: imageType },
        ];

        let targetExistanceCheck = await runProcedure('CustomTargetExists', tagetExistanceCheckParams);
        let targetExists = targetExistanceCheck[0]['target_exists'];
        
        //custom target exists - reject
        if (targetExists) {
            socket.emit('create_journal', {
                exitCode: 2,
                message: 'A target with the name ' + chosenName + ' alredy exists.'
            });

            return;
        }
        else {
            let customTargetParams = [
                { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user },
                { name: 'image_name', type: CONSTANTS.SQL.VarChar(128), value: chosenName },
                { name: 'image_type', type: CONSTANTS.SQL.VarChar(16), value: imageType },
                { name: 'image_path', type: CONSTANTS.SQL.VarChar(512), value: uploadedTargetDestPath }
            ];

            //add to db
            await runProcedure('AddCustomTarget', customTargetParams);

            //store custom target photo in the server
            let compression = 400;
            FTP_SERVER.uploadImage(base64, destName, dir, compression);
        }
    }

    //create new journal
    let journalParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name },
        { name: 'stored_default_target', type: CONSTANTS.SQL.VarChar(128), value: data.storedTarget },
        { name: 'custom_default_target', type: CONSTANTS.SQL.VarChar(512), value: uploadedTargetDestPath },
        { name: 'is_target_custom', type: CONSTANTS.SQL.TinyInt(1), value: data.isTargetCustom }
    ];

    runProcedure('CreateJournal', journalParams)
        .then(() => {
            socket.emit('create_journal', {
                exitCode: 0,
                message: 'Journal created successfully.'
            });
        })
        .catch(err => {
            socket.emit('create_journal', {
                exitCode: 3,
                message: 'Unknown error: ' + err
            });
        })
}