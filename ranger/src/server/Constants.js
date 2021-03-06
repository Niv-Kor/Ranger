const HTTP = require('http');
const FRONT_SERVER = HTTP.createServer();
const SOCKET = require('socket.io');
const FILE_SYSTEM = require('fs');
const FRONT_IO = SOCKET.listen(FRONT_SERVER);
const SERVER_PORT = 19200;
const PORT_HANDLER = require('get-port');
const TEMP = require('tempfile');
const { performance } = require('perf_hooks');
const FORMAL_DISCIPLINES = [
    'Archery',
    'Firearm'
]

//Microsoft SQL Server
const SQL = require('mssql');
const DB_CONFIG = {
    server: 'sql5053.site4now.net',
    database: 'DB_A56FAD_ranger',
    user: 'DB_A56FAD_ranger_admin',
    password: 'P2413567cu221',
    port: 1433,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

//FTP Client
const FTP = require('ftp');
const FTP_CONFIG = {
    host: 'ftp.site4now.net',
    user: 'nivkorapps-002',
    password: 'P2413567cu221',
    port: 21,
};
const FTP_CLIENT = new FTP();

module.exports = {
    HTTP,
    SQL,
    FRONT_SERVER,
    SOCKET,
    FRONT_IO,
    PORT_HANDLER,
    TEMP,
    FTP_CLIENT,
    SERVER_PORT,
    DB_CONFIG,
    FTP_CONFIG,
    FILE_SYSTEM,
    FORMAL_DISCIPLINES,
    performance
}