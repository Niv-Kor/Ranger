const CONSTANTS = require('./Constants');
const LOGGER = require('./Logger');
const ACTIONS = {
    general: require('./actions/GeneralActions'),
    auth: require('./actions/AuthActions'),
    targets: require('./actions/TargetActions'),
    journals: require('./actions/JournalActions')
}

//configure client requests
CONSTANTS.IO.on('connection', socket => {
    /* Authentication */
    socket.on('sign_user', user => {
        ACTIONS.auth.signUser(socket, user)
    });

    socket.on('get_hash_password', user => {
        ACTIONS.auth.gerHashedPassword(socket, user);
    });

    /* Journals */
    socket.on('create_journal', data => {
        ACTIONS.journals.createJournal(socket, data);
    });

    socket.on('load_journals', async user => {
        let journals = await ACTIONS.journals.loadJournals(user);
        socket.emit('load_journals', journals);
    })

    socket.on('journal_exists', async data => {
        let exists = await ACTIONS.journals.journalExists(data.user, data.discipline, data.journalName);
        socket.emit('journal_exists', exists);
    })

    socket.on('update_journal_order', async data => {
        ACTIONS.journals.updateJournalOrder(data);
    })

    /* Targets */
    socket.on('target_exists', async data => {
        let exists = await ACTIONS.targets.targetExists(data.user, data.discipline, data.targetName);
        socket.emit('target_exists', exists);
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