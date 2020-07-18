// https://www.sqlite.org/datatype3.html

export default interface DbColumnTypeInterface {
    [propName: string]: 'TEXT' | 'INTEGER' | 'NULL' | 'REAL' | 'BLOB'
}