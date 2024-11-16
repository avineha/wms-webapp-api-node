
const axios = require('axios');

async function testAPIs() {
    try {
        // Fetch all topics
        let response = await axios.get('http://localhost:3000/api/topics');
        console.log('Topics:', response.data);

        // Add a message to a topic
        response = await axios.post('http://localhost:3000/api/messages', {
            topic: 'test/topic',
            message: 'Hello, MQTT!',
            direction: 'publish'
        });
        console.log('Post message response:', response.data);

        // Fetch updated topics
        response = await axios.get('http://localhost:3000/api/topics');
        console.log('Updated Topics:', response.data);
    } catch (error) {
        console.error('Error during API test:', error.response ? error.response.data : error.message);
    }
}

testAPIs();
