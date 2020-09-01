import { Injectable } from '@angular/core';
import { IonicSqliteDbVersioningService } from 'src/services/database/handlers/ionic-sqlite-versioning';
import IonicSqliteDbVersioningInterface from 'src/services/interfaces/ionic-sqlite-versioning';

@Injectable({
    providedIn: 'root'
})

export class IonicSqliteDbVersioningProvider {
    /**
     * This indicates the current version of the app's sqlite database.
     * As this can be changed after each updates, if the current value
     * Of this variable is different from the version saved to sqlite database
     * Then it's time to do dbUpgrade, else, insert into db-config table (if db-config registry) doesn't exist
     *
     *
     * VERY IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     *
     *
     * NEW COLUMNS SHOULD ALSO BE ADDED TO THEIR CORRESPONDING TABLE.
     *
     * This is because if a user installs this app at version 2.0.0 (db version 5) they should have all the previous upgrades implemented
     * To the correspoding table without having to execute this function (this.upgrade())
     */
    private readonly version = 3

    constructor(
        private db: IonicSqliteDbVersioningService
    ) { }

    private async getDatabaseConfig() {
        let config: IonicSqliteDbVersioningInterface = null

        try {
            config = await this.db.read()
        } catch (error) {
            console.error(error)
        }

        return config
    }

    private async createDatabaseConfig() {
        try {
            return this.db.create({ version: this.version })
                .then(() => {
                    console.log('Database config CREATED successfully')
                })
        } catch (error) {
            console.error(error)
        }
    }

    private async updateConfig() {
        try {
            const config = await this.getDatabaseConfig()
            return this.db.update(config.id, { version: this.version })
                .then(() => {
                    console.log('Database config UPDATED successfully')
                })
        } catch (error) {
            console.error(error)
        }
    }
    /**
     * @param  {number} version The version number of the upgrade. For example,
     * If a user installs an app that's version 1.0.5 (db version 5) and there are upgrades to be made
     * The
     * @param  {function} upgradeFnc The upgrade function to execute
     */
    private async execUpgradeFncForASpecificVersion(version: number, upgradeFnc: () => Promise<any>) {
        try {
            if (version === this.version && typeof upgradeFnc === 'function') return await upgradeFnc()

            console.log(`This upgrade has already been implemented for version ${version}`)
        } catch (error) {
            console.error(error)
        }
        return Promise.resolve()
    }

    /**
     * This is a function dedicated to adding columns to `Activitat` table
     * @example
     * return this.execUpgradeFncForASpecificVersion(2, (async () => this.db.addColumn(tableName, { testColumn2: 'TEXT' })))
     * .then(() =>
     *  this.execUpgradeFncForASpecificVersion(3, (async () => this.db.addColumn(tableName, { testColumn3: 'INTEGER' })))
     * )
     * .then(() =>
     *  this.execUpgradeFncForASpecificVersion(4, (async () => this.db.addColumn(tableName, { testColumn4: 'TEXT' })))
     * )
     */
    private async addColumnsToUserTable() {
        try {
            const tableName = 'users'

            return this.execUpgradeFncForASpecificVersion(3, (async () => this.db.addColumn(tableName, {
                name: 'address',
                type: 'TEXT',
                defaultValue: "Carrer Sant Jordi"
            })))
        } catch (error) {
            console.error(error)
        }
    }

    private async alterTables() {
        try {
            return this.addColumnsToUserTable()
                .then(() => {
                    console.log('Databases ALTERED successfully')
                })
        } catch (error) {
            console.error(error)
        }
    }

    /**
     *
     *
     *
     *
     *
     *
     * @VERY___________________IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     *
     * NEW COLUMNS SHOULD ALSO BE ADDED TO THEIR CORRESPONDING TABLE IN THE `tables-statements.ts` FILE.
     *
     * This is because if a user installs this app at version 2.0.0 (db version 5) they should have all the previous upgrades implemented
     * To the correspoding table without having to execute this function (this.upgrade())
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     * @description
     * This function performs any database upgrade, like adding new columns to a table, etc.
     * For example, the current version of this app can be `1.0.0 (db version 1)` and in
     * Version `1.0.1 (db version 2)`, a new column (dateOfBirth) needs to be added to the user table.
     *
     * The way this works is, since dateOfBirth is a new column, we create the
     * Required functions to add this column to the user table.
     *
     * Add the function to the alterTables() fnc maintaining the async/await or as callbacks to .then chaining
     * And that should be it.
     *
     * After the app has been updated from version `1.0.0 (db version 1)` to `1.0.1 (db version 2)`,
     * The upgrade process will be initiated and the add column fnc to add dateOfBirth to the user table will be executed
     * Because the version in the databaseConfig table is less than `this.version`
     *
     * After this process has finished, we update the databaseConfig table to the latest version since all changes has already been applied
     */
    public async upgrade() {
        try {
            const config = await this.getDatabaseConfig()

            console.log('Database config', config)

            if (config && config.version) {
                if (config.version < this.version) {
                    // let's update
                    return this.alterTables()
                        .then(() =>
                            this.updateConfig()
                        )
                } else {
                    // // let's touch db config
                    // this.updateConfig()

                    // do nothing
                    console.log('No database upgrade to execute')
                }
            } else {
                return this.createDatabaseConfig()
            }
        } catch (error) {
            console.error(error)
            return this.createDatabaseConfig()
        }
    }
}