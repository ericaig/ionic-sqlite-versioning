export default [
    `CREATE TABLE IF NOT EXISTS ionicSqliteVersioning(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NULL,
        version INTEGER,
        createdAt INTEGER NULL,
        updatedAt INTEGER NULL
    )`,
    `CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        surname TEXT,
        email TEXT,
        username TEXT,
        language TEXT,
        dateOfBirth TEXT,
        lastLoggedIn INTEGER
    )`,
]