import { Injectable } from '@angular/core'
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import DbColumnTypeInterface from '../interfaces/db-column-type';
import DbLimitInterface from '../interfaces/db-limit';
import DbSortInterface from '../interfaces/db-sort';
import AddColumnToTableOptionsInterface from '../interfaces/db-add-column-options';

@Injectable({
    providedIn: 'root'
})

export class DatabaseHelpersService {
    private sqliteObj: SQLiteObject

    constructor() { }

    public set setDbConnectionObject(sqliteObj: SQLiteObject) {
        this.sqliteObj = sqliteObj
    }

    public async batch(statements: string[]): Promise<any> {
        return this.sqliteObj.sqlBatch(statements)
    }

    public async execute(statement: string, values: any[]): Promise<any> {
        return this.sqliteObj.executeSql(statement, values)
    }

    public async query(statement: string, values: any[], debug = true): Promise<any> {
        let result = null

        return this.execute(statement, values || [])
            .then((res: { insertedId: number, rows: { item: (i: number) => {}, length: number }, rowsAffected: number, changes: 1 | 0, values: any[] }) => {
                // console.log('query statement', statement)
                // console.log('query result', res)

                // TODO - return only sqlite response after executing

                res.changes = 1

                if (res.rows.length) {
                    res.values = []
                    for (let index = 0; index < res.rows.length; index++) {
                        const item = res.rows.item(index)
                        res.values.push(item)
                    }
                } else {
                    res.values = []
                }

                result = res

                return res
            })
            .finally(() => {
                if (debug) {
                    console.groupCollapsed(`DB => Query: ${statement.substring(0, 50).concat('...')}`)
                    console.log({ statement, values, dbResponse: result, dbResult: (result && result.values) || result })
                    console.groupEnd()
                }

                return result
            })
            .catch((err) => console.error('QUERY ERROR', err))
    }

    // Create one
    public async insert(table: string, fields: object) {
        const keys = Object.keys(fields).join(', ')
        const values = Object.values(fields)
        const questionMarks = []
        questionMarks.length = values.length

        // TODO - return insertedId after insert

        const statement = `INSERT INTO ${table} (${keys}) VALUES (${questionMarks.fill(' ? ').join(', ')})`

        let result = null

        return this.execute(statement, values)
            // .then(response => {
            //     console.log(`insert response ${table}`, values, response)
            //     return response
            // })
            .then(response => {
                const { changes } = response
                result = response
                return changes === 1
            })
            .finally(() => {
                console.groupCollapsed(`DB => Insert into ${table}`)
                console.log({ statement, values, dbResponse: result, dbResult: (result && result.values) || result })
                console.groupEnd()
            })
    }

    // Create many
    public async insertMany(table: string, fieldsValuesPairs: any[]) {
        // return Promise.resolve().then(() => {
        // let promises = Promise.resolve()

        // TODO - use batch insert instead ?
        const promises = []
        const statements = []

        fieldsValuesPairs.forEach(__field => {
            const keys = Object.keys(__field).join(', ')
            const values = Object.values(__field)
            const questionMarks = []
            questionMarks.length = values.length

            // promises = promises.then(() =>
            //     this.execute(`INSERT INTO ${table} (${keys}) VALUES (${questionMarks.fill(' ? ').join(', ')})`, values)
            // )

            const statement = `INSERT INTO ${table} (${keys}) VALUES (${questionMarks.fill(' ? ').join(', ')})`
            statements.push([{ statement, values }])

            promises.push(this.execute(statement, values))
        })

        console.groupCollapsed(`DB => Insert Many into ${table}`)
        console.log(statements)
        console.groupEnd()

        return Promise.all(promises)
    }

    // Read one
    public async get(table: string, where: object, sort: DbSortInterface = {}) {
        let whereKeyValuePairs = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
        whereKeyValuePairs = !!whereKeyValuePairs ? ` AND ${whereKeyValuePairs}` : ''

        let sortKeyValuePairs = Object.keys(sort).map(key => `${key} ${sort[key]}`).join(', ')
        sortKeyValuePairs = !!sortKeyValuePairs ? ` ORDER BY ${sortKeyValuePairs}` : ''

        const statement = `SELECT * from ${table} WHERE 1${whereKeyValuePairs}${sortKeyValuePairs} LIMIT 1`
        const values = Object.values(where)

        let result = null

        console.log(`DB => Get from table: ${table}`)

        const { values: [firstItem] } = await this.query(statement, values, false)
            .then(response => {
                result = response
                return response
            })
            .finally(() => {
                console.groupCollapsed(`DB => Get from table: ${table}`)
                console.log({ statement, values, dbResponse: result, dbResult: (result && result.values) || result })
                console.groupEnd()
            })

        return firstItem || null
    }

    // Read last one
    // public async getLast(table: string, where: object, sort: DbSortInterface) {
    // //     validate.string(table, 'Taula actualització bd')
    // //     validate.object(where, 'Camps identificar buscar bd')

    //     let whereKeyValuePairs = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
    //     whereKeyValuePairs = !!whereKeyValuePairs ? ` AND ${whereKeyValuePairs}` : ''

    //     let sortKeyValuePairs = Object.keys(sort).map(key => `${key} = ${sort[key]}`).join(', ')
    //     sortKeyValuePairs = !!sortKeyValuePairs ? ` ORDER BY ${sortKeyValuePairs}` : ''

    //     const { values: [firstItem] } = await this.query(`SELECT * from ${table} WHERE 1${whereKeyValuePairs}${sortKeyValuePairs} LIMIT 1`, Object.values(where))
    //     // .then((res) => { console.log('DB:: GET', res); return res })
    //     return firstItem || null
    // }

    // Read many
    public async getMany(table: string, where: object = {}, sort: DbSortInterface = {}, limit: DbLimitInterface = {}) {
        let whereKeyValuePairs = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
        whereKeyValuePairs = !!whereKeyValuePairs ? ` AND ${whereKeyValuePairs}` : ''

        let sortKeyValuePairs = Object.keys(sort).map(key => `${key} ${sort[key]}`).join(', ')
        sortKeyValuePairs = !!sortKeyValuePairs ? ` ORDER BY ${sortKeyValuePairs}` : ''

        let _limit = ''

        if (Object.keys(limit).length) {
            _limit = typeof limit.rows === 'number' ? `${limit.rows}` : ''
            _limit = typeof limit.rows === 'number' && typeof limit.offset === 'number' ? `${limit.rows}, ${limit.offset}` : _limit

            _limit = ` LIMIT ${_limit}`
        }

        const statement = `SELECT * FROM ${table} WHERE 1${whereKeyValuePairs}${sortKeyValuePairs}${_limit}`
        const __values = Object.values(where)
        let result = null

        console.log(`DB => Get many from table: ${table}`)

        const { values } = await this.query(statement, __values, false)
            .then(response => {
                result = response
                return response
            })
            .finally(() => {
                console.groupCollapsed(`DB => Get many from table: ${table}`)
                console.log({ statement, values: __values, dbResponse: result, dbResult: (result && result.values) || result })
                console.groupEnd()
            })
        // .then(res => {
        //     console.log('getMany res', res)
        //     return res
        // })
        // .then((res) => { console.log('DB:: GET MANY', res); return res })
        return values || null
    }

    // Search and Read many
    public async search(table: string, where: object = {}, whereConjuction: 'AND' | 'OR' = 'OR', sort: DbSortInterface = {}, limit: DbLimitInterface = {}) {
        let whereKeyValuePairs = Object.keys(where).map(key => `${key} like '%${where[key]}%'`).join(` ${whereConjuction} `)
        whereKeyValuePairs = !!whereKeyValuePairs ? ` AND (${whereKeyValuePairs})` : ''

        let sortKeyValuePairs = Object.keys(sort).map(key => `${key} ${sort[key]}`).join(', ')
        sortKeyValuePairs = !!sortKeyValuePairs ? ` ORDER BY ${sortKeyValuePairs}` : ''

        let _limit = ''

        if (Object.keys(limit).length) {
            _limit = typeof limit.rows === 'number' ? `${limit.rows}` : ''
            _limit = typeof limit.rows === 'number' && typeof limit.offset === 'number' ? `${limit.rows}, ${limit.offset}` : _limit

            _limit = ` LIMIT ${_limit}`
        }

        const statement = `SELECT * FROM ${table} WHERE 1${whereKeyValuePairs}${sortKeyValuePairs}${_limit}`
        const __values = []
        let result = null

        console.log(`DB => Search in table: ${table}`)

        const { values } = await this.query(statement, __values, false)
            // .then((res) => { console.log('DB:: GET MANY', res); return res })
            .then(response => {
                result = response
                return response
            })
            .finally(() => {
                console.groupCollapsed(`DB => Search in table: ${table}`)
                console.log({ statement, values: __values, dbResponse: result, dbResult: (result && result.values) || result })
                console.groupEnd()
            })
        return values || null
    }

    // Update one
    public async update(table: string, where: object, props: object) {
        const whereKeyValuePairs = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
        const updateKeyValuePairs = Object.keys(props).map(key => `${key} = ?`).join(', ')

        const whereValues = [...Object.values(props), ...Object.values(where)]

        const statement = `UPDATE ${table} SET ${updateKeyValuePairs} WHERE 1 AND ${whereKeyValuePairs}`

        console.groupCollapsed(`DB => Update table: ${table}`)
        console.log({ statement, values: whereValues })
        console.groupEnd()

        return this.execute(statement, whereValues)
            .then(({ changes }) => changes === 1)
    }

    // Update many - TODO
    // public async updateMany(table: string, fields: any[], values: any[[], [], ...]) {}

    // Delete one
    public async delete(table: string, where: object) {
        // const whereKeyValuePairs = Object.keys(where).map(key => `${key} = ${where[key]}`).join(' AND ')

        let whereKeyValuePairs = Object.keys(where).map(key => `${key} = ${where[key]}`).join(' and ')
        whereKeyValuePairs = !!whereKeyValuePairs ? ` AND ${whereKeyValuePairs}` : ''

        const statement = `DELETE FROM ${table} WHERE 1${whereKeyValuePairs}`

        console.groupCollapsed(`DB => Delete from table: ${table}`)
        console.log({ statement, values: [] })
        console.groupEnd()

        return this.execute(statement, [])
            .then(({ changes }) => changes === 1)
    }

    // Delete many
    // public async deleteMany(table: string, where: object = {}) {
    // //     validate.string(table, 'Taula eliminar registre bd')
    // //     validate.object(where, 'Camps identificar eliminar bd')

    //     let whereKeyValuePairs = Object.keys(where).map(key => `${key} = ${where[key]}`).join(' and ')
    //     whereKeyValuePairs = !!whereKeyValuePairs ? ` AND ${whereKeyValuePairs}` : ''

    //     return this.execute(`DELETE FROM ${table} WHERE 1${whereKeyValuePairs}`, [])
    //         .then(({ changes }) => changes === 1)
    // }

    // public async addColumn(table: string, column: DbColumnTypeInterface) {
    //     const [columnName] = Object.keys(column)
    //     const type = column[columnName]

    //     const statement = `ALTER TABLE ${table} ADD COLUMN ${columnName} ${type}`

    //     console.groupCollapsed(`DB => Alter table: ${table}`)
    //     console.log({ statement, values: [] })
    //     console.groupEnd()

    //     return this.execute(statement, [])
    //         .then(({ changes }) => changes === 1)
    // }

    public async addColumn(table: string, options: AddColumnToTableOptionsInterface) {
        if (typeof table !== 'string') throw new Error(`'string' was expected for table name got '${typeof table}' instead`)
        if (typeof options !== 'object') throw new Error(`'object' was expected for options value got '${typeof options}' instead`)

        if (!options.hasOwnProperty('name')) throw new Error(`Please specify a name for the new field to add to '${table}' table`)
        if (typeof options.name !== 'string') throw new Error(`'string' was expected for field name got '${typeof options.name}' instead`)

        if (!options.hasOwnProperty('type')) throw new Error(`Please specify the type of field '${options.name}' is`)
        if (typeof options.type !== 'string') throw new Error(`'string' was expected for the type of field '${options.name}' is got '${typeof options.type}' instead`)

        const { name, type } = options

        // TODO: continue from here.. implement other properties from options value

        // ALTER TABLE equipment ADD COLUMN location text DEFAULT 0;
        const statement = `ALTER TABLE ${table} ADD COLUMN ${name} ${type} DEFAULT null`
    }
}
