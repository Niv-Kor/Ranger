const CONSTANTS = require('../Constants');
const LOGGER = require('../Logger');
const GENERAL_ACTIONS = require('./GeneralActions');

module.exports = {
    createRange,
    loadRanges,
    rangeExists,
    loadHits,
    recordHit,
    removeHit
};

/**
 * Create a new range.
 * 
 * @param {Object} data - {
 *                           {Number} journalId - The ID of the journal to which the range belongs
 *                           {Number} targetId - The ID of the target of which the range aims at
 *                           {String} date - The date of the target (format: 'YYYY-MM-DD hh:mm')
 *                        }
 * @returns {Boolean} True if the process is successful.
 */
async function createRange(data) {
    let params = [
        { name: 'journal_id', type: CONSTANTS.SQL.Int, value: data.journalId, options: {} },
        { name: 'date', type: CONSTANTS.SQL.VarChar(19), value: data.date, options: {} },
        { name: 'target', type: CONSTANTS.SQL.Int, value: data.targetId, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('CreateRange', params)
            .then(() => resolve(true))
            .catch(err => {
                LOGGER.error('Could not create a new range for parameters:\n' +
                             'journal_id: ' + data.journalId + ',\n' +
                             'target_id: ' + data.targetId + ',\n' +
                             'date: ' + data.date, err);
    
                resolve(false);
            });
    });
}

/**
 * Load all ranges of a single journal.
 * 
 * @param {Object} data - {
 *                           {String} user - The user's token,
 *                           {Number} journalId - The ID of the journal to which the ranges belongs
 *                        }
 * @returns {Object} {
 *                      {Number} journalId - The ID of the journal to which the ranges belongs,
 *                      {Object} ranges - [
 *                                           {
 *                                              {Number} id - The ID of the range,
 *                                              {String} date - The date at which the range took place [DD-MM-YYYY],
 *                                              {Number} targetId - The ID of the range's target,
 *                                              {Number} ends - Amount of ends in the range,
 *                                              {Number} score - The range's score,
 *                                              {Number} total - The range's total achievable score
 *                                           }
 *                                           ...
 *                                        ]
 *                   }
 */
async function loadRanges(data) {
    let params = [
        { name: 'shooter', type: CONSTANTS.SQL.VarChar(70), value: data.user, options: {} },
        { name: 'journal_id', type: CONSTANTS.SQL.Int, value: data.journalId, options: {} },
    ];

    return new Promise((resolve, reject) => {
        GENERAL_ACTIONS.runProcedure('LoadRanges', params)
            .then(res => {
                let ranges = [];
                
                for (let obj of res) {
                    ranges.push({
                        id: obj['id'],
                        date: obj['date'],
                        targetId: obj['target_id'],
                        ends: obj['ends'],
                        score: obj['score'],
                        total: obj['total']
                    })
                }

                resolve({
                    journalId: data.journalId,
                    ranges
                })
            })
            .catch(err => {
                LOGGER.error(`Could not load ${data.user}'s ranges`, err);
                reject();
            });
    });
}

/**
 * Check if a journal already exists in the database.
 * 
 * @param {String} data - {
 *                           {Number} journalId - The ID of the journal to which the ranges belongs
 *                           {String} date - The date at which the range took place
 *                        }
 * @returns {Boolean} True if the range already exists in the data base.
 */
async function rangeExists(data) {
    let params = [
        { name: 'journal_id', type: CONSTANTS.SQL.Int, value: data.journalId, options: {} },
        { name: 'date', type: CONSTANTS.SQL.VarChar(19), value: data.date, options: {} }
    ];
    
    let query = await GENERAL_ACTIONS.runProcedure('RangeExists', params);
    let exists = query[0]['range_exists'];
    return exists;
}

/**
 * Record a range hit in the database.
 * 
 * @param {Object} data - {
 *                           {Number} hitId - The ID of the hit (in range context),
 *                           {Number} rangeId - The ID of the range,
 *                           {Object} point - {
 *                                               {Number} x - x coordinates [%],
 *                                               {Number} y - y coordinates [%]
 *                                            },
 *                           {Number} score - The achieved score of the hit,
 *                           {Number} round - The round number in which the hit was made
 *                        }
 * @returns {Boolean} True if the process is successful.
 */
async function recordHit(data) {
    let params = [
        { name: 'hit_id', type: CONSTANTS.SQL.Int, value: data.hitId, options: {} },
        { name: 'range_id', type: CONSTANTS.SQL.Int, value: data.rangeId, options: {} },
        { name: 'cx', type: CONSTANTS.SQL.Decimal(6, 3), value: data.point.x, options: {} },
        { name: 'cy', type: CONSTANTS.SQL.Decimal(6, 3), value: data.point.y, options: {} },
        { name: 'score', type: CONSTANTS.SQL.Int, value: data.score, options: {} },
        { name: 'round', type: CONSTANTS.SQL.Int, value: data.round, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('RecordHit', params)
            .then(() => resolve(true))
            .catch(err => {
                LOGGER.error(`Could not record hit #${data.hitId} for range #${data.rangeId}`, err);
                resolve(false);
            });
    });
}

/**
 * Remove a range hit from the database.
 * 
 * @param {Object} data - {
 *                           {Number} hitId - The ID of the hit (in range context),
 *                           {Number} rangeId - The ID of the range
 *                        }
 * @returns {Boolean} True if the process is successful.
 */
async function removeHit(data) {
    let params = [
        { name: 'hit_id', type: CONSTANTS.SQL.Int, value: data.hitId, options: {} },
        { name: 'range_id', type: CONSTANTS.SQL.Int, value: data.rangeId, options: {} }
    ];

    return new Promise(resolve => {
        GENERAL_ACTIONS.runProcedure('RemoveHit', params)
            .then(() => resolve(true))
            .catch(err => {
                LOGGER.error(`Could not remove hit #${data.hitId} for range #${data.rangeId}`, err);
                resolve(false);
            });
    });
}

/**
 * Load all hits of a particular range.
 * 
 * @param {Object} rangeId - y
 * @returns {Object} True if the process is successful.
 */

 /**
 * Load all hits of a particular range.
 * 
 * @param {Object} rangeId - The ID of the range to which the hits belong.
 * @returns {Array} [
 *                     [
 *                        {
 *                           {Number} hitId - The ID of the hit (in range context),
 *                           {Object} point - {
 *                                               {Number} x - x coordinates [%],
 *                                               {Number} y - y coordinates [%]
 *                                            },
 *                           {Number} score - The achieved score of the hit
 *                        }
 *                        ...
 *                     ]
 *                     ...
 *                  ]  
 */
async function loadHits(rangeId) {
    let params = [
        { name: 'range_id', type: CONSTANTS.SQL.Int, value: rangeId, options: {} }
    ];
    let res = await GENERAL_ACTIONS.runProcedure('LoadHits', params);
    let completeArr = [[]];

    return new Promise((resolve, reject) => {
        if (!res) {
            LOGGER.error(`Could not remove hit #${data.hitId} for range #${data.rangeId}`, err);
            reject();
        }
        else {
            let roundHits = null;
            let roundNo = 0;

            do {
                roundHits = res.filter(x => x['round_no'] === roundNo);
                if (!roundHits.length) break;
                else {
                    completeArr[roundNo] = [];
                    let roundArr = completeArr[roundNo];
                    roundNo++;

                    for (let hit of roundHits) {
                        roundArr.push({
                            hitId: hit['id'],
                            point: {
                                x: hit['x'],
                                y: hit['y']
                            },
                            score: hit['score']
                        })
                    }
                }
            }
            while (!!roundHits.length);
            resolve(completeArr);
        }
    });
}