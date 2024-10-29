document.addEventListener("DOMContentLoaded", function() {
    console.log("Script loaded");

    const grid = document.getElementById("schedule-grid");
    if (!grid) {
        console.error("Grid element not found");
        return;
    }

    console.log("Grid element found");

    // Function to display the next available session
    function displayNextSession() {
        grid.innerHTML = ""; // Clear the grid to show only one session

        // Set the start time to the next 15-minute interval from now
        const now = new Date();
        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        let startTime = new Date(now);
        startTime.setMinutes(minutes + remainder, 0, 0); // Next 15-minute segment

        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minutes later
        const countdownTarget = new Date(startTime.getTime() - 1 * 60 * 1000); // 1 minute before start
        const countdown = Math.floor((countdownTarget - now) / 1000); // Countdown until 1 minute before start

        // Create a single session slot
        const slot = {
            startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            countdown: countdown > 0 ? countdown : 0,
            price: "Free",
            status: countdown > 0 ? "Available" : "Taken" // Set initial status based on countdown
        };

        console.log("Next session created:", slot);

        const block = document.createElement("div");
        block.className = "time-slot";
        block.dataset.status = slot.status;

        block.innerHTML = `
            <p>Time: ${slot.startTime} - ${slot.endTime}</p>
            <p>Price: ${slot.price}</p>
            <p>Status: <span>${slot.status}</span></p>
            <p>Countdown: <span class="countdown">${slot.countdown > 0 ? formatCountdown(slot.countdown) : "Auction Ended"}</span></p>
        `;

        grid.appendChild(block);

        // Start the countdown for this session if it's available
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

                // Load the next session after a short delay
                setTimeout(displayNextSession, 1000);
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
});
