document.addEventListener('DOMContentLoaded', function() {
    console.log("Script loaded");

    // Initialize schedule grid first
    setupScheduleGrid();

    // Socket.io setup
    const socket = io();
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // Video player elements
    const video = document.getElementById('mainPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progress = document.getElementById('progress');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');

    // Chat functionality
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chat message', message);
            messageInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    socket.on('chat message', (msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <span class="username">User ${msg.userId.slice(0, 4)}</span>
            <span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
            <div class="text">${msg.text}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

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
        console.log("Grid element found");

        // Clear existing content
        grid.innerHTML = '';

        // Style the grid container
        grid.style.display = 'flex';
        grid.style.gap = '10px';
        grid.style.padding = '20px';
        grid.style.overflowX = 'auto';
        grid.style.scrollBehavior = 'smooth';

        // Add initial time slots
        console.log("Adding initial time slots");
        for (let i = 0; i < 5; i++) {
            displayNextSession();
        }

        // Add navigation buttons
        const scheduleSection = document.querySelector('.schedule-section');
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
            const maxScroll = grid.scrollWidth - grid.clientWidth;
            scrollPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
            grid.style.transform = `translateX(-${scrollPosition}px)`;
            updateNavButtons();
        });

        function updateNavButtons() {
            prevButton.classList.toggle('hidden', scrollPosition === 0);
            nextButton.classList.toggle('hidden', 
                scrollPosition >= grid.scrollWidth - grid.clientWidth);
        }

        // Initial button state
        updateNavButtons();
    }

    function displayNextSession() {
        console.log("Displaying next session");
        const grid = document.getElementById('schedule-grid');
        if (!grid) {
            console.error("Error: #schedule-grid element not found.");
            return;
        }

        const now = new Date();
        const slots = grid.querySelectorAll('.time-slot');
        let startTime;

        if (slots.length === 0) {
            const minutes = now.getMinutes();
            const remainder = 15 - (minutes % 15);
            startTime = new Date(now);
            startTime.setMinutes(minutes + remainder, 0, 0);
        } else {
            const lastSlot = slots[slots.length - 1];
            const lastTimeText = lastSlot.querySelector('.slot-time p').textContent;
            const endTimeStr = lastTimeText.split(' - ')[1];
            startTime = parseTimeString(endTimeStr);
        }

        const endTime = new Date(startTime.getTime() + 15 * 60000);

        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerHTML = `
            <div class="slot-time">
                <p>Time: ${formatTimeString(startTime)} - ${formatTimeString(endTime)}</p>
            </div>
            <div class="slot-info">
                <p>Status: Available</p>
                <p>Price: Free</p>
            </div>
            <div class="slot-countdown">
                <p class="countdown">Book Now</p>
            </div>
        `;

        grid.appendChild(slot);
        console.log("Slot added to grid");
    }

    function parseTimeString(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function formatTimeString(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
    }
}); 