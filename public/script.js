let chatClient;
let channel;

// Simple chat functionality
function setupChat() {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');

    if (sendButton && messageInput && chatMessages) {
        function addMessage(text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message outgoing';
            messageDiv.innerHTML = `
                <div class="text">${text}</div>
                <div class="timestamp">${new Date().toLocaleTimeString()}</div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function handleSend() {
            const text = messageInput.value.trim();
            if (text) {
                addMessage(text);
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

document.addEventListener('DOMContentLoaded', async function() {
    console.log("Script loaded");

    // Add this line
    setupChat();

    // Make sure this line is here and not commented out
    setupScheduleGrid();

    // Initialize Stream Chat
    await initializeStreamChat();

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

        // Find current and next slots
        const currentSlot = grid.querySelector('.time-slot.current');
        const nextSlot = grid.querySelector('.time-slot.next');

        if (currentSlot) {
            // Update current slot to concluded
            currentSlot.className = 'time-slot concluded';
            const liveIndicator = currentSlot.querySelector('.slot-countdown');
            if (liveIndicator) {
                liveIndicator.innerHTML = '<p class="concluded-text">Concluded</p>';
            }
            currentSlot.style.opacity = '0.6';
        }

        if (nextSlot) {
            // Update next slot to current/live
            nextSlot.className = 'time-slot current';
            const countdown = nextSlot.querySelector('.slot-countdown');
            if (countdown) {
                countdown.innerHTML = `
                    <div class="live-indicator">
                        <div class="live-dot"></div>
                        <span>LIVE</span>
                    </div>
                `;
            }

            // Get the end time of the now-current slot
            const slotTimeText = nextSlot.querySelector('.slot-time p').textContent;
            const endTimeStr = slotTimeText.split(' - ')[1];
            const endTime = parseTimeString(endTimeStr);
            
            // Create new next slot for the following 15-minute period
            const newSlotEnd = new Date(endTime.getTime() + 15 * 60000);
            
            const newSlot = document.createElement('div');
            newSlot.className = 'time-slot next';
            newSlot.innerHTML = `
                <div class="slot-time">
                    <p>Next: ${formatTimeString(endTime)} - ${formatTimeString(newSlotEnd)}</p>
                </div>
                <div class="slot-info">
                    <p>Status: Upcoming</p>
                    <p>Price: Free</p>
                </div>
                <div class="slot-countdown">
                    <p class="countdown" data-end="${endTime.getTime()}">Loading...</p>
                </div>
            `;

            grid.appendChild(newSlot);
        }
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
}); 