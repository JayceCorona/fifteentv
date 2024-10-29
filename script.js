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
    displayNextSession(); // Call the function to display a session
}

// Function to calculate and display the next available session
function displayNextSession() {
    console.log("Display next session called");

    const grid = document.getElementById('schedule-grid');
    if (!grid) {
        console.error("Error: #schedule-grid element not found.");
        return;
    }

    const now = new Date();
    let startTime;

    // Calculate start time for the next session based on existing slots
    const slots = grid.querySelectorAll('.time-slot');
    if (slots.length > 0) {
        const lastSlotTimeText = slots[slots.length - 1].querySelector('.slot-time p').textContent;
        const endTimeStr = lastSlotTimeText.split(' - ')[1];
        const [hours, minutes] = endTimeStr.split(':').map(num => parseInt(num));

        startTime = new Date(now);
        startTime.setHours(hours);
        startTime.setMinutes(minutes);
        startTime.setSeconds(0);
    } else {
        // Set to the next 15-minute interval if there are no existing slots
        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        startTime = new Date(now);
        startTime.setMinutes(minutes + remainder, 0, 0);
    }

    const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

    const slot = {
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: "Free",
        status: "Available"
    };

    // Create slot element
    const block = document.createElement("div");
    block.className = "time-slot";
    block.dataset.status = slot.status;

    block.innerHTML = `
        <div class="slot-time">
            <p>Time: ${slot.startTime} - ${slot.endTime}</p>
        </div>
        <div class="slot-info">
            <p>Price: ${slot.price}</p>
            <p>Status: <span>${slot.status}</span></p>
        </div>
    `;

    grid.appendChild(block); // Add new slot to the grid
    console.log("New time slot added:", slot);
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
