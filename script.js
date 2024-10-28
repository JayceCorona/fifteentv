document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("schedule-grid");
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0); // Start at 9:00 AM

    const now = new Date();
    const slots = [];

    // Generate 15-minute blocks from 9 AM to 5 PM
    while (startTime.getHours() < 17) { // Until 5 PM
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
        const timeBeforeSlot = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 mins before start

        // Calculate countdown until 15 minutes before slot start
        const status = now > timeBeforeSlot ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((timeBeforeSlot - now) / 1000) : 0;

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown
        });

        startTime.setTime(endTime.getTime());
    }

    // Sort slots so next available slot is at the top
    slots.sort((a, b) => a.countdown - b.countdown);

    // Render each slot in the grid
    slots.forEach(slot => {
        const block = document.createElement("div");
        block.className = "time-slot";
        block.dataset.status = slot.status;

        block.innerHTML = `
            <p>Time: ${slot.startTime} - ${slot.endTime}</p>
            <p>Price: $0.01</p>
            <p>Status: <span>${slot.status === "free" ? "Available" : "Taken"}</span></p>
            <p>Countdown: <span class="countdown">${slot.countdown > 0 ? formatCountdown(slot.countdown) : "Auction Ended"}</span></p>
        `;

        grid.appendChild(block);
    });

    // Start countdown timers
    function startCountdown() {
        const slots = document.querySelectorAll(".time-slot[data-status='free']");
        slots.forEach(slot => {
            const countdownElem = slot.querySelector(".countdown");
            let timeLeft = parseInt(slot.querySelector(".countdown").textContent.split(":").join("")) * 60 || 10 * 60;

            const timer = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    countdownElem.textContent = "Auction Ended";
                    slot.dataset.status = "taken";
                    slot.querySelector("span").textContent = "Taken";
                    slot.style.backgroundColor = "#ffd7d7"; // Change color to taken
                } else {
                    timeLeft--;
                    countdownElem.textContent = formatCountdown(timeLeft);
                }
            }, 1000);
        });
    }

    startCountdown();

    // Format seconds into MM:SS
    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});
