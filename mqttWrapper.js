
const mqtt = require('mqtt');
const DBWrapper = require('./dbWrapper');

class MQTTWrapper {
    constructor(brokerUrl, options = {}) {
        this.client = mqtt.connect(brokerUrl, options);
        this.db = new DBWrapper();

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        this.client.on('error', (err) => {
            console.error('MQTT connection error:', err.message);
        });

        this.client.on('message', async (topic, message) => {
            const timestamp = new Date().toISOString();
            console.log(`Received message on topic ${topic}: ${message}`);

            // Save the received message to the database
            try {
                const topicId = await this.getOrCreateTopicId(topic);
                await this.db.runQuery(
                    'INSERT INTO messages (topic_id, message, direction, timestamp) VALUES (?, ?, ?, ?)',
                    [topicId, message.toString(), 'subscribe', timestamp]
                );
                console.log('Message saved to the database');
            } catch (err) {
                console.error('Failed to save message to the database:', err.message);
            }
        });
    }

    subscribe(topic) {
        this.client.subscribe(topic, (err) => {
            if (err) {
                console.error(`Failed to subscribe to topic ${topic}:`, err.message);
            } else {
                console.log(`Subscribed to topic ${topic}`);
            }
        });
    }

    publish(topic, message) {
        const timestamp = new Date().toISOString();
        this.client.publish(topic, message, async (err) => {
            if (err) {
                console.error(`Failed to publish message to topic ${topic}:`, err.message);
            } else {
                console.log(`Message published to topic ${topic}`);

                // Save the published message to the database
                try {
                    const topicId = await this.getOrCreateTopicId(topic);
                    await this.db.runQuery(
                        'INSERT INTO messages (topic_id, message, direction, timestamp) VALUES (?, ?, ?, ?)',
                        [topicId, message, 'publish', timestamp]
                    );
                    console.log('Message saved to the database');
                } catch (err) {
                    console.error('Failed to save message to the database:', err.message);
                }
            }
        });
    }

    async getOrCreateTopicId(topic) {
        try {
            const rows = await this.db.getRows('SELECT id FROM topics WHERE topic = ?', [topic]);
            if (rows.length > 0) {
                return rows[0].id;
            } else {
                const result = await this.db.runQuery('INSERT INTO topics (topic) VALUES (?)', [topic]);
                return result.id;
            }
        } catch (err) {
            throw new Error(`Failed to get or create topic ID: ${err.message}`);
        }
    }

    close() {
        this.client.end();
        this.db.close();
    }
}

module.exports = MQTTWrapper;
