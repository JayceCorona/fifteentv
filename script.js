document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("schedule-grid");
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0); // Start at 9:00 AM

    const now = new Date();

    // Generate 15-minute blocks from the next available block until the end of the day
    const slots = [];
    while (startTime.getHours() < 17) { // Until 5 PM
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 mins later
        const timeBeforeSlot = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 mins before start

        // Determine if the slot should show as "free" or "taken"
        const status = now > timeBeforeSlot ? "taken" : "free";

        // Create a slot object to keep it structured
        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: status === "free" ? Math.floor((timeBeforeSlot - now) / 1000) : 0 // Time in seconds until 15 mins before
        });

        startTime.setTime(endTime.getTime()); // Move to next 15-minute slot
    }

    // Sort slots so the next available slot is at the top
    slots.sort((a, b) => a.countdown - b.countdown);

    // Render slots in the grid
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

    // Start countdowns
    function startCountdown() {
        const slots = document.querySelectorAll(".time-slot");
        slots.forEach(slot => {
            if (slot.dataset.status === "free") {
                const countdownElem = slot.querySelector(".countdown");
                let timeLeft = parseInt(countdownElem.getAttribute("data-countdown"), 10);

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
            }
        });
    }

    startCountdown();

    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});
