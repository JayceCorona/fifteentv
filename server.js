const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files (e.g., HTML, CSS, JS) in the root directory
app.use(express.static(__dirname));

// Handle new WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for chat messages from this client
    socket.on('chat message', (msg) => {
        // Broadcast message to all clients
        io.emit('chat message', msg);
    });

    // Handle client disconnecting
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
