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
    function calculateOptimalSlots() {
        const section = document.querySelector('.schedule-section');
        const sectionWidth = section.offsetWidth;
        const slotWidth = 200; // Base slot width
        const gap = 15; // Gap between slots
        return Math.floor((sectionWidth + gap) / (slotWidth + gap));
    }

    function displayNextSession() {
        const maxVisibleSlots = calculateOptimalSlots();
        const slots = document.querySelectorAll('.time-slot');
        
        // Remove excess slots
        while (slots.length >= maxVisibleSlots) {
            slots[0].remove();
        }

        const now = new Date();
        let startTime;
        
        if (slots.length > 0) {
            // Parse the last slot's end time and add 15 minutes
            const lastSlotTimeText = slots[slots.length - 1].querySelector('.slot-time p').textContent;
            const endTimeStr = lastSlotTimeText.split(' - ')[1];
            const [hours, minutes] = endTimeStr.split(':').map(num => parseInt(num));
            
            startTime = new Date(now);
            startTime.setHours(hours);
            startTime.setMinutes(minutes);
            startTime.setSeconds(0);
            startTime.setMilliseconds(0);
        } else {
            // If no slots exist, use next 15-minute interval
            const minutes = now.getMinutes();
            const remainder = 15 - (minutes % 15);
            startTime = new Date(now);
            startTime.setMinutes(minutes + remainder, 0, 0);
        }

        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
        const countdownTarget = new Date(startTime.getTime() - 1 * 60 * 1000);
        const countdown = Math.floor((countdownTarget - now) / 1000);

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
            <div class="slot-time">
                <p title="Time: ${slot.startTime} - ${slot.endTime}">
                    Time: ${slot.startTime} - ${slot.endTime}
                </p>
            </div>
            <div class="slot-info">
                <p title="Price: ${slot.price}">Price: ${slot.price}</p>
                <p title="Status: ${slot.status}">Status: <span>${slot.status}</span></p>
            </div>
            <div class="slot-countdown">
                <p title="Countdown: ${slot.countdown > 0 ? formatCountdown(slot.countdown) : 'Auction Ended'}">
                    Countdown: <span class="countdown">
                        ${slot.countdown > 0 ? formatCountdown(slot.countdown) : "Auction Ended"}
                    </span>
                </p>
            </div>
        `;

        const grid = document.getElementById('schedule-grid');
        grid.appendChild(block);

        // Smooth scroll to latest slot
        const gridWidth = grid.scrollWidth;
        const containerWidth = grid.parentElement.offsetWidth;
        const maxScroll = gridWidth - containerWidth;
        
        grid.scrollTo({
            left: maxScroll,
            behavior: 'smooth'
        });

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

                // Add next session after a short delay
                setTimeout(() => {
                    displayNextSession();
                }, 1000);
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

    // Add touch/mouse drag scrolling
    function enableDragScroll(element) {
        let isDown = false;
        let startX;
        let scrollLeft;

        element.addEventListener('mousedown', (e) => {
            isDown = true;
            element.style.cursor = 'grabbing';
            startX = e.pageX - element.offsetLeft;
            scrollLeft = element.scrollLeft;
        });

        element.addEventListener('mouseleave', () => {
            isDown = false;
            element.style.cursor = 'grab';
        });

        element.addEventListener('mouseup', () => {
            isDown = false;
            element.style.cursor = 'grab';
        });

        element.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - element.offsetLeft;
            const walk = (x - startX) * 2;
            element.scrollLeft = scrollLeft - walk;
        });
    }

    // Initialize drag scroll
    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.getElementById('schedule-grid');
        enableDragScroll(grid);
        grid.style.cursor = 'grab';
    });

    // Add this function to create individual letter spans with random styles
    function createGlitchText() {
        const text = document.querySelector('.static-text');
        const letters = text.textContent.split('');
        text.setAttribute('data-text', text.textContent); // For pseudo-elements
        text.textContent = ''; // Clear original text

        const fonts = [
            'monospace',
            'VT323',
            'Press Start 2P',
            'Courier New',
            'Monaco',
            'Consolas'
        ];

        letters.forEach(letter => {
            const span = document.createElement('span');
            span.textContent = letter;
            text.appendChild(span);
            
            // Random styling function
            function randomizeStyle() {
                const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
                const baseSize = 48; // Base font size
                const sizeVariation = Math.random() * 8 - 4; // ±4px variation

                span.style.fontFamily = randomFont;
                span.style.fontSize = `${baseSize + sizeVariation}px`;
                span.style.transform = `translateY(${Math.random() * 2 - 1}px)`;
                
                // Occasional vertical flip
                if (Math.random() < 0.05) {
                    span.style.transform += ' scaleY(-1)';
                }
            }

            // Initial randomization
            randomizeStyle();

            // Periodically update styles
            setInterval(randomizeStyle, Math.random() * 1000 + 500);
        });
    }

    // Call this after the DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        createGlitchText();
    });

    // Update the text content periodically with glitch variations
    setInterval(() => {
        const text = document.querySelector('.static-text');
        if (Math.random() < 0.1) { // 10% chance to change text
            const variations = [
                'NO SIGNAL',
                'NO S1GNAL',
                'N0 SIGNAL',
                'NO SI6NAL',
                'NO_SIGNAL',
                'NOSIGNAL',
                '[NO SIGNAL]'
            ];
            const newText = variations[Math.floor(Math.random() * variations.length)];
            text.setAttribute('data-text', newText);
            
            // Update individual letters
            const spans = text.querySelectorAll('span');
            const letters = newText.split('');
            letters.forEach((letter, i) => {
                if (spans[i]) {
                    spans[i].textContent = letter;
                }
            });
        }
    }, 1000);

    // Add resize handler to adjust slots when window size changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const slots = document.querySelectorAll('.time-slot');
            const maxSlots = calculateOptimalSlots();
            
            // Remove excess slots if window gets smaller
            while (slots.length > maxSlots) {
                slots[0].remove();
            }
        }, 250);
    });

    // Initialize with correct number of slots
    document.addEventListener('DOMContentLoaded', () => {
        // Your existing initialization code...
        
        // Initial slot calculation
        const maxSlots = calculateOptimalSlots();
        for (let i = 0; i < maxSlots - 1; i++) {
            displayNextSession();
        }
    });

    // Add this to your existing JavaScript
    const socket = io();
    let username = null;

    // Join chat
    function joinChat() {
        username = prompt('Enter your username:');
        if (username) {
            socket.emit('join', username);
        }
    }

    // Send message
    function sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (message && username) {
            socket.emit('chatMessage', message);
            messageInput.value = '';
        }
    }

    // Handle received messages
    socket.on('message', (message) => {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <span class="username">${message.username}</span>
            <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
            <div class="text">${message.text}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Handle user events
    socket.on('userJoined', (username) => {
        addSystemMessage(`${username} joined the chat`);
    });

    socket.on('userLeft', (username) => {
        addSystemMessage(`${username} left the chat`);
    });

    function addSystemMessage(text) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Initialize chat
    document.addEventListener('DOMContentLoaded', () => {
        joinChat();
        
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    });

    function updateTimeSlots() {
        const now = new Date();
        slots.forEach((slot, index) => {
            const timeRemaining = Math.max(0, (slot.startTime - now) / 1000);
            
            if (timeRemaining <= 0) {
                // Remove the expired slot
                slots.splice(index, 1);
                // Add a new slot at the end
                const lastSlot = slots[slots.length - 1];
                const newSlotTime = new Date(lastSlot.startTime.getTime() + 15 * 60 * 1000); // 15 minutes after the last slot
                slots.push({
                    startTime: newSlotTime,
                    available: true
                });
                // Regenerate all slots
                generateTimeSlots();
            } else {
                // Update existing slot countdown
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = Math.floor(timeRemaining % 60);
                const countdownElement = document.querySelector(`#slot-${index} .countdown`);
                if (countdownElement) {
                    countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        });
    }
});
