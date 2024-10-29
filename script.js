document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded");

    const grid = document.getElementById("schedule-grid");
    if (!grid) {
        console.error("Grid element not found");
        return;
    }

    console.log("Grid element found");

    // Set the start time to the next 15-minute interval from now
    const now = new Date();
    const minutes = now.getMinutes();
    const remainder = 15 - (minutes % 15);
    let startTime = new Date(now);
    startTime.setMinutes(minutes + remainder, 0, 0); // Set to next 15-minute segment

    console.log("Calculated start time:", startTime);

    // Define the end limit as 24 hours from `now`
    const endLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    console.log("End limit:", endLimit);

    const slots = [];

    // Generate 15-minute slots up to 24 hours from `now`
    while (startTime < endLimit) {
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before start

        // Set the first 4 slots as taken
        const index = slots.length;
        const status = index < 4 ? "taken" : now > countdownTarget ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((countdownTarget - now) / 1000) : 0;
        const price = index < 4 ? "$0.01" : "Free"; // Set price if needed for the taken slots

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: price
        });

        console.log("Slot created:", slots[slots.length - 1]);

        // Advance startTime by 15 minutes
        startTime = new Date(startTime.getTime() + 15 * 60 * 1000);
    }

    console.log("Total slots generated:", slots.length);

    // Render slots in the grid with a max of 4 per row
    slots.forEach((slot, index) => {
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

        // Insert a row break after every 4 slots
        if ((index + 1) % 4 === 0) {
            const rowBreak = document.createElement("div");
            rowBreak.className = "row-break";
            grid.appendChild(rowBreak);
        }
    });

    console.log("Slots rendered to the DOM");

    // Start countdown for free slots
    function startCountdown() {
        const slots = document.querySelectorAll(".time-slot[data-status='free']");
        slots.forEach(slot => {
            const countdownElem = slot.querySelector(".countdown");
            let timeLeft = parseInt(countdownElem.textContent.split(":").join("")) || parseInt(slot.dataset.countdown, 10);

            const timer = setInterval(() => {
                if (isNaN(timeLeft) || timeLeft <= 0) {
                    clearInterval(timer);
                    countdownElem.textContent = "Auction Ended";
                    slot.dataset.status = "taken";
                    slot.querySelector("span").textContent = "Taken";
                    slot.style.backgroundColor = "#ffd7d7";
                } else {
                    timeLeft--;
                    countdownElem.textContent = formatCountdown(timeLeft);
                }
            }, 1000);
        });
    }

    startCountdown();

    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});
