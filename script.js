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
        grid.innerHTML = ""; // Clear the grid to show only one session

        // Set the start time to the next 15-minute interval from now
        const now = new Date();
        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        let startTime = new Date(now);
        startTime.setMinutes(minutes + remainder, 0, 0); // Next 15-minute segment

        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 1 * 60 * 1000); // 1 minute before start
        const countdown = Math.floor((countdownTarget - now) / 1000); // Countdown until 1 minute before start

        // Create a single session slot
        const slot = {
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            countdown: countdown > 0 ? countdown : 0,
            price: "Free",
            status: countdown > 0 ? "Available" : "Taken" // Set initial status based on countdown
        };

        console.log("Next session created:", slot);

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

        // Start the countdown for this session if it's available
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

                // Load the next session after a short delay
                setTimeout(displayNextSession, 1000);
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
});
