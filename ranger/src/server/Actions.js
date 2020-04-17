const CONSTANTS = require('./Constants');
const FTP_SERVER = require('./FTPServer');

module.exports = {
    validateUser,
    signUser,
    createJournal,
    targetExists
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
        req.input(param.name, param.type, param.value, param.options);
    }
    
    let execution = await req.execute(proc);
    return execution.recordset;
}

async function targetExists(user, discipline, name) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: discipline, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(64), value: name, options: {} }
    ];

    let query = await runProcedure('TargetExists', params);
    let exists = query[0]['target_exists'];
    return exists;
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
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email, options: {} },
        { name: 'password', type: CONSTANTS.SQL.VarChar(40), value: user.password, options: {} }
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
        { name: 'email', type: CONSTANTS.SQL.VarChar(70), value: user.email, options: {} },
        { name: 'password', type: CONSTANTS.SQL.VarChar(40), value: user.password, options: {} }
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
 *                                            chosenName: <String>{name of the image},
 *                                            center: <Object> {
 *                                                                x: <Number>{x coordinate (in percentages)}
 *                                                                y: <Number>{y coordinate (in percentages)}
 *                                                             },
 *                                            rings: <Number>{amount of rings},
 *                                            ringDiameter: <Number>{diameter of inner ring (in integer percentages)}
 *                                          }
 *                            isTargetCustom: <Boolean>{true if the target is customized},
 *                        }
 */
async function createJournal(socket, data) {
    //check if the journal already exists
    let existanceCheckParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline, options: {} },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name, options: {} }
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
    let targetName, targetUser;
    
    //add custom target if needed
    if (data.isTargetCustom) {
        targetName = data.customTarget.chosenName.split('.')[0];
        targetUser = data.user;
        let base64 = data.customTarget.base64Data;
        let imageType = base64.split('data:image/').pop().split(';')[0];
        let destName = data.user + '_' + targetName;
        let dir = '/db/target/custom/';
        uploadedTargetDestPath = dir + destName + '.' + imageType;
        let targetExists = await this.targetExists(targetUser, data.discipline, targetName);
        
        //custom target exists - reject
        if (targetExists) {
            socket.emit('create_journal', {
                exitCode: 2,
                message: 'A target of \'' + data.discipline + '\' with the name \'' + targetName + '\' alredy exists.'
            });

            return;
        }
        else {
            let customTargetParams = [
                { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
                { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline, options: {} },
                { name: 'image_name', type: CONSTANTS.SQL.VarChar(128), value: targetName, options: {} },
                { name: 'image_path', type: CONSTANTS.SQL.VarChar(512), value: uploadedTargetDestPath, options: {} },
                { name: 'cx', type: CONSTANTS.SQL.Decimal(6, 3), value: data.customTarget.center.x.toFixed(3), options: {} },
                { name: 'cy', type: CONSTANTS.SQL.Decimal(6, 3), value: data.customTarget.center.y.toFixed(3), options: {} },
                { name: 'rings', type: CONSTANTS.SQL.Int, value: data.customTarget.rings, options: {} },
                { name: 'diam', type: CONSTANTS.SQL.Int, value: data.customTarget.ringDiameter, options: {} }
            ];

            //add to db
            await runProcedure('AddTarget', customTargetParams);

            //store custom target photo in the server
            let compression = 400;
            FTP_SERVER.uploadImage(base64, destName, dir, compression);
        }
    }
    else {
        targetName = data.storedTarget;
        targetUser = 'default';
    }

    //create new journal
    let targetIdExtractionParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: targetUser, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(64), value: targetName, options: {} }
    ];

    let targetIdQuery = await runProcedure('GetTargetId', targetIdExtractionParams);
    let targetId = targetIdQuery[0]['id'];

    let journalParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(30), value: data.discipline, options: {} },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name, options: {} },
        { name: 'target', type: CONSTANTS.SQL.Int, value: targetId, options: {} },
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