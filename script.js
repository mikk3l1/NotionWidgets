let timer;
let isRunning = false;
let isBreak = false;
let workTime = 25 * 60;
let breakTime = 5 * 60;
let timeLeft = workTime;
let selectedSound = 'rain'; // Default sound (rain)

const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const endSound = document.getElementById('end-sound');
const rainSoundButton = document.getElementById('rain-sound');
const jungleSoundButton = document.getElementById('jungle-sound');
const oceanSoundButton = document.getElementById('ocean-sound');
const soundButtons = document.querySelectorAll('.sound-button');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const soundFile = document.getElementById('sound-file');
const rainContainer = document.getElementById('rain-container');
const jungleContainer = document.getElementById('jungle-container');
const oceanContainer = document.getElementById('ocean-container');

const sounds = {
    rain: 'sounds/background/rain.mp3',
    jungle: 'sounds/background/jungle.mp3',
    ocean: 'sounds/background/ocean.mp3'
};

let rainAnimationId;
let jungleAnimationId;
let oceanAnimationId;

let isPageVisible = true; // Track page visibility

// Add page visibility detection
document.addEventListener('visibilitychange', function() {
    isPageVisible = document.visibilityState === 'visible';
    
    // When page becomes visible again, clean up accumulated animations
    if (isPageVisible) {
        if (jungleAnimationId) {
            // Clean up excess leaves that might have accumulated
            const existingLeaves = jungleContainer.querySelectorAll('.leaf');
            if (existingLeaves.length > 30) {
                // Keep only a reasonable number of leaves
                for (let i = 30; i < existingLeaves.length; i++) {
                    existingLeaves[i].remove();
                }
            }
        }
    }
});

// Create rain effect
function createRain() {
    if (!isPageVisible) return;

    const raindropsCount = 10;
    
    // Don't clear the container each time to prevent the visual "burst" at the beginning
    // Instead, remove only old raindrops that have completed their animation
    const existingDrops = rainContainer.querySelectorAll('.raindrop');
    if (existingDrops.length > 200) {  // Limit max raindrops to prevent performance issues
        // Remove some of the older raindrops
        for (let i = 0; i < 50; i++) {
            if (existingDrops[i]) {
                existingDrops[i].remove();
            }
        }
    }
    
    // Create raindrops gradually
    function createDrops(i, total) {
        if (i >= total) return;
        
        const raindrop = document.createElement('div');
        raindrop.classList.add('raindrop');
        
        // Randomize raindrop properties
        const size = Math.random() * 2 + 1;
        const posX = Math.floor(Math.random() * window.innerWidth);
        const delay = Math.random() * 2;
        const duration = Math.random() * 1.5 + 1;  // Slightly longer duration
        
        // Apply styles - initial position is off-screen
        raindrop.style.left = `${posX}px`;
        raindrop.style.width = `${size}px`;
        raindrop.style.height = `${size * 15}px`;
        raindrop.style.animationDelay = `${delay}s`;
        raindrop.style.animationDuration = `${duration}s`;
        
        rainContainer.appendChild(raindrop);
        
        // Create the next raindrop after a small delay
        setTimeout(() => createDrops(i + 1, total), 20);
    }
    
    // Start creating raindrops gradually
    createDrops(0, raindropsCount);
}

function startRainAnimation() {
    if (!rainAnimationId) {
        // Add the active class to start fading in
        rainContainer.classList.add('active');
        
        // Start creating rain with a slight delay
        setTimeout(createRain, 100);
        
        // Periodically add more raindrops for a continuous effect
        rainAnimationId = setInterval(createRain, 5000);  // Less frequent refreshes
    }
}

function stopRainAnimation() {
    if (rainAnimationId) {
        clearInterval(rainAnimationId);
        rainAnimationId = null;
        
        // Fade out the rain container
        rainContainer.classList.remove('active');
        
        // Clear all raindrops after the fade-out animation completes
        setTimeout(() => {
            rainContainer.innerHTML = '';
        }, 2000); // Match the opacity transition time
    }
}

// Create jungle effect
function createJungle() {
    // Skip creating leaves if page is not visible
    if (!isPageVisible) return;
    
    const leavesCount = 10;
    
    // Remove old leaves if too many - more aggressive cleanup
    const existingLeaves = jungleContainer.querySelectorAll('.leaf');
    if (existingLeaves.length > 40) { // Reduced from 60 to 40
        // Remove half of the existing leaves
        for (let i = 0; i < Math.floor(existingLeaves.length / 2); i++) {
            if (existingLeaves[i]) {
                existingLeaves[i].remove();
            }
        }
    }
    
    // Create leaves instantly in batches to ensure immediate visibility
    for (let i = 0; i < leavesCount; i++) {
        const leaf = document.createElement('div');
        leaf.classList.add('leaf');
        
        // Randomize between 3 leaf types
        const leafType = Math.floor(Math.random() * 3) + 1;
        leaf.classList.add('leaf' + leafType);
        
        // Randomize leaf properties
        const size = Math.random() * 20 + 15;
        const posX = Math.floor(Math.random() * window.innerWidth);
        
        // Stagger initial positions to create full screen distribution immediately
        // Some leaves start near the top, some in the middle, some near the bottom
        const initialPosition = Math.random() * -200; // Between 0 and -200vh
        
        // Even faster animation (3-6 seconds)
        const duration = Math.random() * 3 + 6;
        
        // Apply styles directly
        leaf.style.left = `${posX}px`;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;
        leaf.style.animationDuration = `${duration}s`;
        leaf.style.animationDelay = '0s'; // No delay
        leaf.style.transform = `translateY(${initialPosition}vh) rotate(0deg)`;
        
        jungleContainer.appendChild(leaf);
    }
}

function startJungleAnimation() {
    if (!jungleAnimationId) {
        // Clear any existing leaves
        jungleContainer.innerHTML = '';
        
        // Add active class immediately
        jungleContainer.classList.add('active');
        
        // Create first batch without delay
        createJungle();
        
        // Continuously add leaves, using a function that checks visibility
        jungleAnimationId = setInterval(() => {
            if (isPageVisible) {
                createJungle();
            }
        }, 3000);
    }
}

function stopJungleAnimation() {
    if (jungleAnimationId) {
        clearInterval(jungleAnimationId);
        jungleAnimationId = null;
        
        jungleContainer.classList.remove('active');
        
        setTimeout(() => {
            jungleContainer.innerHTML = '';
        }, 2000);
    }
}

// Create ocean effect with layered waves and jumping fish
function createOcean() {
    // Clear container first
    oceanContainer.innerHTML = '';
    
    // Create 5 wave layers
    for (let i = 0; i < 5; i++) {
        const waveLayer = document.createElement('div');
        waveLayer.classList.add('wave-layer');
        oceanContainer.appendChild(waveLayer);
    }
    
    // Create bubbles gradually
    function createBubbles() {
        if (!isPageVisible) return;

        // Limit bubbles to prevent performance issues
        const existingBubbles = oceanContainer.querySelectorAll('.bubble');
        if (existingBubbles.length > 30) return;
        
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Randomize bubble properties
        const size = Math.random() * 4 + 2;
        const posX = Math.floor(Math.random() * window.innerWidth);
        const duration = Math.random() * 7 + 3;
        const opacity = Math.random() * 0.5 + 0.3;
        
        // Apply styles
        bubble.style.left = `${posX}px`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.opacity = opacity;
        bubble.style.animationDuration = `${duration}s`;
        
        oceanContainer.appendChild(bubble);
        
        // Remove bubble after animation completes
        setTimeout(() => {
            if (bubble && bubble.parentNode === oceanContainer) {
                bubble.remove();
            }
        }, duration * 1000);
    }
    
    // Create fish jumping animation - update position fish relative to wave layers
    function createJumpingFish() {
        if (!isPageVisible) return;
        
        
        // Available fish types
        const fishTypes = ['fish-blue', 'fish-goldfish', 'fish-yellow', 'fish-tuna', 'fish-siamese', 'fish-prawn'];
        
        // Create a new fish element
        const fish = document.createElement('div');
        fish.classList.add('ocean-fish');
        
        // Select a random fish type
        const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        fish.classList.add(fishType);
        
        // Position fish at random horizontal location
        const posX = Math.floor(Math.random() * (window.innerWidth - 150));
        fish.style.left = `${posX}px`;
        
        // Set a random z-index for the fish to appear between different wave layers
        const zIndex = Math.floor(Math.random() * 5) - 4; // Values from -4 to 0
        fish.style.zIndex = zIndex;
        
        // Position fish at random vertical location between waves
        const wavePositions = [290, 240, 190, 140, 90]; // Updated positions to align with wave heights
        const posYIndex = Math.min(Math.abs(zIndex + 4), 4); // Correlate z-index with wave position
        const posY = wavePositions[posYIndex];
        fish.style.bottom = `${posY}px`;
        
        // Add fish to container
        oceanContainer.appendChild(fish);
        
        // Start fish jumping animation
        setTimeout(() => {
            fish.classList.add('jumping');
            
            // Remove fish after animation completes
            setTimeout(() => {
                if (fish && fish.parentNode === oceanContainer) {
                    fish.remove();
                }
            }, 4000);
        }, 50);
    }
    
    // Create initial bubbles
    for (let i = 0; i < 10; i++) {
        setTimeout(createBubbles, i * 300);
    }
    
    // Create initial fish - but not more than the max (5)
    for (let i = 0; i < Math.min(1, 5); i++) {
        setTimeout(createJumpingFish, (i * 1000) + Math.random() * 1000);
    }
    
    // Set up intervals for continuous animations
    const bubbleInterval = setInterval(createBubbles, 500);
    
    // Slightly longer interval between fish jumps now that we limit the total
    const fishInterval = setInterval(createJumpingFish, 9000 + Math.random() * 2000);
    
    // Return cleanup function that clears both intervals
    return () => {
        clearInterval(bubbleInterval);
        clearInterval(fishInterval);
    };
}

function startOceanAnimation() {
    if (!oceanAnimationId) {
        // Add the active class to start fading in
        oceanContainer.classList.add('active');
        
        // Create ocean effect with slight delay
        setTimeout(() => {
            oceanAnimationId = createOcean();
        }, 100);
    }
}

function stopOceanAnimation() {
    if (oceanAnimationId) {
        // Call the cleanup function returned from createOcean
        oceanAnimationId();
        oceanAnimationId = null;
        
        // Fade out the container
        oceanContainer.classList.remove('active');
        
        // Clean up after fade animation completes
        setTimeout(() => {
            oceanContainer.innerHTML = '';
        }, 2000);
    }
}

// Stop all animations
function stopAllAnimations() {
    stopRainAnimation();
    stopJungleAnimation();
    stopOceanAnimation();
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerElement.textContent = formattedTime;
    document.title = `${formattedTime} Linneas Workspace`;
}

// Add a function to update the timer state styling
function updateTimerState() {
    // Remove both classes first
    timerElement.classList.remove('timer-work', 'timer-break');
    
    // Add the appropriate class based on current state
    if (isBreak) {
        timerElement.classList.add('timer-break');
    } else {
        timerElement.classList.add('timer-work');
    }
}

function startTimer() {
    if (!isRunning) {
        // Only initialize the timer values when not resuming from pause
        if (timeLeft === workTime || timeLeft === breakTime || timeLeft <= 0) {
            workTime = parseFloat(workTimeInput.value) * 60;
            breakTime = parseFloat(breakTimeInput.value) * 60;
            
            // Set up the timeLeft value based on mode
            if (!isBreak) {
                timeLeft = workTime;
            } else {
                timeLeft = breakTime;
            }
        }
        // Note: When resuming from pause, we keep the existing timeLeft value
        
        // Update timer state styling
        updateTimerState();
        
        isRunning = true;
        // Change to pause icon
        document.getElementById('play-pause-icon').src = "icons/pause.svg";
        startButton.setAttribute('aria-label', 'Pause Timer');
        updateTimer(); // Update display immediately
        
        timer = setInterval(() => {
            // First decrement the time
            timeLeft--;
            
            // Then update the display
            updateTimer();
            
            // Play warning sound when timer shows exactly 3 seconds left
            if (timeLeft === 3) {
                endSound.currentTime = 0; // Reset sound position
                endSound.play();
            }
            
            // Check if timer has reached zero
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                // Change to play icon
                document.getElementById('play-pause-icon').src = "icons/play.svg";
                startButton.setAttribute('aria-label', 'Start Timer');
                
                // Toggle between work and break
                if (isBreak) {
                    isBreak = false;
                    timeLeft = workTime;
                } else {
                    isBreak = true;
                    timeLeft = breakTime;
                }
                
                // Update timer state styling after toggling
                updateTimerState();
                
                // Start next timer
                startTimer();
            }
        }, 1000);
    } else {
        // Pausing the timer
        clearInterval(timer);
        isRunning = false;
        // Change to play icon
        document.getElementById('play-pause-icon').src = "icons/play.svg";
        startButton.setAttribute('aria-label', 'Start Timer');
        // Note: We're keeping timeLeft as is, so we can resume from this point
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isBreak = false;
    // Ensure button shows play icon when reset
    document.getElementById('play-pause-icon').src = "icons/play.svg";
    startButton.setAttribute('aria-label', 'Start Timer');
    workTime = parseFloat(workTimeInput.value) * 60;
    breakTime = parseFloat(breakTimeInput.value) * 60;
    timeLeft = workTime;
    // Update timer state styling when reset (back to work state)
    updateTimerState();
    // Removed stopSound() so ambient sound continues playing when timer is reset
    updateTimer();
}

// Update changeSound function to handle all visual effects and toggle play/pause
function changeSound(sound, button) {
    // If the same button is clicked again, toggle play/pause
    if (button.classList.contains('active') && selectedSound === sound) {
        if (soundFile.paused) {
            soundFile.play();
            // Add sound-playing class to the active button
            button.classList.add('sound-playing');
            // Make sure the appropriate animation starts
            if (sound === 'rain') {
                startRainAnimation();
            } else if (sound === 'jungle') {
                startJungleAnimation();
            } else if (sound === 'ocean') {
                startOceanAnimation();
            }
        } else {
            soundFile.pause();
            // Remove sound-playing class when paused
            button.classList.remove('sound-playing');
            stopAllAnimations();
        }
        return;
    }
    
    // If a different button is clicked, change sound
    // Stop any current sound effects
    stopAllAnimations();
    
    // Pause current sound
    soundFile.pause();
    soundFile.currentTime = 0;
    
    // Update the sound source
    selectedSound = sound;
    soundFile.src = sounds[sound];
    
    // Remove sound-playing class from all buttons
    soundButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('sound-playing');
    });
    
    // Update the active button
    button.classList.add('active');
    
    // Play the new sound
    soundFile.play();
    // Add sound-playing class when playing
    button.classList.add('sound-playing');
    
    // Start appropriate visual effect immediately
    setTimeout(() => {
        if (sound === 'rain') {
            startRainAnimation();
        } else if (sound === 'jungle') {
            startJungleAnimation();
        } else if (sound === 'ocean') {
            startOceanAnimation();
        }
    }, 0);
}

// Add event listeners for audio playback to control animations and icon state
soundFile.addEventListener('play', () => {
    // When sound plays, add sound-playing class to active button
    soundButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
            btn.classList.add('sound-playing');
        }
    });
    
    if (selectedSound === 'rain') {
        startRainAnimation();
    } else if (selectedSound === 'jungle') {
        startJungleAnimation();
    } else if (selectedSound === 'ocean') {
        startOceanAnimation();
    }
});

soundFile.addEventListener('pause', () => {
    // When sound pauses, remove sound-playing class from all buttons
    soundButtons.forEach(btn => {
        btn.classList.remove('sound-playing');
    });
    
    stopAllAnimations();
});

// Keep these functions for manual sound control through UI
function playSound() {
    soundFile.currentTime = 0;
    soundFile.play();
}

function stopSound() {
    soundFile.pause();
    soundFile.currentTime = 0;
}

// Update dark mode toggle functionality
document.getElementById('toggle--daynight').addEventListener('change', function() {
    toggleDarkMode();
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.pomodoro-timer').classList.toggle('dark-mode');
    document.querySelectorAll('button').forEach(button => button.classList.toggle('dark-mode'));
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode');
    document.querySelector('.pomodoro-timer').classList.add('dark-mode');
    document.querySelectorAll('button').forEach(button => button.classList.add('dark-mode'));
    // rainSoundButton.classList.add('active'); // Set rain sound button as active from the start
    // soundFile.src = sounds['rain']; // Set rain sound as default sound
    
    // If autoplay is enabled and allowed by browser, add sound-playing class
    soundFile.addEventListener('playing', function() {
        rainSoundButton.classList.add('sound-playing');
    });
    
    // Set initial timer state (work mode by default)
    updateTimerState();
    
    // Set default volume
    const volumeSlider = document.getElementById('volume-slider');
    soundFile.volume = volumeSlider.value;
    
    // Volume change handler
    volumeSlider.addEventListener('input', function() {
        soundFile.volume = this.value;
        
        // Update volume icon based on volume level
        const volumeIcon = document.querySelector('.volume-icon');
        if (this.value === '0') {
            volumeIcon.textContent = '🔇';
        } else if (this.value < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    });
    
    // Make volume icon clickable to mute/unmute
    document.querySelector('.volume-icon').addEventListener('click', function() {
        if (soundFile.volume > 0) {
            // Store the current volume before muting
            this.dataset.previousVolume = soundFile.volume;
            soundFile.volume = 0;
            volumeSlider.value = 0;
            this.textContent = '🔇';
        } else {
            // Restore the previous volume or set to 0.5 if not stored
            const previousVolume = this.dataset.previousVolume || 0.5;
            soundFile.volume = previousVolume;
            volumeSlider.value = previousVolume;
            this.textContent = previousVolume < 0.5 ? '🔉' : '🔊';
        }
    });
    
    // Initialize and set up digital clock
    updateDigitalClock();
    setInterval(updateDigitalClock, 1000);
});

// Digital Clock Functionality
function updateDigitalClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('digital-clock').textContent = `${hours}:${minutes}`;
}

rainSoundButton.addEventListener('click', () => changeSound('rain', rainSoundButton));
jungleSoundButton.addEventListener('click', () => changeSound('jungle', jungleSoundButton));
oceanSoundButton.addEventListener('click', () => changeSound('ocean', oceanSoundButton));

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
darkModeToggle.addEventListener('change', toggleDarkMode);

updateTimer();