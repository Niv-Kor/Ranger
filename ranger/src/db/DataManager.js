import { DBManager } from './DBManager';

export class DataManager {
    constructor() {
        let dbManager = new DBManager();
        this.db = dbManager.getDB();
        this.targets = this.db.targets;
    }

    /**
     * Insert a target to the indexedDB store.
     * 
     * @param {Object} target - {
     *                             {Number} id - The ID of the target (as inserted in the server DB),
     *                             {String} image - Base64 data of the target's image
     *                          }
     */
    async insertTarget(target) {
        let fetched = await this.fetchTarget(target.id);
        if (!fetched) {
            try { await this.targets.put(target); }
            catch (ex) { console.error('Could not add the following target to indexedDB:', target, ex); }
        }
    }

    /**
     * Get all stored targets.
     */
    async getAllTargets() {
        return await this.targets.toArray();
    }

    /**
     * Get a target from the indexedDB store.
     * 
     * @param {Number} id - Target's id
     */
    async fetchTarget(id) {
        let targetsArr = await this.getAllTargets();
        let filtered = targetsArr.filter(x => x.id === id);
        return filtered ? filtered[0] : null;
    }

    /**
     * Get all stored tatgets' IDs.
     */
    async getTargetsIDs() {
        let targetsArr = await this.getAllTargets();
        let ids = [];
        for (let obj of targetsArr) ids.push(obj.id);
        return ids;
    }
}