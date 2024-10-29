// Add this script tag in your HTML <head> or before the closing </body> tag to load Stream Chat from CDN
// <script src="https://cdn.jsdelivr.net/npm/stream-chat@latest/dist/bundle.min.js"></script>

document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded");

    // Stream Chat setup
    initializeStreamChat();

    // Video controls and other UI functionality
    setupVideoControls();
    setupScheduleGrid();
    enableDragScroll(document.getElementById('schedule-grid'));

    // Other functionality
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
    displayNextSession();
    // Additional grid-related functionality can be placed here
}

// Play/Pause toggle
function togglePlay(video, playPauseBtn) {
    if (video.paused) {
        video.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        video.pause();
        playPauseBtn.textContent = 'Play';
    }
}

// Mute toggle
function toggleMute(video, muteBtn) {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
}

// Update video progress
function updateProgress(video, progress, currentTimeSpan) {
    const percent = (video.currentTime / video.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeSpan.textContent = formatTime(video.currentTime);
}

// Seek video
function seekVideo(e, video, progressBar) {
    const pos = (e.pageX - progressBar.offsetLeft) / progressBar.offsetWidth;
    video.currentTime = pos * video.duration;
}

// Helper function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Handle window resize events
function handleResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => adjustSlots(), 250);
    });
}

function adjustSlots() {
    // Function to adjust time slots on resize
}

// Placeholder for other functions (glitch text, drag scroll, etc.)
function createGlitchText() { /* ... */ }
function intensifyGlitch() { /* ... */ }
function setupChatInterface() { /* ... */ }

// Function to enable drag scroll
function enableDragScroll(element) {
    let isDown = false, startX, scrollLeft;
    element.addEventListener('mousedown', (e) => { /* ... */ });
    element.addEventListener('mousemove', (e) => { /* ... */ });
}
