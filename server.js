const express = require('express');
const bodyParser = require('body-parser');
const DatabaseWrapper = require('./db/dbWrapper');
const mqtt = require('mqtt');

// Initialize Express and Middleware
const app = express();
app.use(bodyParser.json());



// Middleware to check for 'guid' header and validate it against the database
app.use(async (req, res, next) => {
    const guid = req.headers['guid'];
    
    // Check if the guid exists in the database
    if (!guid) {
        return res.status(400).json({ error: "Missing 'guid' header" });
    }
    
    try {
        const result = await db.get("SELECT * FROM guids WHERE guid = ?", [guid]);
        
        if (!result) {
            // GUID not found in the database
            return res.status(403).json({ error: "Invalid 'guid'" });
        }
        
        // GUID is valid, proceed to the next middleware or route handler
        next();
    } catch (err) {
        console.error("Error validating GUID:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



// Initialize SQLite Database
const db = new DatabaseWrapper('./db/database.sqlite');

// Initialize MQTT Client
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker');
});

mqttClient.on('message', async (topic, message) => {
    const receivedMessage = {
        topic,
        message: message.toString(),
        timestamp: new Date().toISOString(),
    };

    // Insert the message into the mqtt_messages table
    try {
        await db.run(
            "INSERT INTO mqtt_messages (topic, message, timestamp) VALUES (?, ?, ?)",
            [receivedMessage.topic, receivedMessage.message, receivedMessage.timestamp]
        );
        console.log(`Stored message from ${topic}: ${message.toString()}`);
    } catch (err) {
        console.error("Failed to store MQTT message:", err);
    }
});

// MQTT Publish Endpoint
app.post('/api/mqtt/publish', (req, res) => {
    const { topic, message } = req.body;
    mqttClient.publish(topic, message, (err) => {
        if (err) {
            res.status(500).json({ error: "Failed to publish message" });
        } else {
            res.status(200).json({ message: "Message published successfully" });
        }
    });
});

// MQTT Subscribe Endpoint
app.post('/api/mqtt/subscribe', (req, res) => {
    const { topic } = req.body;
    const guid = req.headers['guid'];
    console.log(guid);
    
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            res.status(500).json({ error: "Failed to subscribe to topic" });
        } else {
            res.status(200).json({ message: `Subscribed to topic: ${topic}` });
        }
    });
});

// API to Retrieve Stored MQTT Messages
app.get('/api/mqtt/messages', async (req, res) => {
    try {
        const guid = req.headers['guid'];
        console.log(guid);
        const messages = await db.all("SELECT * FROM mqtt_messages ORDER BY timestamp DESC");
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
});


// CRUD Endpoints

// Create
app.post('/api/items', async (req, res) => {
    const { name, value } = req.body;
    try {
        const result = await db.run("INSERT INTO items (name, value) VALUES (?, ?)", [name, value]);
        res.status(201).json({ id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read All
app.get('/api/items', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM items");
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read One
app.get('/api/items/:id', async (req, res) => {
    try {
        const row = await db.get("SELECT * FROM items WHERE id = ?", [req.params.id]);
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ error: "Item not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
app.put('/api/items/:id', async (req, res) => {
    const { name, value } = req.body;
    try {
        await db.run("UPDATE items SET name = ?, value = ? WHERE id = ?", [name, value, req.params.id]);
        res.status(200).json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete
app.delete('/api/items/:id', async (req, res) => {
    try {
        await db.run("DELETE FROM items WHERE id = ?", [req.params.id]);
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(3000, () => {
    console.log("Server is running on port 8080");
});
