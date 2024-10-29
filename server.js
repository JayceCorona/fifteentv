const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Store connected users
const users = new Set();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected');

    // Handle joining
    socket.on('join', (username) => {
        users.add(username);
        socket.username = username;
        io.emit('userJoined', username);
        io.emit('userList', Array.from(users));
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
        io.emit('message', {
            username: socket.username,
            text: message,
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.emit('userLeft', socket.username);
            io.emit('userList', Array.from(users));
        }
    });
});

http.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 