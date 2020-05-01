const CONSTANTS = require('./Constants');
const LOGGER = require('./Logger');
const ACTIONS = {
    general: require('./actions/GeneralActions'),
    auth: require('./actions/AuthActions'),
    targets: require('./actions/TargetActions'),
    journals: require('./actions/JournalActions'),
    ranges: require('./actions/RangeActions')
}

//handle client's connection
CONSTANTS.FRONT_IO.on('connection', async socket => {
    //assign a socket for a client
    let port = await CONSTANTS.PORT_HANDLER();
    let personalServer = CONSTANTS.HTTP.createServer();
    let personalIO = CONSTANTS.SOCKET.listen(personalServer);
    personalServer.listen(port, function(err) {
        if (err) LOGGER.error(`port ${port} could not be connected`, err);
        else {
            let origin = socket.handshake.headers.origin;
            LOGGER.log(`${origin} has connected to port ${port}.`);
        }
    });

    //send the allocated port to the client
    socket.emit('connection', port);

    //handle client's requests to the server
    personalIO.on('connection', socket => {
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

        socket.on('load_journals', async (user, ignoreTargets) => {
            let journals = await ACTIONS.journals.loadJournals(user, ignoreTargets);
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
        socket.on('get_targets', async (user, ignoreTargets) => {
            let targets = await ACTIONS.targets.getTargets(user, ignoreTargets);
            socket.emit('get_targets', targets);
        })

        socket.on('target_exists', async data => {
            let exists = await ACTIONS.targets.targetExists(data.user, data.targetName);
            socket.emit('target_exists', exists);
        })

        /* Ranges */
        socket.on('create_range', async data => {
            let res = await ACTIONS.ranges.createRange(data);
            socket.emit('create_range', res);
        })

        socket.on('load_ranges', async data => {
            let res = await ACTIONS.ranges.loadRanges(data);
            socket.emit('load_ranges', res);
        })

        socket.on('range_exists', async data => {
            let exists = await ACTIONS.ranges.rangeExists(data);
            socket.emit('range_exists', exists);
        })
    });
});

CONSTANTS.FRONT_SERVER.listen(CONSTANTS.SERVER_PORT, function(error) {
    //connect to data base
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