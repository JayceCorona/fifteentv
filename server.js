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
        
        // Create user with channel permissions
        await serverClient.upsertUser({
            id: userId,
            role: 'user',
            name: `User ${userId.substring(0, 6)}`,
        });

        // Generate token without expiration options
        const token = serverClient.createToken(userId);

        console.log("Token generated successfully");
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
