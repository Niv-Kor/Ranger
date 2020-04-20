const CONSTANTS = require('./Constants');
const LOGGER = require('./Logger');
const ACTIONS = require('./Actions');

//configure client requests
CONSTANTS.IO.on('connection', socket => {
    socket.on('sign_user', user => {
        ACTIONS.signUser(socket, user)
    });

    socket.on('validate_user', user => {
        ACTIONS.validateUser(socket, user);
    });

    socket.on('create_journal', data => {
        ACTIONS.createJournal(socket, data);
    });

    socket.on('target_exists', async data => {
        let exists = await ACTIONS.targetExists(data.user, data.discipline, data.targetName);
        socket.emit('target_exists', exists);
    })

    socket.on('journal_exists', async data => {
        let exists = await ACTIONS.journalExists(data.user, data.discipline, data.journalName);
        socket.emit('journal_exists', exists);
    })
});

//connect to data base
CONSTANTS.SERVER.listen(CONSTANTS.SERVER_PORT, function(error) {
    CONSTANTS.SQL.connect(CONSTANTS.DB_CONFIG)
        .then(() => {
            LOGGER.log('Microsoft SQL Server DB is properly connected.');
            if (error) LOGGER.error('Server startup failed.', err);
            else LOGGER.log('Server is listening to port ' + CONSTANTS.SERVER_PORT + '.');
        })
        .catch(err => LOGGER.error('Microsoft SQL Server DB has encountered a problem.', err));
})

//connect to FTP client
CONSTANTS.FTP_CLIENT.connect(CONSTANTS.FTP_CONFIG);
CONSTANTS.FTP_CLIENT.on('ready', () => {
    LOGGER.log('FileZilla FTP Client is properly connected.');
});