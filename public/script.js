async function initializeStreamChat() {
    try {
        console.log('Initializing Stream Chat...');
        
        // Check if the SDK is loaded properly
        if (!window.StreamChat) {
            throw new Error('Stream Chat SDK not loaded');
        }
        
        const userId = 'user-' + Math.random().toString(36).substring(7);
        console.log('Generated user ID:', userId);
        
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const { token } = await response.json();
        console.log('Token received');

        // Initialize Stream Chat client
        chatClient = window.StreamChat.getInstance('g9m53zqntv69');
        console.log('Stream client created');

        await chatClient.connectUser(
            {
                id: userId,
                name: `User ${userId.slice(-4)}`,
            },
            token
        );
        console.log('User connected');

        channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
            name: 'Fifteen.tv Chat',
        });
        
        await channel.watch();
        console.log('Channel watching');

        // Set up message listener
        channel.on('message.new', event => {
            console.log('New message received:', event);
            appendMessage(event.message);
        });

        setupMessageHandlers();
        return true;
    } catch (error) {
        console.error('Error in chat initialization:', error);
        console.error('Error details:', error.stack);
        return false;
    }
}