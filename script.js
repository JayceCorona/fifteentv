document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("schedule-grid");

    // Helper function to get the current time in CST
    function getCSTDate() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC
        const cstOffset = -6; // CST is UTC-6
        return new Date(utc + (3600000 * cstOffset));
    }

    const nowCST = getCSTDate();

    // Calculate the next 15-minute interval in CST
    const startTime = new Date(nowCST);
    const minutes = startTime.getMinutes();
    const remainder = 15 - (minutes % 15);
    startTime.setMinutes(minutes + remainder, 0, 0); // Set to nearest future 15-minute interval

    const slots = [];

    // Generate 15-minute blocks from the calculated CST start time until midnight CST
    while (startTime.getHours() < 24) { // Only show slots until midnight
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before start

        // Determine initial price and status, with countdown until 15 minutes before start
        const status = nowCST > countdownTarget ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((countdownTarget - nowCST) / 1000) : 0;

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: "Free" // Initial price is "Free" until bidding starts
        });

        startTime.setTime(endTime.getTime()); // Move to the next 15-minute slot
    }

    // Render each slot in the grid
    slots.forEach(slot => {
        const block = document.createElement("div");
        block.className = "time-slot";
        block.dataset.status = slot.status;

        block.innerHTML = `
            <p>Time: ${slot.startTime} - ${slot.endTime}</p>
            <p>Price: ${slot.price}</p>
            <p>Status: <span>${slot.status === "free" ? "Available" : "Taken"}</span></p>
            <p>Countdown: <span class="countdown">${slot.countdown > 0 ? formatCountdown(slot.countdown) : "Auction Ended"}</span></p>
        `;

        grid.appendChild(block);
    });

    // Start countdown timers for all free slots
    function startCountdown() {
        const freeSlots = document.querySelectorAll(".time-slot[data-status='free']");
        freeSlots.forEach(slot => {
            const countdownElem = slot.querySelector(".countdown");
            let timeLeft = parseInt(countdownElem.getAttribute('data-countdown')) || slot.countdown;

            const timer = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    countdownElem.textContent = "Auction Ended";
                    slot.dataset.status = "taken";
                    slot.querySelector("span").textContent = "Taken";
                    slot.style.backgroundColor = "#ffd7d7"; // Update color to show it's taken
                } else {
                    timeLeft--;
                    countdownElem.textContent = formatCountdown(timeLeft);
                }
            }, 1000);
        });
    }

    startCountdown();

    // Helper function to format seconds as MM:SS
    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});