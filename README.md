Here’s an updated `routes.js` file including the API to read all messages (published and subscribed) with their associated topics:

### Complete `routes.js`

```javascript
const express = require('express');
const router = express.Router();
const MQTTWrapper = require('./mqttWrapper');

const mqttWrapper = new MQTTWrapper('mqtt://test.mosquitto.org'); // Replace with your MQTT broker URL

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
```

---

### cURL Commands for Testing

#### Create a Topic
```bash
curl -X POST http://localhost:3000/api/topics -H "Content-Type: application/json" -d '{
    "topic": "example/topic"
}'
```

#### Publish a Message
```bash
curl -X POST http://localhost:3000/api/publish -H "Content-Type: application/json" -d '{
    "topic": "example/topic",
    "message": "This is a test message."
}'
```

#### Subscribe to a Topic
```bash
curl -X POST http://localhost:3000/api/subscribe -H "Content-Type: application/json" -d '{
    "topic": "example/topic"
}'
```

#### Get All Messages
```bash
curl -X GET http://localhost:3000/api/messages
```

---

### Description of APIs
1. **Create a Topic**: Adds a new topic to the database.
2. **Publish a Message**: Publishes a message to the specified topic and saves it to the database.
3. **Subscribe to a Topic**: Subscribes to a topic and stores incoming messages.
4. **Get All Messages**: Retrieves all messages (both published and subscribed), including their topics, directions, and timestamps.

Let me know if you need any additional features or help!