document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded"); // Confirm script execution

    const grid = document.getElementById("schedule-grid");
    if (!grid) {
        console.error("Grid element not found");
        return;
    }

    console.log("Grid element found");

    // Calculate the next available 15-minute interval based on the current time
    const now = new Date();
    const startTime = new Date(now); // Start with the current time
    const minutes = startTime.getMinutes();
    const remainder = 15 - (minutes % 15);
    startTime.setMinutes(minutes + remainder, 0, 0); // Set to the nearest upcoming 15-minute segment

    console.log("Next session start time:", startTime);

    const slots = [];

    // Generate 15-minute slots until midnight
    while (startTime.getHours() < 24) {
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before start

        const status = now > countdownTarget ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((countdownTarget - now) / 1000) : 0;

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: "Free"
        });

        console.log("Slot created:", slots[slots.length - 1]);

        startTime.setTime(endTime.getTime()); // Move to the next 15-minute slot
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

    // Start countdown for free slots
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
