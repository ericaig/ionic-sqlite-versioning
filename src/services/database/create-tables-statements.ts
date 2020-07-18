export default [
    `CREATE TABLE IF NOT EXISTS ionicSqliteVersioning(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        version INTEGER,
        settings TEXT DEFAULT NULL,
        createdAt INTEGER,
        updatedAt INTEGER
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