// https://www.sqlite.org/datatype3.html

/**
 * https://www.sqlitetutorial.net/sqlite-alter-table/
 *
 *
 * There are some restrictions on the new column:
 *
 * - The new column cannot have a UNIQUE or PRIMARY KEY constraint.
 * - If the new column has a NOT NULL constraint, you must specify a default value for the column other than a NULL value.
 * - The new column cannot have a default of CURRENT_TIMESTAMP, CURRENT_DATE, and CURRENT_TIME, or an expression.
 * - If the new column is a foreign key and the foreign key constraint check is enabled, the new column must accept a default value NULL.
 */

export default interface AddColumnToTableOptionsInterface {
    name: string,

    type: 'TEXT' | 'text' | 'INTEGER' | 'integer' | 'NULL' | 'null' | 'REAL' | 'real' | 'BLOB' | 'blob',

    /**
     * The default value for the field to add
     */
    defaultValue?: string | number,

    /**
     * Indicates if the new field is nullable or NOT
     */
    isNullable?: boolean
}