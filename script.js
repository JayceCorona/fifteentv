document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded");

    const grid = document.getElementById("schedule-grid");
    if (!grid) {
        console.error("Grid element not found");
        return;
    }

    console.log("Grid element found");

    // Add this at the top of your DOMContentLoaded event listener
    const video = document.getElementById('mainPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.getElementById('progress');

    // Set video source (replace with your video URL)
    video.src = 'path/to/your/video.mp4';

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    // Mute
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });

    // Volume
    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
    });

    // Time update
    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = `${percent}%`;
        currentTimeSpan.textContent = formatTime(video.currentTime);
    });

    // Video duration
    video.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(video.duration);
    });

    // Click on progress bar
    progressBar.addEventListener('click', (e) => {
        const pos = (e.pageX - progressBar.offsetLeft) / progressBar.offsetWidth;
        video.currentTime = pos * video.duration;
    });

    // Helper function to format time
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Function to display the next available session
    function displayNextSession() {
        // Keep existing slots and add new one
        const slots = document.querySelectorAll('.time-slot');
        if (slots.length >= 2) {
            // Remove oldest slot if we already have 2
            slots[0].remove();
        }

        // Set the start time to the next 15-minute interval from now
        const now = new Date();
        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        let startTime = new Date(now);
        startTime.setMinutes(minutes + remainder, 0, 0);

        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
        const countdownTarget = new Date(startTime.getTime() - 1 * 60 * 1000);
        const countdown = Math.floor((countdownTarget - now) / 1000);

        // Create new slot
        const slot = {
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            countdown: countdown > 0 ? countdown : 0,
            price: "Free",
            status: countdown > 0 ? "Available" : "Taken"
        };

        const block = document.createElement("div");
        block.className = "time-slot";
        block.dataset.status = slot.status;

        block.innerHTML = `
            <p>Time: ${slot.startTime} - ${slot.endTime}</p>
            <p>Price: ${slot.price}</p>
            <p>Status: <span>${slot.status}</span></p>
            <p>Countdown: <span class="countdown">${slot.countdown > 0 ? formatCountdown(slot.countdown) : "Auction Ended"}</span></p>
        `;

        grid.appendChild(block);

        if (slot.status === "Available") {
            startCountdown(block, slot.countdown);
        }
    }

    // Function to start and handle countdown for a given session
    function startCountdown(slotElement, timeLeft) {
        const countdownElem = slotElement.querySelector(".countdown");

        const timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                countdownElem.textContent = "Auction Ended";
                slotElement.dataset.status = "taken";
                slotElement.querySelector("span").textContent = "Taken";
                slotElement.style.backgroundColor = "#ffd7d7";

                // Add next session while keeping current one
                displayNextSession();
            } else {
                timeLeft--;
                countdownElem.textContent = formatCountdown(timeLeft);
            }
        }, 1000);
    }

    // Helper function to format countdown in mm:ss
    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Display the initial session when the page loads
    displayNextSession();

    // Add this to your existing JavaScript
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(`User: ${message}`);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    const videoPlayer = document.querySelector('.video-player');

    video.addEventListener('playing', () => {
        videoPlayer.classList.add('playing');
    });

    video.addEventListener('pause', () => {
        videoPlayer.classList.remove('playing');
    });

    video.addEventListener('ended', () => {
        videoPlayer.classList.remove('playing');
    });

    // Also handle when there's no source
    video.addEventListener('emptied', () => {
        videoPlayer.classList.remove('playing');
    });

    // Add this to your existing JavaScript to make the text glitch more dramatic occasionally
    const fonts = [
        'monospace',
        'VT323',
        'Press Start 2P',
        'Courier New',
        'Monaco',
        'Consolas',
        'OCR A Std',
        'Terminal'
    ];

    const glitchTexts = [
        'NO SIGNAL',
        'NO S1GNAL',
        'N0 SIGNAL',
        'NO SI6NAL',
        'NO_SIGNAL',
        'NOSIGNAL',
        'NO.SIGNAL',
        '[NO SIGNAL]'
    ];

    function intensifyGlitch() {
        const text = document.querySelector('.static-text');
        
        // Random font change
        text.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
        
        // Random text variation
        if (Math.random() < 0.3) { // 30% chance to change text
            text.textContent = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
        }
        
        // Random glitch effects
        const glitchEffect = Math.random();
        if (glitchEffect < 0.2) {
            // Major glitch
            text.style.transform = `translate(-50%, -50%) skew(${Math.random() * 10 - 5}deg)`;
            text.style.letterSpacing = `${Math.random() * 10 - 5}px`;
            text.style.opacity = Math.random() * 0.5 + 0.5;
            
            setTimeout(() => {
                text.style.transform = 'translate(-50%, -50%)';
                text.style.letterSpacing = 'normal';
                text.style.opacity = '1';
            }, 100);
        } else if (glitchEffect < 0.4) {
            // Flicker
            text.style.opacity = '0';
            setTimeout(() => {
                text.style.opacity = '1';
            }, 50);
        }
        
        // Occasionally split the text into RGB channels more dramatically
        if (Math.random() < 0.2) {
            text.style.textShadow = `
                ${-Math.random() * 10}px 0 #ff0000,
                ${Math.random() * 10}px ${Math.random() * 10}px #0000ff,
                ${Math.random() * 5}px ${-Math.random() * 5}px #00ff00
            `;
            
            setTimeout(() => {
                text.style.textShadow = '-2px 0 #ff0000, 2px 2px #0000ff';
            }, 150);
        }
    }

    // Add this to your head section to load the Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Run the glitch effect more frequently
    setInterval(intensifyGlitch, 1000);

    // Add random micro-glitches more frequently
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance of micro-glitch
            intensifyGlitch();
        }
    }, 100);
});
