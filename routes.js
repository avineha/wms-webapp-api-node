const express = require('express');
const router = express.Router();

const MQTTWrapper = require('./mqttWrapper');

const mqttWrapper = new MQTTWrapper('mqtt://192.168.1.10'); // Replace with your MQTT broker URL


// Middleware to validate `guid` header
const validateGuid = async (req, res, next) => {
    const guid = req.headers['guid'];

    if (!guid) {
        return res.status(400).json({ error: 'Missing GUID in headers' });
    }

    try {
        const rows = await mqttWrapper.db.getRows('SELECT * FROM guids WHERE guid = ?', [guid]);
        if (rows.length === 0) {
            return res.status(403).json({ error: 'Invalid GUID' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Apply the middleware to all routes
router.use(validateGuid);

// API to create a topic
router.post('/topics', async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const topicId = await mqttWrapper.getOrCreateTopicId(topic);
        res.json({ success: true, topicId, message: 'Topic created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to publish a message to a topic
router.post('/publish', (req, res) => {
    const { topic, message } = req.body;

    if (!topic || !message) {
        return res.status(400).json({ error: 'Both topic and message are required' });
    }

    try {
        mqttWrapper.publish(topic, message);
        res.json({ success: true, message: 'Message published successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to subscribe to a topic
router.post('/subscribe', (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        mqttWrapper.subscribe(topic);
        res.json({ success: true, message: `Subscribed to topic: ${topic}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get all messages (published and subscribed)
router.get('/messages', async (req, res) => {
    try {
        const messages = await mqttWrapper.db.getRows(`
            SELECT messages.id, topics.topic, messages.message, messages.direction, messages.timestamp
            FROM messages
            INNER JOIN topics ON messages.topic_id = topics.id
            ORDER BY messages.timestamp DESC
        `);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
