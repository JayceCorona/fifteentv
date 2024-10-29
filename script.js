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
    startTime.setMinutes(minutes + remainder, 0, 0); // Next 15-minute segment

    console.log("Next available segment start time:", startTime);

    // Define the end limit as 24 hours from `now`
    const endLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const slots = [];
    let countdownStarted = false; // Track when the first available slot is found

    // Generate 15-minute slots up to 24 hours from `now`
    while (startTime < endLimit) {
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before start

        // Mark the first upcoming slot as "free" with a countdown; all others as "taken"
        const status = !countdownStarted ? "free" : "taken";
        const countdown = status === "free" ? Math.floor((countdownTarget - now) / 1000) : 0;
        const price = status === "free" ? "Free" : "$0.01";

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: price
        });

        console.log("Slot created:", slots[slots.length - 1]);

        // Only the first "free" slot should have the countdown
        if (status === "free") countdownStarted = true;

        // Advance startTime by 15 minutes
        startTime = new Date(startTime.getTime() + 15 * 60 * 1000);
    }

    console.log("Total slots generated:", slots.length);

    // Render slots in the grid
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

    console.log("Slots rendered to the DOM");

    // Start countdown only for the first available slot
    function startCountdown() {
        const countdownElem = document.querySelector(".time-slot[data-status='free'] .countdown");
        if (countdownElem) {
            let timeLeft = parseInt(countdownElem.textContent.split(":").join("")) || parseInt(countdownElem.textContent, 10);

            const timer = setInterval(() => {
                if (isNaN(timeLeft) || timeLeft <= 0) {
                    clearInterval(timer);
                    countdownElem.textContent = "Auction Ended";
                    countdownElem.closest(".time-slot").dataset.status = "taken";
                    countdownElem.closest(".time-slot").querySelector("span").textContent = "Taken";
                    countdownElem.closest(".time-slot").style.backgroundColor = "#ffd7d7";
                } else {
                    timeLeft--;
                    countdownElem.textContent = formatCountdown(timeLeft);
                }
            }, 1000);
        }
    }

    startCountdown();

    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});
