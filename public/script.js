let chatClient;
let channel;
let processedMessageIds = new Set();

// 1. Move all style declarations to the top
const chatStyles = `
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    // ... rest of your chat styles ...
`;

const upcomingStyle = `
    .time-slot.upcoming {
        border-left: 4px solid #9E9E9E;
        opacity: 0.8;
    }
`;

const concludedStyle = `
    .time-slot.concluded {
        border-left: 4px solid #9E9E9E;
        opacity: 0.6;
        background: #f5f5f5;
    }

    .concluded-text {
        color: #666;
        font-style: italic;
    }
`;

// 2. Create a function to inject styles
function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = chatStyles + upcomingStyle + concludedStyle;
    document.head.appendChild(styleElement);
}

// 3. Update the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async function() {
    // Inject styles first
    injectStyles();
    
    // Initialize chat
    setupChat();
    
    // Initialize Stream chat with retries
    let retries = 0;
    const maxRetries = 3;
    
    async function tryConnect() {
        try {
            await initializeStreamChat();
        } catch (error) {
            retries++;
            if (retries < maxRetries) {
                console.log(`Connection attempt ${retries + 1} of ${maxRetries}`);
                setTimeout(tryConnect, 5000);
            } else {
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'system-message';
                    errorDiv.textContent = 'Unable to connect to chat. Please refresh the page.';
                    chatMessages.appendChild(errorDiv);
                }
            }
        }
    }
    
    tryConnect();

    // Rest of your initialization code
    setupScheduleGrid();
    createGlitchText();
    // ... other initializations ...
});

// Modified chat functionality with Stream integration
function setupChat() {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    if (sendButton && messageInput) {
        async function handleSend() {
            const text = messageInput.value.trim();
            if (text) {
                if (channel) {
                    try {
                        await channel.sendMessage({
                            text: text
                        });
                    } catch (error) {
                        console.error('Error sending message:', error);
                    }
                }
                
                messageInput.value = '';
            }
        }

        sendButton.addEventListener('click', handleSend);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }
}

// Add Stream Chat initialization
async function initializeStreamChat() {
    try {
        console.log("Starting chat initialization...");
        
        const userId = localStorage.getItem('chatUserId') || 
                      'user-' + Math.random().toString(36).substring(7);
        localStorage.setItem('chatUserId', userId);
        
        console.log("Requesting token for user:", userId);
        const response = await fetch('https://fifteentv-a5b5844eddeb.herokuapp.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get token: ${await response.text()}`);
        }

        const { token } = await response.json();
        console.log("Token received successfully");
        
        // Initialize Stream Chat client
        chatClient = new StreamChat('g9m53zqntv69');
        
        // Connect user with full permissions
        await chatClient.connectUser(
            {
                id: userId,
                name: `User ${userId.substring(0, 6)}`,
                role: 'admin'
            },
            token
        );
        console.log("Connected to Stream chat with full permissions");

        // Initialize channel with full access
        channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
            name: 'Fifteen.tv Chat Room',
            created_by_id: userId,
            members: [userId]
        });

        // Watch channel
        await channel.watch();
        console.log("Channel watching started");

        // Add message listener
        channel.on('message.new', event => {
            const isOutgoing = event.user.id === chatClient.user.id;
            addMessage(event.message.text, isOutgoing, event.user.id, event.message.id);
        });

        // Clear any existing error messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const existingErrors = chatMessages.querySelectorAll('.system-message');
            existingErrors.forEach(error => error.remove());
        }

        // Load previous messages
        const messages = await channel.watch();
        messages.messages.forEach(message => {
            const isOutgoing = message.user.id === chatClient.user.id;
            addMessage(message.text, isOutgoing, message.user.id, message.id);
        });

        console.log("Chat initialization complete with full access");

    } catch (error) {
        console.error('Chat initialization error:', error);
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Clear existing error messages
            const existingErrors = chatMessages.querySelectorAll('.system-message');
            existingErrors.forEach(error => error.remove());
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'system-message';
            
            if (error.name === 'AbortError') {
                errorDiv.textContent = 'Connection timeout. Retrying...';
            } else if (error.message.includes('Too many requests')) {
                errorDiv.textContent = 'Too many connections. Retrying...';
            } else {
                errorDiv.textContent = 'Connection failed. Retrying...';
            }
            
            chatMessages.appendChild(errorDiv);
        }
        
        // Retry connection after delay
        console.log("Retrying connection in 5 seconds...");
        setTimeout(() => {
            console.log("Retrying connection now");
            initializeStreamChat();
        }, 5000);
    }
}

// Add this function to handle messages
function addMessage(text, isOutgoing = true, userId = null, messageId = null) {
    // Skip if we've already processed this message
    if (messageId && processedMessageIds.has(messageId)) {
        return;
    }
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Add message ID to processed set
    if (messageId) {
        processedMessageIds.add(messageId);
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-wrapper ${isOutgoing ? 'outgoing' : 'incoming'}`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${!isOutgoing ? `<div class="user-id">User ${userId ? userId.substring(0, 6) : 'Unknown'}</div>` : ''}
        <div class="message-bubble">
            <div class="message-text">${text}</div>
            <div class="message-timestamp">${timestamp}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add this function to periodically refresh chat
function startChatRefresh() {
    setInterval(async () => {
        if (channel) {
            try {
                const state = await channel.watch();
                const chatMessages = document.getElementById('chatMessages');
                
                // Only update if there are new messages
                const newMessages = state.messages.filter(msg => !processedMessageIds.has(msg.id));
                if (newMessages.length > 0) {
                    newMessages.forEach(message => {
                        const isOutgoing = message.user.id === chatClient.user.id;
                        addMessage(message.text, isOutgoing, message.user.id, message.id);
                    });
                }
            } catch (error) {
                if (!error.message.includes('Too many requests')) {
                    console.error('Error refreshing chat:', error);
                }
            }
        }
    }, 2000);
}

// 2. Update the server token endpoint
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

        // Generate token without explicit expiration
        const token = serverClient.createToken(userId);

        console.log("Token generated successfully");
        res.json({ token });
    } catch (error) {
        console.error("Token generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Update the style injection in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Add styles first
    const styleElement = document.createElement('style');
    styleElement.textContent = upcomingStyle + concludedStyle + chatStyles;
    document.head.appendChild(styleElement);

    // Then initialize chat
    setupChat();
    initializeStreamChat();
}); 