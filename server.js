const express = require('express');
const { StreamChat } = require('stream-chat');
const cors = require('cors');

const app = express();

// Add CORS middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

const serverClient = new StreamChat(
    'g9m53zqntv69',
    'ks322sn88gqcjjtssqbwz7bfnvzbxvm9s4nh8xt3qj7vcqzhxfqutym6bha4hdey'
);

app.post('/token', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Generating token for user:", userId);
        
        // Create user with full channel permissions
        await serverClient.upsertUser({
            id: userId,
            role: 'admin',
            name: `User ${userId.substring(0, 6)}`,
        });

        // Create the channel if it doesn't exist
        const channel = serverClient.channel('messaging', 'fifteen-tv-chat', {
            name: 'Fifteen.tv Chat Room',
            created_by_id: userId,
            // Add these channel configs
            configs: {
                typing_events: true,
                read_events: true,
                connect_events: true,
                search: true,
                reactions: true,
                quotes: true,
                threads: true
            }
        });

        try {
            await channel.create();
            console.log("Channel created or already exists");
        } catch (channelError) {
            console.log("Channel already exists or creation error:", channelError);
        }

        // Generate token with full permissions
        const token = serverClient.createToken(userId, {
            user_id: userId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            capabilities: {
                'read': true,
                'write': true,
                'publish': true,
                'presence': true,
                'connect': true,
                'delete-own-message': true,
                'update-own-message': true,
                'send-reaction': true,
                'send-reply': true,
                'search': true,
                'upload-file': true,
                'send-typing-events': true
            }
        });

        // Update channel permissions
        await channel.updatePartial({
            set: {
                "permissions": [
                    { "action": "read", "roles": ["admin", "user", "anonymous"] },
                    { "action": "write", "roles": ["admin", "user", "anonymous"] },
                    { "action": "send-message", "roles": ["admin", "user", "anonymous"] }
                ]
            }
        });

        console.log("Token generated successfully with full permissions");
        res.json({ token });
    } catch (error) {
        console.error("Token generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
