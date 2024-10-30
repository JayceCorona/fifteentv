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
            role: 'admin',  // Give admin role to allow full access
            name: `User ${userId.substring(0, 6)}`,
        });

        // Create the channel if it doesn't exist
        const channel = serverClient.channel('messaging', 'fifteen-tv-chat', {
            name: 'Fifteen.tv Chat Room',
            created_by_id: userId,
            members: [userId],
        });

        try {
            await channel.create();
            console.log("Channel created or already exists");
        } catch (channelError) {
            console.log("Channel already exists or creation error:", channelError);
        }

        // Generate token with full permissions
        const token = serverClient.createToken(userId, {
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hour expiration
            iat: Math.floor(Date.now() / 1000),
            permissions: ['*'],  // Grant all permissions
            user_details: { id: userId, role: 'admin' },
            user_id: userId
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
