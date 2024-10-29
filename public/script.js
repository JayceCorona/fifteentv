let chatClient;
let channel;

async function initializeStreamChat() {
    try {
        console.log('Initializing Stream Chat...');
        
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
        console.log('Token received:', token);

        chatClient = StreamChat.getInstance('g9m53zqntv69');
        await chatClient.connectUser(
            {
                id: userId,
                name: `User ${userId.slice(-4)}`,
            },
            token
        );

        channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
            name: 'Fifteen.tv Chat',
        });
        
        await channel.watch();
        
        return true;
    } catch (error) {
        console.error('Error in chat initialization:', error);
        return false;
    }
}

function setupMessageHandlers() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    console.log('Setting up message handlers:', { messageInput, sendButton });

    if (!messageInput || !sendButton) {
        console.error('Chat input elements not found');
        return;
    }

    if (!channel) {
        console.error('Channel not initialized');
        return;
    }

    async function sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const text = messageInput.value.trim();
        
        if (text && channel) {
            try {
                console.log('Attempting to send message:', text);
                
                // Send the message
                const response = await channel.sendMessage({
                    text: text,
                });
                
                console.log('Message sent response:', response);
                
                // Clear input after successful send
                messageInput.value = '';
                
                // Manually append the message (in case the event listener misses it)
                appendMessage({
                    text: text,
                    user: {
                        name: `User ${chatClient.user.id.slice(-4)}`
                    },
                    created_at: new Date()
                });
                
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }

    // Remove old event listeners if any
    sendButton.removeEventListener('click', sendMessage);
    messageInput.removeEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Add new event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    console.log('Message handlers set up successfully');
}

function appendMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <span class="username">${message.user.name}</span>
        <span class="timestamp">${new Date(message.created_at).toLocaleTimeString()}</span>
        <div class="text">${message.text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log("Script loaded");
    
    // Initialize Stream Chat
    const chatInitialized = await initializeStreamChat();
    console.log('Chat initialization result:', chatInitialized);

    // Schedule setup
    const scheduleGrid = document.getElementById('schedule-grid');
    if (scheduleGrid) {
        console.log('Setting up schedule grid');
        
        // Generate time slots
        const slots = [];
        const currentTime = new Date();
        currentTime.setMinutes(0, 0, 0); // Round to current hour

        for (let i = 0; i < 24; i++) {
            const slotTime = new Date(currentTime);
            slotTime.setHours(currentTime.getHours() + i);
            
            slots.push({
                time: slotTime,
                streamer: `Streamer ${i + 1}`,
                title: `Stream Title ${i + 1}`
            });
        }

        // Create and append time slots
        slots.forEach((slot, index) => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
            const time = slot.time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            timeSlot.innerHTML = `
                <p class="time">${time}</p>
                <p class="streamer">${slot.streamer}</p>
                <p class="title">${slot.title}</p>
                <div class="live-indicator">
                    <div class="live-dot"></div>
                    <p class="countdown"></p>
                </div>
            `;

            scheduleGrid.appendChild(timeSlot);
        });
 
        // Setup navigation
        setupScheduleNavigation();
    }

    // Chat button handler
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    if (sendButton && messageInput) {
        console.log('Found chat input elements');
        setupMessageHandlers();
    }
}); 