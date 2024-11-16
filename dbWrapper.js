
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Database wrapper class
class DBWrapper {
    constructor() {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Failed to connect to the database:', err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });
    }

    // Method to run an SQL query
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    // Method to fetch rows from the database
    getRows(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Close the database connection
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Failed to close the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

module.exports = DBWrapper;
