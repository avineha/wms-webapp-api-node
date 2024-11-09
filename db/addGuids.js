const DatabaseWrapper = require('./dbWrapper');
const db = new DatabaseWrapper('./database.sqlite');

async function addGuid(guid) {
    try {
        await db.run("INSERT INTO guids (guid) VALUES (?)", [guid]);
        console.log(`GUID ${guid} added to the database.`);
    } catch (error) {
        console.error("Error inserting GUID:", error);
    }
}

// Add sample GUIDs
addGuid("70818c9a-adea-4222-9040-f9c3ff3d93b9");
addGuid("12345678-1234-1234-1234-1234567890ab");
