const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-section {
        width: 300px;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #f8f9fa;
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .system-message {
        text-align: center;
        padding: 8px;
        margin: 8px;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .system-message.error {
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
    }

    .system-message.success {
        color: #155724;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
    }
`;

let chatClient;
let channel;
let processedMessageIds = new Set();

document.addEventListener('DOMContentLoaded', function() {
    document.head.appendChild(chatStyles);
    
    setupScheduleGrid();
    createGlitchText();
    // ... all other existing time slot initializations ...

    setupChat();
    initializeStreamChat();
});

async function initializeStreamChat() {
    try {
        const userId = localStorage.getItem('chatUserId') || 
                      'user-' + Math.random().toString(36).substring(7);
        localStorage.setItem('chatUserId', userId);

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
        
        chatClient = new StreamChat('g9m53zqntv69');
        await chatClient.connectUser(
            {
                id: userId,
                name: `User ${userId.substring(0, 6)}`,
            },
            token
        );

        channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
            name: 'Fifteen.tv Chat Room'
        });

        await channel.watch();

        channel.on('message.new', event => {
            if (!processedMessageIds.has(event.message.id)) {
                processedMessageIds.add(event.message.id);
                const isOutgoing = event.user.id === chatClient.user.id;
                addMessage(event.message.text, isOutgoing, event.user.id, event.message.id);
            }
        });

    } catch (error) {
        console.error('Chat initialization error:', error);
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'system-message error';
            errorDiv.textContent = 'Connection failed. Retrying...';
            chatMessages.appendChild(errorDiv);
        }
        setTimeout(() => initializeStreamChat(), 5000);
    }
}

// 3. Move style injection to a separate function
function injectChatStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = chatStyles;
    document.head.appendChild(styleElement);
}

document.addEventListener('DOMContentLoaded', function() {
    injectChatStyles(); // Add styles first
    setupChat();
    
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
    startChatRefresh();
    console.log("Script loaded");

    // Make sure this line is here and not commented out
    setupScheduleGrid();

    // Initialize schedule grid and navigation
    setupScheduleGrid();

    // Initialize glitch effect
    createGlitchText();
    setInterval(intensifyGlitch, 100);

    // Video player elements
    const video = document.getElementById('mainPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progress = document.getElementById('progress');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');

    // Video player functionality
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPauseBtn.textContent = 'Pause';
            } else {
                video.pause();
                playPauseBtn.textContent = 'Play';
            }
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            video.volume = e.target.value;
        });
    }

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

    function formatTimeString(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
    }

    function checkSessionTransition() {
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        if (minutes % 15 === 0 && seconds === 0) {
            transitionSlots();
        }
    }

    function transitionSlots() {
        const grid = document.getElementById('schedule-grid');
        if (!grid) return;

        // Clear all existing slots
        grid.innerHTML = '';

        // Create current slot
        const now = new Date();
        const currentSlotStart = new Date(now);
        currentSlotStart.setMinutes(now.getMinutes() - (now.getMinutes() % 15), 0, 0);
        const currentSlotEnd = new Date(currentSlotStart.getTime() + 15 * 60000);

        const currentSlot = document.createElement('div');
        currentSlot.className = 'time-slot current';
        currentSlot.innerHTML = `
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
        grid.appendChild(currentSlot);

        // Create next slot
        const nextSlotStart = currentSlotEnd;
        const nextSlotEnd = new Date(nextSlotStart.getTime() + 15 * 60000);

        const nextSlot = document.createElement('div');
        nextSlot.className = 'time-slot next';
        nextSlot.innerHTML = `
            <div class="slot-time">
                <p>Next: ${formatTimeString(nextSlotStart)} - ${formatTimeString(nextSlotEnd)}</p>
            </div>
            <div class="slot-info">
                <p>Status: Upcoming</p>
                <p>Price: Free</p>
            </div>
            <div class="slot-countdown">
                <p class="countdown" data-end="${nextSlotStart.getTime()}">Loading...</p>
            </div>
        `;
        grid.appendChild(nextSlot);
    }

    function refreshScheduleGrid() {
        const grid = document.getElementById('schedule-grid');
        grid.innerHTML = ''; // Clear existing slots
        
        displayCurrentSession();
        displayNextSession();
        
        // Reset and update navigation
        grid.style.transform = 'translateX(0)';
        setupScheduleNavigation();
    }

    function addNextTimeSegment() {
        const grid = document.getElementById('schedule-grid');
        const nextSlot = grid.querySelector('.time-slot.next');
        if (!nextSlot) return;

        const nextSlotTimeText = nextSlot.querySelector('.slot-time p').textContent;
        const nextSlotEndTime = nextSlotTimeText.split(' - ')[1];
        const endTime = parseTimeString(nextSlotEndTime);
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

    function parseTimeString(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        const date = new Date();
        date.setHours(hours, parseInt(minutes), 0, 0);
        return date;
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
    const upcomingStyle = document.createElement('style');
    upcomingStyle.textContent = `
        .time-slot.upcoming {
            border-left: 4px solid #9E9E9E;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

    // Update the CSS for concluded slots
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);

    // Add this CSS for chat messages
    const chatStyles = document.createElement('style');
    chatStyles.textContent = `
        .chat-section {
            width: 300px;
            border-left: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
            background: #f8f9fa;
        }

        .chat-header {
            padding: 15px;
            background: #343a40;
            color: white;
            border-bottom: 1px solid #e0e0e0;
            font-weight: bold;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #f8f9fa;
        }

        .message-wrapper {
            display: flex;
            flex-direction: column;
            max-width: 80%;
        }

        .message-wrapper.outgoing {
            align-self: flex-end;
        }

        .message-wrapper.incoming {
            align-self: flex-start;
        }

        .user-id {
            font-size: 0.75em;
            color: #666;
            margin-bottom: 4px;
            margin-left: 12px;
        }

        .message-bubble {
            padding: 10px 14px;
            border-radius: 18px;
            position: relative;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .outgoing .message-bubble {
            background: linear-gradient(135deg, #00B2FF, #006AFF);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .incoming .message-bubble {
            background: white;
            color: #333;
            border-bottom-left-radius: 4px;
            border: 1px solid #e0e0e0;
        }

        .message-text {
            margin-bottom: 4px;
            word-wrap: break-word;
            font-size: 0.95em;
            line-height: 1.4;
        }

        .message-timestamp {
            font-size: 0.7em;
            opacity: 0.8;
            margin-top: 4px;
            text-align: right;
        }

        .outgoing-bubble .message-timestamp {
            color: rgba(255, 255, 255, 0.9);
        }

        .incoming-bubble .message-timestamp {
            color: #6c757d;
        }

        .chat-input-container {
            padding: 15px;
            background: white;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }

        .chat-input-container input {
            flex: 1;
            padding: 10px 16px;
            border: 1px solid #ced4da;
            border-radius: 24px;
            outline: none;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        .chat-input-container input:focus {
            border-color: #006AFF;
            box-shadow: 0 0 0 2px rgba(0,106,255,0.1);
        }

        .chat-input-container button {
            padding: 8px 20px;
            background: #006AFF;
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }

        .chat-input-container button:hover {
            background: #0056CC;
            transform: translateY(-1px);
        }

        .chat-input-container button:active {
            transform: translateY(0);
        }

        .system-message {
            text-align: center;
            color: #6c757d;
            background-color: rgba(0, 0, 0, 0.05);
            padding: 8px;
            margin: 8px;
            border-radius: 8px;
            font-size: 0.9em;
        }
    `;
    document.head.appendChild(chatStyles);

    // Add cleanup on page unload
    window.addEventListener('beforeunload', async () => {
        if (chatClient) {
            try {
                await chatClient.disconnectUser();
            } catch (error) {
                console.error('Error disconnecting user:', error);
            }
        }
    });
}); 