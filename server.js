const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from the current directory
app.use(express.static('./'));

// Store connected users
const users = new Set();

io.on('connection', (socket) => {
    let username = null;

    socket.on('join', (name) => {
        username = name;
        users.add(username);
        
        // Broadcast to all clients that a new user joined
        io.emit('userJoined', username);
        
        // Send current users list to the new user
        socket.emit('userList', Array.from(users));
    });

    socket.on('chatMessage', (message) => {
        if (username) {
            io.emit('message', {
                username: username,
                text: message,
                timestamp: Date.now()
            });
        }
    });

    socket.on('disconnect', () => {
        if (username) {
            users.delete(username);
            io.emit('userLeft', username);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 