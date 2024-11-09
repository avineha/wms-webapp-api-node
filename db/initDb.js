const DatabaseWrapper = require('./dbWrapper');
const db = new DatabaseWrapper('./database.sqlite');

async function initializeDatabase() {
    try {
        // Create Items table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                value TEXT
            )
        `);

        // Create MQTT Messages table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS mqtt_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                message TEXT,
                timestamp TEXT
            )
        `);

        // Create GUIDs table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS guids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guid TEXT UNIQUE
            )
        `);
        
        console.log("Tables created");
    } catch (error) {
        console.error("Error creating tables:", error);
    }
}

initializeDatabase();
