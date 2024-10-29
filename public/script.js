let chatClient;
let channel;

async function initializeStreamChat() {
    try {
        console.log('Initializing Stream Chat...');
        
        // Generate a random user ID if needed
        const userId = 'user-' + Math.random().toString(36).substring(7);
        console.log('Generated user ID:', userId);
        
        // Get token from your server
        console.log('Fetching token...');
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        
        const responseData = await response.json();
        console.log('Token received:', responseData);

        // Initialize Stream Chat client
        console.log('Initializing client...');
        try {
            chatClient = StreamChat.getInstance('g9m53zqntv69');
            console.log('Stream client created successfully');
        } catch (e) {
            console.error('Error creating Stream client:', e);
            throw e;
        }

        // Connect user
        console.log('Attempting to connect user...');
        try {
            await chatClient.connectUser(
                {
                    id: userId,
                    name: `User ${userId.slice(-4)}`,
                },
                responseData.token
            );
            console.log('User connected successfully');
        } catch (e) {
            console.error('Error connecting user:', e);
            throw e;
        }

        // Create or join a channel
        console.log('Creating channel...');
        try {
            channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
                name: 'Fifteen.tv Chat',
            });
            console.log('Channel created');
            
            await channel.watch();
            console.log('Channel watching');
        } catch (e) {
            console.error('Error with channel:', e);
            throw e;
        }

        // Add message listener
        channel.on('message.new', event => {
            console.log('New message received:', event.message);
            appendMessage(event.message);
        });

        console.log('Chat initialization completed successfully');
        return true;
    } catch (error) {
        console.error('Error in initializeStreamChat:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response
        });
        
        // If there's a response object, log it
        if (error.response) {
            try {
                const errorBody = await error.response.text();
                console.error('Error response body:', errorBody);
            } catch (e) {
                console.error('Could not read error response:', e);
            }
        }
        
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

    console.log('Appending message:', message); // Debug log

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    // Safely get user name
    const username = message.user?.name || 'Unknown User';
    
    // Format timestamp
    const timestamp = new Date(message.created_at).toLocaleTimeString();
    
    messageDiv.innerHTML = `
        <span class="username">${username}</span>
        <span class="timestamp">${timestamp}</span>
        <div class="text">${message.text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make sure this is in your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Script loaded");
    
    // Initialize Stream Chat first
    const chatInitialized = await initializeStreamChat();
    console.log('Chat initialization result:', chatInitialized);

    // Schedule initialization
    const scheduleGrid = document.getElementById('schedule-grid');
    if (scheduleGrid) {
        console.log('Setting up schedule grid');
        setupSchedule();
    }

    // Chat button handler
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    if (sendButton && messageInput) {
        console.log('Setting up chat handlers');
        
        sendButton.onclick = async function() {
            console.log('Send button clicked');
            
            if (!chatClient || !channel) {
                console.error('Chat not initialized properly');
                console.error('Chat client:', chatClient);
                console.error('Channel:', channel);
                return;
            }
            
            const text = messageInput.value.trim();
            if (!text) {
                console.log('No message text');
                return;
            }

            try {
                console.log('Sending message:', text);
                const response = await channel.sendMessage({
                    text: text
                });
                
                console.log('Message sent:', response);
                messageInput.value = '';
                
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
        };

        messageInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        };
    }
});

// Schedule setup function
function setupSchedule() {
    const grid = document.getElementById('schedule-grid');
    const currentTime = new Date();
    
    // Your existing schedule setup code here
    // ... (keep all your existing schedule code)
}
    // Check Stream Chat SDK
    if (typeof StreamChat === 'undefined') {
        console.error('StreamChat SDK not loaded!');
        return;
    }
    console.log('StreamChat SDK version:', StreamChat.version);
    
    // Initialize Stream Chat
    const chatInitialized = await initializeStreamChat();
    console.log('Chat initialization result:', chatInitialized);
    
    // Initialize schedule grid and navigation
    setupScheduleGrid();
  
    // Initialize glitch effect
    createGlitchText();
    setInterval(intensifyGlitch, 100); // Run glitch effect more frequently

    // Video player elements
    const video = document.getElementById('mainPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progress = document.getElementById('progress');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');

    // Video player functionality
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });

    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
    });

    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = `${percent}%`;
        currentTimeSpan.textContent = formatTime(video.currentTime);
    });

    video.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(video.duration);
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Schedule Grid Functions
    function setupScheduleGrid() {
        console.log("Setting up schedule grid");
        const grid = document.getElementById("schedule-grid");
        if (!grid) {
            console.error("Grid element not found");
            return;
        }

        // Clear existing content
        grid.innerHTML = '';

        // Add current and next session
        displayCurrentSession();
        displayNextSession();

        // Start countdown timer
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // Add navigation setup
        setupScheduleNavigation();

        // Add resize listener
        window.addEventListener('resize', () => {
            updateNavButtons();
        });
    }

    function displayCurrentSession() {
        const grid = document.getElementById('schedule-grid');
        const now = new Date();
        const minutes = now.getMinutes();
        const currentSlotStart = new Date(now);
        currentSlotStart.setMinutes(minutes - (minutes % 15), 0, 0);
        const currentSlotEnd = new Date(currentSlotStart.getTime() + 15 * 60000);

        // Check if previous session exists and mark it as concluded
        const previousSlot = grid.querySelector('.time-slot.current');
        if (previousSlot) {
            previousSlot.className = 'time-slot concluded';
            const countdownDiv = previousSlot.querySelector('.slot-countdown');
            countdownDiv.innerHTML = '<p class="concluded-text">Concluded</p>';
        }

        const slot = document.createElement('div');
        slot.className = 'time-slot current';
        slot.innerHTML = `
            <div class="slot-time">
                <p>Current: ${formatTimeString(currentSlotStart)} - ${formatTimeString(currentSlotEnd)}</p>
            </div>
            <div class="slot-info">
                <p>Status: Active</p>
                <p>Price: Free</p>
            </div>
            <div class="slot-countdown">
                <div class="live-indicator">
                    <div class="live-dot"></div>
                    <span>LIVE</span>
                </div>
            </div>
        `;

        grid.appendChild(slot);
    }

    function displayNextSession() {
        const grid = document.getElementById('schedule-grid');
        const now = new Date();
        const minutes = now.getMinutes();
        const currentSlotEnd = new Date(now);
        currentSlotEnd.setMinutes(minutes - (minutes % 15) + 15, 0, 0);
        const nextSlotEnd = new Date(currentSlotEnd.getTime() + 15 * 60000);

        const slot = document.createElement('div');
        slot.className = 'time-slot next';
        slot.innerHTML = `
            <div class="slot-time">
                <p>Next: ${formatTimeString(currentSlotEnd)} - ${formatTimeString(nextSlotEnd)}</p>
            </div>
            <div class="slot-info">
                <p>Status: Upcoming</p>
                <p>Price: Free</p>
            </div>
            <div class="slot-countdown">
                <p class="countdown" data-end="${currentSlotEnd.getTime()}">Loading...</p>
            </div>
        `;

        grid.appendChild(slot);
    }

    function updateCountdown() {
        const countdowns = document.querySelectorAll('.time-slot.next .countdown');
        const now = new Date().getTime();

        countdowns.forEach(countdown => {
            const endTime = parseInt(countdown.dataset.end);
            if (isNaN(endTime)) return;

            const countdownEndTime = endTime - 60000; // 60000ms = 1 minute
            const timeLeft = countdownEndTime - now;
            
            if (timeLeft <= 0) {
                countdown.textContent = 'Starting Soon...';
                addNextTimeSegment();
                return;
            }

            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        });

        checkSessionTransition();
    }

    function checkSessionTransition() {
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        if (minutes % 15 === 0 && seconds === 0) {
            transitionSessions();
        }
    }

    function transitionSessions() {
        const grid = document.getElementById('schedule-grid');
        
        // Mark current session as concluded
        const currentSlot = grid.querySelector('.time-slot.current');
        if (currentSlot) {
            currentSlot.className = 'time-slot concluded';
            const liveIndicator = currentSlot.querySelector('.slot-countdown');
            liveIndicator.innerHTML = '<p class="concluded-text">Concluded</p>';
        }

        // Move 'next' to 'current'
        const nextSlot = grid.querySelector('.time-slot.next');
        if (nextSlot) {
            nextSlot.className = 'time-slot current';
            const countdown = nextSlot.querySelector('.slot-countdown');
            countdown.innerHTML = `
                <div class="live-indicator">
                    <div class="live-dot"></div>
                    <span>LIVE</span>
                </div>
            `;
        }

        // Move 'upcoming' to 'next' if it exists
        const upcomingSlot = grid.querySelector('.time-slot.upcoming');
        if (upcomingSlot) {
            upcomingSlot.className = 'time-slot next';
            // Update the countdown data
            const now = new Date();
            const nextEndTime = new Date(now);
            nextEndTime.setMinutes(now.getMinutes() + 15 - (now.getMinutes() % 15), 0, 0);
            const countdown = upcomingSlot.querySelector('.slot-countdown');
            countdown.innerHTML = `<p class="countdown" data-end="${nextEndTime.getTime()}">Loading...</p>`;
        }

        // Add new upcoming slot
        addNextTimeSegment();
    }

    function addNextTimeSegment() {
        const grid = document.getElementById('schedule-grid');
        const slots = grid.querySelectorAll('.time-slot');
        const lastSlot = slots[slots.length - 1];
        
        if (!lastSlot) return;

        const lastTimeText = lastSlot.querySelector('.slot-time p').textContent;
        const endTimeStr = lastTimeText.split(' - ')[1];
        const endTime = parseTimeString(endTimeStr);
        const nextSegmentEnd = new Date(endTime.getTime() + 15 * 60000);

        const newSlot = document.createElement('div');
        newSlot.className = 'time-slot upcoming';
        newSlot.innerHTML = `
            <div class="slot-time">
                <p>Upcoming: ${formatTimeString(endTime)} - ${formatTimeString(nextSegmentEnd)}</p>
            </div>
            <div class="slot-info">
                <p>Status: Scheduled</p>
                <p>Price: Free</p>
            </div>
            <div class="slot-countdown">
                <p>Scheduled</p>
            </div>
        `;

        grid.appendChild(newSlot);
    }

    function formatTimeString(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
    }

    // Add these functions at the top level of your script
    function createGlitchText() {
        const staticText = document.querySelector('.static-text');
        if (!staticText) return;
        
        // Split text into individual characters
        const text = staticText.textContent;
        staticText.textContent = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            staticText.appendChild(span);
        });
    }

    function intensifyGlitch() {
        const text = document.querySelector('.static-text');
        if (!text) return;

        text.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) skew(${Math.random() * 2 - 1}deg)`;
        text.style.opacity = Math.random() < 0.8 ? '1' : '0.8';
        text.style.letterSpacing = Math.random() < 0.5 ? '2px' : 'normal';

        setTimeout(() => {
            text.style.transform = 'translate(0, 0)';
            text.style.opacity = '1';
            text.style.letterSpacing = 'normal';
        }, 100);
    }

    // Add some CSS for the upcoming slot
    const style = document.createElement('style');
    style.textContent = `
        .time-slot.upcoming {
            border-left: 4px solid #9E9E9E;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

    // Add these functions to your script.js
    function setupScheduleNavigation() {
        const scheduleSection = document.querySelector('.schedule-section');
        const grid = document.getElementById('schedule-grid');
        
        // Create navigation buttons if they don't exist
        if (!document.querySelector('.schedule-nav')) {
            const prevButton = document.createElement('button');
            const nextButton = document.createElement('button');
            
            prevButton.className = 'schedule-nav prev';
            nextButton.className = 'schedule-nav next';
            prevButton.innerHTML = '&#8249;';
            nextButton.innerHTML = '&#8250;';
            
            scheduleSection.appendChild(prevButton);
            scheduleSection.appendChild(nextButton);

            // Add scroll functionality
            let scrollPosition = 0;
            const scrollAmount = 200;

            prevButton.addEventListener('click', () => {
                scrollPosition = Math.max(scrollPosition - scrollAmount, 0);
                grid.style.transform = `translateX(-${scrollPosition}px)`;
                updateNavButtons();
            });

            nextButton.addEventListener('click', () => {
                const maxScroll = grid.scrollWidth - scheduleSection.clientWidth + 40; // Add padding
                scrollPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
                grid.style.transform = `translateX(-${scrollPosition}px)`;
                updateNavButtons();
            });
        }

        // Check if navigation is needed
        updateNavButtons();
    }

    function updateNavButtons() {
        const scheduleSection = document.querySelector('.schedule-section');
        const grid = document.getElementById('schedule-grid');
        const prevButton = document.querySelector('.schedule-nav.prev');
        const nextButton = document.querySelector('.schedule-nav.next');
        
        if (!prevButton || !nextButton) return;

        const totalWidth = grid.scrollWidth;
        const visibleWidth = scheduleSection.clientWidth;
        const scrollPosition = Math.abs(parseInt(grid.style.transform?.split('translateX(')[1]) || 0);

        // Show/hide navigation buttons based on scroll position and content width
        if (totalWidth > visibleWidth) {
            prevButton.classList.toggle('visible', scrollPosition > 0);
            nextButton.classList.toggle('visible', scrollPosition < totalWidth - visibleWidth);
        } else {
            prevButton.classList.remove('visible');
            nextButton.classList.remove('visible');
        }
    }

    // Update the interval for checking transitions
    setInterval(() => {
        updateCountdown();
    }, 1000);

    // Add this near the top of your DOMContentLoaded event
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    if (sendButton && messageInput) {
        console.log('Found chat elements:', { sendButton, messageInput });
        
        // Direct click handler
        sendButton.onclick = async function() {
            console.log('Send button clicked');
            
            if (!chatClient || !channel) {
                console.error('Chat not initialized properly');
                console.error('Chat client:', chatClient);
                console.error('Channel:', channel);
                return;
            }
            
            const text = messageInput.value.trim();
            if (!text) {
                console.log('No message text');
                return;
            }

            try {
                console.log('Attempting to send message:', text);
                const response = await channel.sendMessage({
                    text: text
                });
                
                console.log('Message sent:', response);
                messageInput.value = '';
                
                appendMessage({
                    text: text,
                    user: {
                        name: `User ${chatClient.user.id.slice(-4)}`
                    },
                    created_at: new Date()
                });
            } catch (error) {
                console.error('Error sending message:', error);
                console.error('Chat client state:', chatClient?.state);
                console.error('Channel state:', channel?.state);
            }
        };

        // Enter key handler
        messageInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                console.log('Enter pressed');
                sendButton.click();
            }
        };
    } else {
        console.error('Chat elements not found');
    }
