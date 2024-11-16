const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const MQTTWrapper = require('./mqttWrapper');

const app = express();
const mqttWrapper = new MQTTWrapper('mqtt://192.168.1.10'); // Replace with your MQTT broker URL

// Middleware
app.use(bodyParser.json());
app.use('/api', routes);

// Function to subscribe to all topics on startup
async function subscribeToAllTopics() {
    try {
        const topics = await mqttWrapper.db.getRows('SELECT topic FROM topics');
        topics.forEach(({ topic }) => {
            mqttWrapper.subscribe(topic);
            console.log(`Subscribed to topic: ${topic}`);
        });
    } catch (err) {
        console.error('Error subscribing to topics on startup:', err.message);
    }
}

// Subscribe to all topics when the application starts
subscribeToAllTopics();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Closing application...');
    mqttWrapper.close();
    process.exit();
});
