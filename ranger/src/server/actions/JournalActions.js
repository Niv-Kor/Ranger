const CONSTANTS = require('../Constants');
const FTP_SERVER = require('../FTPServer');
const LOGGER = require('../Logger');
const GENERAL_ACTIONS = require('./GeneralActions');
const TARGETS_CACHE = require('./TargetActions').TARGETS_CACHE;

module.exports = {
    createJournal,
    journalExists,
    loadJournals,
    updateJournal,
    updateJournalOrder,
    clearJournalRanges,
    deleteJournal
};

/**
 * Create a new shooting journal for a user.
 * 
 * @param {Object} data - {
 *                           {String} user - User's email address,
 *                           {String} discipline - Journal discipline,
 *                           {String} name - Journal name,
 *                           {String} storedTarget - Stored target path,
 *                           {Object} customTarget - {
 *                                                      {String} base64Data - Base64 represntation of the image,
 *                                                      {String} chosenName - Name of the image,
 *                                                      {Object} center - {
 *                                                                           {Number} x - x coordinate (in percentages),
 *                                                                           {Number} y - y coordinate (in percentages)
 *                                                                        },
 *                                                      {Number} rings - Amount of rings,
 *                                                      {Number} ringDiameter - Diameter of inner ring (in integer percentages)
 *                                                   },
 *                           {Boolean} isTargetCustom - True if the target is customized,
 *                           {String} colorTheme - A hexadecimal representation of the journal's color theme
 *                           {String} date - creation date [YYYY-MM-DD HH:mm]
 *                        }
 */
async function createJournal(data) {
    let uploadedTargetDestPath = '';
    let targetName, targetUser;
    
    //store custom target if needed
    if (data.isTargetCustom) {
        targetName = data.customTarget.chosenName.split('.')[0];
        targetUser = data.user;
        let base64 = data.customTarget.base64Data;
        let imageType = base64.split('data:image/').pop().split(';')[0];
        let destName = data.user + '_' + targetName;
        let dir = '/db/targets/custom/';
        uploadedTargetDestPath = dir + destName + '.' + imageType;
        
        let customTargetParams = [
            { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
            { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: null, options: {} },
            { name: 'image_name', type: CONSTANTS.SQL.VarChar(21), value: targetName, options: {} },
            { name: 'image_path', type: CONSTANTS.SQL.VarChar(256), value: uploadedTargetDestPath, options: {} },
            { name: 'cx', type: CONSTANTS.SQL.Decimal(6, 3), value: data.customTarget.center.x.toFixed(3), options: {} },
            { name: 'cy', type: CONSTANTS.SQL.Decimal(6, 3), value: data.customTarget.center.y.toFixed(3), options: {} },
            { name: 'rings', type: CONSTANTS.SQL.Int, value: data.customTarget.rings, options: {} },
            { name: 'diam', type: CONSTANTS.SQL.Int, value: data.customTarget.ringDiameter, options: {} },
            { name: 'date', type: CONSTANTS.SQL.VarChar(19), value: data.date, options: {} }
        ];

        //add to db
        await GENERAL_ACTIONS.runProcedure('AddTarget', customTargetParams);

        //store custom target photo in the FTP server
        let compression = 400;
        await FTP_SERVER.uploadImage(base64, destName, dir, compression);
    }
    else {
        targetName = data.storedTarget;
        targetUser = 'default';
    }

    //create new journal
    let targetIdExtractionParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: targetUser, options: {} },
        { name: 'image_name', type: CONSTANTS.SQL.VarChar(21), value: targetName, options: {} }
    ];

    let targetIdQuery = await GENERAL_ACTIONS.runProcedure('GetTargetId', targetIdExtractionParams);
    let targetId = targetIdQuery[0]['id'];
    let journalParams = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'discipline', type: CONSTANTS.SQL.VarChar(20), value: data.discipline, options: {} },
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(15), value: data.name, options: {} },
        { name: 'target', type: CONSTANTS.SQL.Int, value: targetId, options: {} },
        { name: 'theme', type: CONSTANTS.SQL.VarChar(9), value: data.colorTheme, options: {} },
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('CreateJournal', journalParams)
        .then(() => {
            resolve({
                exitCode: 0,
                message: 'Journal created successfully.'
            });
        })
        .catch(err => {
            resolve({
                exitCode: 1,
                message: err
            });
        })
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
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(15), value: name, options: {} }
    ];
    
    let query = await GENERAL_ACTIONS.runProcedure('JournalExists', params);
    let exists = query[0]['journal_exists'];
    return exists;
}

/**
 * Load all journals of a single user.
 * 
 * @param {String} user - Username token
 * @param {Array} ignoreTargetIds - All targets' IDs that should not be fetched from the FTP server.
 *                                  These targets will have 'null' as their 'base64Image' value.
 * @returns {Array} [
 *                     {
 *                        {Number} id - The ID of the journal,
 *                        {String} discipline - The name of the journal's discipline,
 *                        {String} formalDiscipline - Same as discipline, but if it's customized then formal is 'Other',
 *                        {String} name - The journal's name,
 *                        {String} color - The journal's color theme,
 *                        {Number} order - The journal's sorting order,
 *                        {Object} target - {
 *                                             {Number} id - Target's unique ID,
 *                                             {String} name - The default target's name,
 *                                             {String} base64Data - Target's base64 image data,
 *                                             {Number} rings - Amount of target rings,
 *                                             {Number} ringDiameter - The diameter of each ring in the target,
 *                                             {Object} center - {
 *                                                                  {Number} x - x coordinates if the center (in percentages),
 *                                                                  {Number} y - y coordinates if the center (in percentages),
 *                                                               }
 *                                          }
 *                        {Number} targetId - Journal's default target's ID,
 *                     }
 *                     ...
 *                  ]
 */
async function loadJournals(user, ignoreTargetIds) {
    let params = [
        { name: 'user', type: CONSTANTS.SQL.VarChar(70), value: user, options: {} },
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('LoadJournals', params)
            .then(async res => {
                let journals = [];

                for (let obj of res) {
                    let discipline = obj['discipline'];
                    let isFormal = CONSTANTS.FORMAL_DISCIPLINES.includes(discipline);
                    let formalDiscip = isFormal ? discipline : 'Other';
                    let targetId = obj['target_id'];
                    
                    //check if target's base64 code is already cached or should be ignored
                    let cachedAtClient = ignoreTargetIds.includes(targetId);
                    let cachedAtServer = !!TARGETS_CACHE[`target #${targetId}`];
                    let targetBase64 = '';
                    
                    if (cachedAtClient) targetBase64 = null;
                    else if (cachedAtServer) targetBase64 = TARGETS_CACHE[`target #${targetId}`];
                    //fetch and cache it
                    else {
                        let defTargetPath = obj['target_path'];
                        let targetPathSplit = defTargetPath.split('.');
                        let fileType = targetPathSplit[targetPathSplit.length - 1];
                        let base64Prefix = `data:image/${fileType};base64,`;
                        let base64Suffix = await FTP_SERVER.downloadImage(defTargetPath);
                        targetBase64 = base64Prefix + base64Suffix;
                        TARGETS_CACHE[`target #${targetId}`] = targetBase64;
                    }

                    journals.push({
                        id: obj['id'],
                        discipline: discipline,
                        formalDiscipline: formalDiscip,
                        name: obj['journal_name'],
                        color: obj['theme_color'],
                        order: obj['sort_order'],
                        target: {
                            id: targetId,
                            name: obj['target_name'],
                            base64Data: targetBase64,
                            rings: obj['target_rings'],
                            ringDiameter: obj['target_rings_diameter'],
                            center: {
                                x: obj['target_center_x'],
                                y: obj['target_center_y']
                            }
                        }
                    });
                }

                resolve(journals);
            })
        .catch(err => LOGGER.error('Could not load journals properly', err));
    });
}

/**
 * Update a journal's data.
 * 
 * @param {Object} data - {
 *                           {Number} id - Journal's ID,
 *                           {String} name - Journal's new name (optional),
 *                           {String discipline - Journal's new discipline (optional),
 *                           {Number} targetId - Journal's new default target ID (optional),
 *                           {String} colorTheme - Journal's new color theme (optional)
 *                        }
 * @returns {Boolean} True if the process was successful.
 */
function updateJournal(data) {
    let params = [
        { name: 'id', type: CONSTANTS.SQL.Int, value: data.id, options: {} },
        { name: 'new_name', type: CONSTANTS.SQL.VarChar(15), value: data.name, options: {} },
        { name: 'new_discipline', type: CONSTANTS.SQL.VarChar(20), value: data.discipline, options: {} },
        { name: 'new_target_id', type: CONSTANTS.SQL.Int, value: data.targetId, options: {} },
        { name: 'new_color', type: CONSTANTS.SQL.VarChar(9), value: data.colorTheme, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('UpdateJournal', params)
        .then(() => resolve(true))
        .catch(err => {
            LOGGER.error(`Could not update journal #${data.id}`, err);
            resolve(false);
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
        { name: 'journal_name', type: CONSTANTS.SQL.VarChar(15), value: data.name, options: {} },
        { name: 'new_order', type: CONSTANTS.SQL.Int, value: data.newOrder, options: {} },
    ];

    GENERAL_ACTIONS.runProcedure('UpdateJournalOrder', params);
}

/**
 * Delete all ranges of a particular journal.
 * 
 * @param {Number} journalId - The ID of the journal that contains the ranges to delete.
 * @returns {Boolean} True if the journal's ranges have been deleted successfully.
 */
function clearJournalRanges(journalId) {
    let params = [
        { name: 'journal_id', type: CONSTANTS.SQL.Int, value: journalId, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('ClearJournalRanges', params)
        .then(() => resolve(true))
        .catch(err => {
            LOGGER.error(`Could not clear the ranges from journal #${journalId}`, err);
            resolve(false);
        });
    });
}

/**
 * Delete a journal.
 * 
 * @param {Number} journalId - The ID of the journal to delete.
 * @returns {Boolean} True if the journal has been deleted successfully.
 */
function deleteJournal(journalId) {
    let params = [
        { name: 'id', type: CONSTANTS.SQL.Int, value: journalId, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('DeleteJournal', params)
        .then(() => resolve(true))
        .catch(err => {
            LOGGER.error(`Could not delete journal #${journalId}`, err);
            resolve(false);
        });
    });
}