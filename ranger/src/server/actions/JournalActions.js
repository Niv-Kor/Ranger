const CONSTANTS = require('../Constants');
const FTP_SERVER = require('../FTPServer');
const GENERAL_ACTIONS = require('./GeneralActions');

module.exports = {
    createJournal,
    journalExists,
    loadJournals,
    updateJournalOrder
};

/**
 * Create a new shooting journal for a user.
 * 
 * @param {SocketIO.Socket} socket - The socket used by the server.
 * @param {Object} data - {
 *                           {String} user - User's email address,
 *                           {String} discipline - Journal discipline,
 *                           {String} name - Journal name,
 *                           {String} storedTarget - Stored target path,
 *                           {Object} customTarget - {
 *                                                      {String} base64Img - Base64 represntation of the image,
 *                                                      {String} chosenName - Name of the image,
 *                                                      {Object} center - {
 *                                                                           {Number} x - x coordinate (in percentages),
 *                                                                           {Number} y - y coordinate (in percentages)
 *                                                                        },
 *                                                      {Number} rings - Amount of rings,
 *                                                      {Number} ringDiameter - Diameter of inner ring (in integer percentages)
 *                                                   },
 *                           {Boolean} isTargetCustom - True if the target is customized,
 *                           {String} colorTheme = A hexadecimal representation of the journal's color theme
 *                        }
 */
async function createJournal(socket, data) {
    let uploadedTargetDestPath = '';
    let targetName, targetUser;
    
    //store custom target if needed
    if (data.isTargetCustom) {
        targetName = data.customTarget.chosenName.split('.')[0];
        targetUser = data.user;
        let base64 = data.customTarget.base64Data;
        let imageType = base64.split('data:image/').pop().split(';')[0];
        let destName = data.user + '_' + targetName;
        let dir = '/db/target/custom/';
        uploadedTargetDestPath = dir + destName + '.' + imageType;
        
        let customTargetParams = [
            { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
            { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: data.discipline, options: {} },
            { name: 'image_name', type: CONSTANTS.SQL.VarChar(20), value: targetName, options: {} },
            { name: 'image_path', type: CONSTANTS.SQL.VarChar(256), value: uploadedTargetDestPath, options: {} },
            { name: 'cx', type: CONSTANTS.SQL.Decimal(6, 3), value: data.customTarget.center.x.toFixed(3), options: {} },
            { name: 'cy', type: CONSTANTS.SQL.Decimal(6, 3), value: data.customTarget.center.y.toFixed(3), options: {} },
            { name: 'rings', type: CONSTANTS.SQL.Int, value: data.customTarget.rings, options: {} },
            { name: 'diam', type: CONSTANTS.SQL.Int, value: data.customTarget.ringDiameter, options: {} }
        ];

        //add to db
        await GENERAL_ACTIONS.runProcedure('AddTarget', customTargetParams);

        //store custom target photo in the server
        let compression = 400;
        FTP_SERVER.uploadImage(base64, destName, dir, compression);
    }
    else {
        targetName = data.storedTarget;
        targetUser = 'default';
    }

    //create new journal
    let targetIdExtractionParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: targetUser, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: data.discipline, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(20), value: targetName, options: {} }
    ];

    let targetIdQuery = await GENERAL_ACTIONS.runProcedure('GetTargetId', targetIdExtractionParams);
    let targetId = targetIdQuery[0]['id'];
    let journalParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: data.discipline, options: {} },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name, options: {} },
        { name: 'target', type: CONSTANTS.SQL.Int, value: targetId, options: {} },
        { name: 'theme', type: CONSTANTS.SQL.VarChar(9), value: data.colorTheme, options: {} },
    ];

    GENERAL_ACTIONS.runProcedure('CreateJournal', journalParams)
        .then(() => {
            socket.emit('create_journal', {
                exitCode: 0,
                message: 'Journal created successfully.'
            });
        })
        .catch(err => {
            socket.emit('create_journal', {
                exitCode: 1,
                message: err
            });
        })
}

/**
 * Check if a journal already exists in the database.
 * 
 * @param {String} user - The user's token (email address)
 * @param {String} discipline - The name of the target's discipline
 * @param {String} name - The chosen name of the journal
 * @returns {Boolean} True if the journal already exists in the database.
 */
async function journalExists(user, discipline, name) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: discipline, options: {} },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: name, options: {} }
    ];
    
    let query = await GENERAL_ACTIONS.runProcedure('JournalExists', params);
    let exists = query[0]['journal_exists'];
    return exists;
}

/**
 * Load all journals of a single user.
 * 
 * @param {String} user - Username token
 * @returns {Array} [
 *                     {
 *                        {String} discipline - The name of the journal's discipline,
 *                        {String} formalDiscipline - Same as discipline, but if it's customized then formal is 'Other',
 *                        {String} name - The journal's name,
 *                        {Number} targetId - Journal's default target's ID,
 *                        {String} color - The journal's color theme,
 *                        {Number} order - The journal's sorting order
 *                     }
 *                     ...
 *                  ]
 */
async function loadJournals(user) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
    ];

    return new Promise((resolve) => {
        GENERAL_ACTIONS.runProcedure('LoadJournals', params)
            .then(res => {
                let journals = [];

                for (let obj of res) {
                    let discipline = obj['discipline'];
                    let isFormal = CONSTANTS.FORMAL_DISCIPLINES.includes(discipline);
                    let formalDiscip = isFormal ? discipline : 'Other';

                    journals.push({
                        discipline: discipline,
                        formalDiscipline: formalDiscip,
                        name: obj['journal_name'],
                        targetId: obj['target_id'],
                        color: obj['theme_color'],
                        order: obj['sort_order']
                    });
                }
                resolve(journals);
            });
    });
}

/**
 * Update the order of a single journal.
 * 
 * @param {Object} data {
 *                         {String} user - User data token,
 *                         {String discipline - The name of the journal's discipline,
 *                         {String} name - The journal's name,
 *                         {Number} newOrder - The journal's new order to update
 *                      }
 */
function updateJournalOrder(data) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: data.discipline, options: {} },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(20), value: data.name, options: {} },
        { name: 'new_order', type: CONSTANTS.SQL.Int, value: data.newOrder, options: {} },
    ];

    GENERAL_ACTIONS.runProcedure('UpdateJournalOrder', params);
}