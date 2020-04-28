import Dexie from 'dexie';

export class DBManager {
    constructor() {
        this.db = new Dexie('RangerDB');
        this.db.version(1).stores({
            targets: 'id'
        });
    }

    getDB() { return this.db; }
}