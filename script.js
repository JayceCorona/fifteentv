document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("schedule-grid");
    const now = new Date();
    
    // Set the starting time to the next nearest 15-minute interval
    const startTime = new Date(now);
    const minutes = startTime.getMinutes();
    startTime.setMinutes(minutes + (15 - (minutes % 15)), 0, 0); // Round up to next 15 mins

    const slots = [];

    // Generate 15-minute blocks from the next interval until the end of the day
    while (startTime.getHours() < 24) { // Until midnight
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 mins later
        const timeBeforeSlot = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 mins before start

        // Calculate countdown until 15 minutes before the slot starts
        const status = now > timeBeforeSlot ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((timeBeforeSlot - now) / 1000) : 0;

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: "Free" // Default price as "Free"
        });

        startTime.setTime(endTime.getTime()); // Move to next 15-minute slot
    }

    // Sort slots so the next available slot is at the top
    slots.sort((a, b) => a.countdown - b.countdown);

    // Render each slot in the grid
    slots.forEach(slot => {
        const block = document.createElement("div");
        block.className = "time-slot";
        block.dataset.status = slot.status;

        // Set price text to "Free" until an offer is made
        const priceText = slot.price || "$0.01";

        block.innerHTML = `
            <p>Time: ${slot.startTime} - ${slot.endTime}</p>
            <p>Price: ${priceText}</p>
            <p>Status: <span>${slot.status === "free" ? "Available" : "Taken"}</span></p>
            <p>Countdown: <span class="countdown">${slot.countdown > 0 ? formatCountdown(slot.countdown) : "Auction Ended"}</span></p>
        `;

        grid.appendChild(block);
    });

    // Start countdowns for each slot
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
