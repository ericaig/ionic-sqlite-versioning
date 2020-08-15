import { Injectable } from '@angular/core'
import { DatabaseHelpersService } from '../helpers'
import IonicSqliteDbVersioningInterface from 'src/services/interfaces/ionic-sqlite-versioning'
import AddColumnToTableOptionsInterface from 'src/services/interfaces/db-add-column-options'

const __table__ = 'ionicSqliteVersioning'

@Injectable({
    providedIn: 'root'
})

export class IonicSqliteDbVersioningService {
    // private __cache: object

    constructor(
        private dbHelpers: DatabaseHelpersService
    ) { }

    // private set cache(value) { this.__cache = value }
    // private get cache() { return this.__cache }

    private get timestamp() {
        return Math.floor(Date.now() / 1000)
    }

    // CRUD

    public async create(props: IonicSqliteDbVersioningInterface) {
        const { name, version } = props

        const createdAt = this.timestamp

        return this.delete().then(() =>
            this.dbHelpers.insert(__table__, { name, version, settings: '', createdAt })
        )
            .then(() => { })
    }

    public async addColumn(table: string, options: AddColumnToTableOptionsInterface) {
        return this.dbHelpers.addColumn(table, options)
        .then(() => { })
    }

    public async read() {
        return this.dbHelpers.get(__table__, {})
            .then((result: IonicSqliteDbVersioningInterface) => result)
    }

    public async update(id: number, props: { version: number }) {
        const updatedAt = this.timestamp

        return this.dbHelpers.update(__table__, { id }, { ...props, updatedAt })
            .then(() => { })
    }

    public async delete() {
        return this.dbHelpers.delete(__table__, {})
            .then(() => { })
    }
}
