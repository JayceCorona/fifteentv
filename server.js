const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { StreamChat } = require('stream-chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Stream Chat with your API credentials
const streamChat = new StreamChat(
    'g9m53zqntv69',
    'ks322sn88gqcjjtssqbwz7bfnvzbxvm9s4nh8xt3qj7vcqzhxfqutym6bha4hdey'
);

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
});

// Endpoint to generate Stream user token
app.post('/token', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log('Generating token for user:', userId);
        
        const token = streamChat.createToken(userId);
        console.log('Token generated successfully:', token);
        res.json({ token });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
