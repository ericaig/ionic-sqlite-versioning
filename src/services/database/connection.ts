import { Injectable } from '@angular/core'
import createTableStatements from './create-tables-statements'
import { SQLite, SQLiteObject, SQLiteDatabaseConfig } from '@ionic-native/sqlite/ngx';
import { Plugins } from '@capacitor/core'
import { DatabaseHelpersService } from './helpers';
const { Device } = Plugins

@Injectable({
    providedIn: 'root'
})

export class DatabaseConnectionService {
    private sqliteObj: SQLiteObject

    private databaseConfig: SQLiteDatabaseConfig = {
        name: 'connectFourGame.db',
        location: 'default'
    }

    constructor(
        private sqlite: SQLite,
        private helpers: DatabaseHelpersService
    ) { }

    private get getDbName() {
        const { name } = this.databaseConfig
        return name.substring(0, name.length - 3)
    }

    private async open() {
        return this.sqlite.create(this.databaseConfig)
    }

    private async createTables() {
        console.log(`ATTEMPTING TO ADD ${createTableStatements.length} TABLES TO ${this.getDbName}`)

        return this.helpers.batch(createTableStatements)
            .then(() => {
                console.log('DB:: CREATED DATABASE TABLES SUCCESSFULLY!')
            })
    }

    public async initialize() {
        const { platform } = await Device.getInfo()

        // TODO - test on Electron that everything works fine before adding it as an accepted platform
        if (!['android', 'ios'].includes(platform)) throw new Error(`Can't run plugin on the current platform: ${platform}`)

        this.sqliteObj = await this.open()

        if (!this.sqliteObj) throw new Error(`Could not initialize database`)

        // TODO create dedicated functions for console.* and add a config to easily enable/disable console logging...
        console.log(`🛢 DATABASE '${this.getDbName}' OPENED SUCCESSFULLY ✅`)

        this.helpers.setDbConnectionObject = this.sqliteObj

        return this.createTables()
    }
}
