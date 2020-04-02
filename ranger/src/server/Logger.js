const MSG_PREFIX = '>>> ';
const ERR_PREFIX = '\n!---ERROR: ';
const ERR_SUFFIX = '!---\n';

module.exports  = {
    log,
    error
};

/**
 * Log a valid message to the server's console.
 * 
 * @param {String} msg - The message to log
 */
function log(msg) { console.log(MSG_PREFIX + msg); }

/**
 * Log an error message to the server's console.
 * 
 * @param {String} msg - A message about the error
 * @param {Error} err  - The formal error message
 */
function error(msg, err) {
    console.error(ERR_PREFIX);
    if (msg) console.error(msg);
    console.error(err);
    console.error(ERR_SUFFIX);
}