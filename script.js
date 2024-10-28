document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded"); // Debugging: confirm script runs
    const grid = document.getElementById("schedule-grid");

    function getCSTDate() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC
        const cstOffset = -6; // CST is UTC-6
        return new Date(utc + (3600000 * cstOffset));
    }

    const nowCST = getCSTDate();
    console.log("Current CST time:", nowCST); // Debugging: check CST time

    const startTime = new Date(nowCST);
    const minutes = startTime.getMinutes();
    const remainder = 15 - (minutes % 15);
    startTime.setMinutes(minutes + remainder, 0, 0); // Set to nearest future 15-minute interval

    const slots = [];

    while (startTime.getHours() < 24) { // Only show slots until midnight
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
        const countdownTarget = new Date(startTime.getTime() - 15 * 60 * 1000);

        const status = nowCST > countdownTarget ? "taken" : "free";
        const countdown = status === "free" ? Math.floor((countdownTarget - nowCST) / 1000) : 0;

        slots.push({
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status,
            countdown: countdown,
            price: "Free"
        });

        startTime.setTime(endTime.getTime());
    }

    console.log("Slots generated:", slots.length); // Debugging: confirm slots

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

    console.log("Slots rendered to DOM"); // Debugging: confirm rendering

    // Commenting out countdown to check if it’s the issue
    // startCountdown();

    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
});
