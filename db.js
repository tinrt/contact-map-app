const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./contacts.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT,
        LastName TEXT,
        Username TEXT UNIQUE,
        Password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Contact (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT,
        LastName TEXT,
        Title TEXT,
        Phone TEXT,
        Email TEXT,
        Address TEXT,
        Contact_By_Email INTEGER,
        Contact_By_Phone INTEGER,
        Contact_By_Mail INTEGER,
        Lat REAL,
        Lng REAL
    );
    
    )`);

    db.get("SELECT * FROM Users WHERE Username = ?", ['rcnj'], (err, row) => {
        if (!row) {
            bcrypt.hash('password', 10, (err, hash) => {
                db.run("INSERT INTO Users (FirstName, LastName, Username, Password) VALUES (?, ?, ?, ?)",
                    ['Admin', 'User', 'rcnj', hash]);
            });
        }
    });
});

module.exports = db;
