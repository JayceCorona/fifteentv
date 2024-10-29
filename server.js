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
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
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
        const token = streamChat.createToken(userId);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Socket.io connection handling (if you still want to keep it)
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
