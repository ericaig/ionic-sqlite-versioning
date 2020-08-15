// https://www.sqlite.org/datatype3.html

export default interface DbColumnTypeInterface {
    [propName: string]: 'TEXT' | 'text' | 'INTEGER' | 'integer' | 'NULL' | 'null' | 'REAL' | 'real' | 'BLOB' | 'blob'
}