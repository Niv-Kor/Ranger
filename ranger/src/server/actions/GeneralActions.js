const CONSTANTS = require('../Constants');

module.exports = {
    runProcedure
};

/**
 * Run an sql procedure.
 * 
 * @param {String} proc - Procedure's name
 * @param {Array} params - [
 *                            {
 *                               {String} name - SQL parameter name,
 *                               {Object} type - {
 *                                                  {Function} type - MSSQL data type constant,
 *                                                  {Number} length - Data type length in bytes
 *                                               },
 *                               {*} value - Input value
 *                            },
 *                            ...
 *                         ]
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