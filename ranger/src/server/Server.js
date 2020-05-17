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
        socket.on('sign_user', async user => {
            let res = await ACTIONS.auth.signUser(user);
            socket.emit('sign_user', res);
        });

        socket.on('get_hash_password', async user => {
            let res = await ACTIONS.auth.getHashedPassword(user);
            socket.emit('get_hash_password', res);
        });

        socket.on('load_account_data', async user => {
            let res = await ACTIONS.auth.loadAccountData(user);
            socket.emit('load_account_data', res);
        });

        socket.on('update_account', async user => {
            let res = await ACTIONS.auth.updateAccountData(user);
            socket.emit('update_account', res);
        });

        /* Journals */
        socket.on('create_journal', async data => {
            let res = await ACTIONS.journals.createJournal(data);
            socket.emit('create_journal', res);
        });

        socket.on('load_journals', async (user, ignoreTargets) => {
            let journals = await ACTIONS.journals.loadJournals(user, ignoreTargets);
            socket.emit('load_journals', journals);
        })

        socket.on('journal_exists', async data => {
            let exists = await ACTIONS.journals.journalExists(data.user, data.discipline, data.journalName);
            socket.emit('journal_exists', exists);
        })

        socket.on('update_journal', async data => {
            let success = await ACTIONS.journals.updateJournal(data);
            socket.emit('update_journal', success);
        })

        socket.on('update_journal_order', async data => {
            ACTIONS.journals.updateJournalOrder(data);
        })

        socket.on('clear_journal_ranges', async data => {
            let success = await ACTIONS.journals.clearJournalRanges(data);
            socket.emit('clear_journal_ranges', success);
        })

        socket.on('delete_journal', async data => {
            let success = await ACTIONS.journals.deleteJournal(data);
            socket.emit('delete_journal', success);
        })

        /* Targets */
        socket.on('create_target', async data => {
            let success = await ACTIONS.targets.createTarget(data);
            socket.emit('create_target', success);
        })

        socket.on('get_targets', async (data) => {
            let targets = await ACTIONS.targets.getTargets(data);
            socket.emit(`get_targets_${data.user}`, targets);
        })

        socket.on('target_exists', async data => {
            let exists = await ACTIONS.targets.targetExists(data.user, data.targetName);
            socket.emit('target_exists', exists);
        })

        socket.on('update_target', async data => {
            let success = await ACTIONS.targets.updateTarget(data);
            socket.emit('update_target', success);
        })

        socket.on('delete_target', async data => {
            let res = await ACTIONS.targets.deleteTarget(data);
            socket.emit('delete_target', res);
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

        socket.on('load_hits', async rangeId => {
            let res = await ACTIONS.ranges.loadHits(rangeId);
            socket.emit(`load_hits_${rangeId}`, res);
        })

        socket.on('record_hit', async data => {
            let res = await ACTIONS.ranges.recordHit(data);
            socket.emit('record_hit', res);
        })

        socket.on('remove_hit', async data => {
            let res = await ACTIONS.ranges.removeHit(data);
            socket.emit('remove_hit', res);
        })

        socket.on('clear_range', async rangeId => {
            let res = await ACTIONS.ranges.clearRange(rangeId);
            socket.emit('clear_range', res);
        })

        socket.on('delete_range', async rangeId => {
            let res = await ACTIONS.ranges.deleteRange(rangeId);
            socket.emit('delete_range', res);
        })

        socket.on('update_range', async rangeId => {
            let res = await ACTIONS.ranges.updateRange(rangeId);
            socket.emit('update_range', res);
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