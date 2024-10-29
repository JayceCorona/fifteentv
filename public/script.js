document.addEventListener('DOMContentLoaded', function() {
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

    // Schedule grid functionality
    function addTimeSlot() {
        const grid = document.getElementById('schedule-grid');
        const now = new Date();
        const endTime = new Date(now.getTime() + 15 * 60000);

        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerHTML = `
            <div class="slot-time">
                <p>Time: ${now.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}</p>
            </div>
            <div class="slot-info">
                <p>Status: Available</p>
                <p>Price: Free</p>
            </div>
        `;

        grid.appendChild(slot);
    }

    // Add initial time slots
    for (let i = 0; i < 5; i++) {
        addTimeSlot();
    }
}); 