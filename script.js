// Variables
let prevCoords = null;
let speedThreshold = 50; // Default threshold in km/h
const speedDisplay = document.getElementById('speed-display');
const statusMessage = document.getElementById('status-message');
const speedThresholdInput = document.getElementById('speed-threshold');
speedThresholdInput.value = speedThreshold;

// Set up event listener for user-defined threshold
speedThresholdInput.addEventListener('change', () => {
    speedThreshold = parseInt(speedThresholdInput.value, 10);
});

// Function to calculate speed using the Haversine formula
function calculateSpeed(coords1, coords2, timeElapsed) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = coords1.latitude * Math.PI / 180;
    const φ2 = coords2.latitude * Math.PI / 180;
    const Δφ = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const Δλ = (coords2.longitude - coords1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    const speed = (distance / timeElapsed) * 3.6; // Convert m/s to km/h
    return speed;
}

// Function to start geolocation tracking
function trackLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updateSpeed, showError, {
            enableHighAccuracy: true,
            maximumAge: 1000
        });
    } else {
        statusMessage.textContent = "Geolocation is not supported by this browser.";
    }
}

// Function to update the speed display
function updateSpeed(position) {
    if (prevCoords) {
        const timeElapsed = (position.timestamp - prevCoords.timestamp) / 1000;
        const speed = calculateSpeed(prevCoords.coords, position.coords, timeElapsed);
        speedDisplay.textContent = `${speed.toFixed(1)} km/h`;
        updateGauge(speed);

        // Trigger alarm if speed exceeds threshold
        if (speed > speedThreshold) {
            playAlarm();
            navigator.vibrate(500);
        }
    }
    prevCoords = position;
}

// Function to update speedometer gauge
function updateGauge(speed) {
    // Simple visual update for gauge based on speed
    document.getElementById('gauge').style.width = `${Math.min(speed, 100)}%`;
}

// Function to play alarm sound
function playAlarm() {
    const alarmSound = new Audio('alarm.mp3');
    alarmSound.play();
}

// Function to handle errors
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            statusMessage.textContent = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            statusMessage.textContent = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            statusMessage.textContent = "The request to get user location timed out.";
            break;
        default:
            statusMessage.textContent = "An unknown error occurred.";
            break;
    }
}

// Initialize tracking
trackLocation();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered:', registration))
        .catch(error => console.log('Service Worker registration failed:', error));
}
