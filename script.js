document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("schedule-grid");
    const now = new Date();

    // Calculate the next 15-minute interval for the starting time
    const startTime = new Date(now);
    const minutes = startTime.getMinutes();
    startTime.setMinutes(minutes + (15 - (minutes % 15)), 0, 0); // Round up to the next 15-minute mark

    const slots = [];

    // Generate 15-minute blocks from the upcoming interval until midnight
    while (startTime.getHours() < 24) { // Only show slots until midnight
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before start

        // Determine status and calculate countdown
        const status = now > countdownTarget ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((countdownTarget - now) / 1000) : 0;

        // Push slot details to the array with initial price set to "Free"
        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: "Free"
        });

        // Move to the next 15-minute interval
        startTime.setTime(endTime.getTime());
    }

    // Sort slots so the next available slot appears at the top
    slots.sort((a, b) => a.countdown - b.countdown);

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

    // Start countdown timers
    function startCountdown() {
        const slots = document.querySelectorAll(".time-slot[data-status='free']");
        slots.forEach(slot => {
            const countdownElem = slot.querySelector(".countdown");
            let timeLeft = parseInt(slot.countdown);

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
