document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded");

    // Stream Chat setup
    initializeStreamChat();

    // Video controls and other UI functionality
    setupVideoControls();
    setupScheduleGrid(); // Set up the grid
    enableDragScroll(document.getElementById('schedule-grid'));

    // Glitch effect
    createGlitchText();
    setInterval(intensifyGlitch, 1000);
    setupChatInterface();

    // Window resize listener for adjusting slots
    handleResize();
});

// Initialize Stream Chat client and channel
function initializeStreamChat() {
    const apiKey = 'g9m53zqntv69';  // Replace with your actual API Key from Stream
    const client = new StreamChat.StreamChat(apiKey);

    async function startChat() {
        await client.connectUser({ id: 'user-id', name: 'Test User' }, client.devToken('user-id'));
        const channel = client.channel('messaging', 'general', { name: 'General Chat' });
        await channel.watch();

        channel.on('message.new', (event) => {
            const chatBox = document.getElementById('chat-box');
            const newMessage = document.createElement('p');
            newMessage.textContent = `${event.user.name}: ${event.message.text}`;
            chatBox.appendChild(newMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        });

        document.getElementById('chat-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input');
            if (input.value.trim() !== "") {
                await channel.sendMessage({ text: input.value });
                input.value = '';
            }
        });
    }
    startChat();
}

// Video controls setup
function setupVideoControls() {
    const video = document.getElementById('mainPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.getElementById('progress');
    
    video.src = 'path/to/your/video.mp4';

    playPauseBtn.addEventListener('click', () => togglePlay(video, playPauseBtn));
    muteBtn.addEventListener('click', () => toggleMute(video, muteBtn));
    volumeSlider.addEventListener('input', (e) => video.volume = e.target.value);

    video.addEventListener('timeupdate', () => updateProgress(video, progress, currentTimeSpan));
    video.addEventListener('loadedmetadata', () => durationSpan.textContent = formatTime(video.duration));
    progressBar.addEventListener('click', (e) => seekVideo(e, video, progressBar));
}

// Schedule grid setup
function setupScheduleGrid() {
    const grid = document.getElementById("schedule-grid");
    if (!grid) {
        console.error("Grid element not found");
        return;
    }

    // Add initial time slots
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

// Function to calculate and display the next available session
function displayNextSession() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) {
        console.error("Error: #schedule-grid element not found.");
        return;
    }

    const now = new Date();
    const slots = grid.querySelectorAll('.time-slot');
    let startTime;

    if (slots.length === 0) {
        // First slot starts at the next 15-minute interval
        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        startTime = new Date(now);
        startTime.setMinutes(minutes + remainder, 0, 0);
    } else {
        // Get the end time of the last slot and add 15 minutes
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
}

// Helper functions
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

// Glitch Effect
function createGlitchText() {
    const text = document.querySelector('.static-text');
    if (!text) {
        console.error("Static text element for glitch effect not found.");
        return;
    }
    text.style.fontFamily = 'monospace';
    text.style.position = 'relative';
    text.style.overflow = 'hidden';
}

function intensifyGlitch() {
    const text = document.querySelector('.static-text');
    if (!text) return;

    text.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) skew(${Math.random() * 2 - 1}deg)`;
    text.style.opacity = Math.random() < 0.8 ? '1' : '0.8';
    text.style.letterSpacing = Math.random() < 0.5 ? '2px' : 'normal';

    setTimeout(() => {
        text.style.transform = 'translate(0, 0)'; // Reset transform
        text.style.opacity = '1';
        text.style.letterSpacing = 'normal';
    }, 100);
}

// Utility Functions for Video
function togglePlay(video, playPauseBtn) { /* ... */ }
function toggleMute(video, muteBtn) { /* ... */ }
function updateProgress(video, progress, currentTimeSpan) { /* ... */ }
function seekVideo(e, video, progressBar) { /* ... */ }
function formatTime(seconds) { /* ... */ }
function enableDragScroll(element) { /* ... */ }
function handleResize() { /* Resize logic for slots */ }
