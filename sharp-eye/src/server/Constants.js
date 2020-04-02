const HTTP = require('http');
const SQL = require('mssql');
const SERVER = HTTP.createServer();
const SOCKET = require('socket.io');
const IO = SOCKET.listen(SERVER);
const SERVER_PORT = 19200;
const DB_CONFIG = {
    server: 'sql5053.site4now.net',
    database: 'DB_A56FAD_sharpeye',
    user: 'DB_A56FAD_sharpeye_admin',
    password: 'P2413567cu221',
    port: 1433,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
}

module.exports = {
    HTTP,
    SQL,
    SERVER,
    SOCKET,
    IO,
    SERVER_PORT,
    DB_CONFIG
}