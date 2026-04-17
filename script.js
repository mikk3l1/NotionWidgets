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
const darkModeToggle = document.getElementById('toggle--daynight');
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
    
    // Track recently used fish types to avoid repetition
    let recentFishTypes = [];
    
    // Create fish jumping animation - update position fish relative to wave layers
    function createJumpingFish() {
        if (!isPageVisible) return;
        
        // Available fish types
        const fishTypes = ['fish-blue', 'fish-goldfish', 'fish-yellow', 'fish-tuna', 'fish-siamese', 'fish-prawn'];
        
        // Select a fish type that wasn't recently used
        let fishType;
        const availableTypes = fishTypes.filter(type => !recentFishTypes.includes(type));
        
        if (availableTypes.length > 0) {
            // If we have unused types, select from those
            fishType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        } else {
            // If all types have been used recently, select any random type
            fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            // And reset the recent types tracking
            recentFishTypes = [];
        }
        
        // Add this type to recently used (keep only last 3 types in history)
        recentFishTypes.push(fishType);
        if (recentFishTypes.length > 3) {
            recentFishTypes.shift(); // Remove oldest type
        }
        
        // Create a new fish element
        const fish = document.createElement('div');
        fish.classList.add('ocean-fish');
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

// Add mode selection button references
const workModeButton = document.getElementById('work-mode');
const breakModeButton = document.getElementById('break-mode');

// Update the timer state function to handle mode changes
function updateTimerState(forceUpdate = false) {
    // Remove both classes first from timer display
    timerElement.classList.remove('timer-work', 'timer-break');
    
    // Add the appropriate class based on current state
    if (isBreak) {
        timerElement.classList.add('timer-break');
        workModeButton.classList.remove('active');
        breakModeButton.classList.add('active');
    } else {
        timerElement.classList.add('timer-work');
        workModeButton.classList.add('active');
        breakModeButton.classList.remove('active');
    }
    
    // If this is a forced update (from button click), also update the timer value
    if (forceUpdate) {
        // Reset timer to the appropriate value for the selected mode
        if (isBreak) {
            timeLeft = breakTime;
        } else {
            timeLeft = workTime;
        }
        updateTimer();
    }
}

// Add click handlers for mode buttons - these will manually change the timer mode
workModeButton.addEventListener('click', function() {
    if (isBreak) { // Only do something if we're changing modes
        isBreak = false;
        
        // Cancel current running timer if any
        if (isRunning) {
            clearInterval(timer);
            isRunning = false;
            document.getElementById('play-pause-icon').src = "icons/play.svg";
            startButton.setAttribute('aria-label', 'Start Timer');
        }
        
        updateTimerState(true); // Update UI and reset time
    }
});

breakModeButton.addEventListener('click', function() {
    if (!isBreak) { // Only do something if we're changing modes
        isBreak = true;
        
        // Cancel current running timer if any
        if (isRunning) {
            clearInterval(timer);
            isRunning = false;
            document.getElementById('play-pause-icon').src = "icons/play.svg";
            startButton.setAttribute('aria-label', 'Start Timer');
        }
        
        updateTimerState(true); // Update UI and reset time
    }
});

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
    // We no longer automatically reset to work mode - keep the current mode
    // Ensure button shows play icon when reset
    document.getElementById('play-pause-icon').src = "icons/play.svg";
    startButton.setAttribute('aria-label', 'Start Timer');
    workTime = parseFloat(workTimeInput.value) * 60;
    breakTime = parseFloat(breakTimeInput.value) * 60;
    // Set timeLeft based on current mode
    if (isBreak) {
        timeLeft = breakTime;
    } else {
        timeLeft = workTime;
    }
    // Update timer state styling when reset
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

// Dark mode toggle listener - guard in case element missing
// (some environments may not have the toggle input available at parse time)
// Listener added later with a null-check below.

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.pomodoro-timer').classList.toggle('dark-mode');
    document.querySelectorAll('button').forEach(button => button.classList.toggle('dark-mode'));
}

// function getDeviceType() {
//     const userAgent = navigator.userAgent;
//   if (/Mobi|Android/i.test(userAgent)) {
//       return "Mobile";
//     } else if (/Tablet|iPad/i.test(userAgent)) {
//       return "Tablet";
//     } else {
//       return "Desktop";
//     }
//   }


function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android|Tablet|iPad/.test(userAgent)) {
        return true;
    } else {
        return false;
    }
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
    
    // Check if device is mobile or tablet
    const isMobileOrTablet = getDeviceType();

    // Volume control setup - completely hide on mobile devices
    const volumeSlider = document.getElementById('volume-slider');
    const volumeContainer = document.querySelector('.volume-container');
    
    if (volumeContainer) {
        if (isMobileOrTablet) {
            // Hide the volume container completely for mobile devices
            volumeContainer.style.display = 'none';
            
            // For mobile devices, set a fixed volume (50% of maximum)
            soundFile.volume = 0.25;
        } else {
            // Only set up volume controls for desktop devices
            // Set default volume (scaled down to 25% of original maximum)
            soundFile.volume = volumeSlider.value * 0.5; // Scale slider value by 0.5
            
            // Volume change handler - scale down volume to 50% maximum
            volumeSlider.addEventListener('input', function() {
                // Scale the slider value (0-1) to a maximum of 0.5 for the actual audio
                soundFile.volume = this.value * 0.5;
                
                // Update volume icon based on relative volume level
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
                    // Store the current slider value before muting
                    this.dataset.previousVolume = volumeSlider.value;
                    soundFile.volume = 0;
                    volumeSlider.value = 0;
                    this.textContent = '🔇';
                } else {
                    // Restore the previous volume or set to default if not stored
                    const previousVolume = this.dataset.previousVolume || 0.5;
                    volumeSlider.value = previousVolume;
                    soundFile.volume = previousVolume * 0.5; // Scale by 0.5
                    this.textContent = previousVolume < 0.5 ? '🔉' : '🔊';
                }
            });
        }
    }
    
    // Initialize and set up digital clock
    updateDigitalClock();
    setInterval(updateDigitalClock, 1000);
    
    // Configuration button and panel setup
    const configButton = document.getElementById('config-button');
    const configPanel = document.getElementById('config-panel');
    const endSoundVolume = document.getElementById('end-sound-volume');
    
    if (configButton && configPanel) {
        // Toggle configuration panel visibility
        configButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            configPanel.classList.toggle('active');
            console.log('Settings panel toggled');
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (configPanel.classList.contains('active') && 
                !configPanel.contains(e.target) && 
                e.target !== configButton) {
                configPanel.classList.remove('active');
            }
        });
        
        // Prevent clicks inside panel from closing it
        configPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // End sound volume control
    if (endSoundVolume) {
        // Load saved end sound volume preference
        const savedEndSoundVolume = localStorage.getItem('endSoundVolume');
        if (savedEndSoundVolume !== null) {
            endSoundVolume.value = savedEndSoundVolume;
            endSound.volume = savedEndSoundVolume;
        }
        
        endSoundVolume.addEventListener('input', function() {
            endSound.volume = this.value;
            localStorage.setItem('endSoundVolume', this.value);
        });
    }
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
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', toggleDarkMode);
}

updateTimer();

/* -------- Tegnepanel: tegn, slet og gem ---------- */
function initDrawingPanel() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;

    const drawBtn = document.getElementById('draw-mode');
    const eraseBtn = document.getElementById('erase-mode');
    const clearBtn = document.getElementById('clear-canvas');
    const saveBtn = document.getElementById('save-canvas');
    const panel = document.querySelector('.drawing-panel');

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let drawing = false;
    let erasing = false;
    let penColor = '#fff';
    const penSize = 4;
    const eraseSize = 20;
    let points = [];

    function setCanvasSize() {
        if (!panel) return;
        const panelStyle = getComputedStyle(panel);
        const padTop = parseFloat(panelStyle.paddingTop) || 0;
        const padBottom = parseFloat(panelStyle.paddingBottom) || 0;
        const padLeft = parseFloat(panelStyle.paddingLeft) || 0;
        const padRight = parseFloat(panelStyle.paddingRight) || 0;

        const title = panel.querySelector('.drawing-title');
        const toolbar = panel.querySelector('.drawing-toolbar');

        const innerWidth = panel.clientWidth - padLeft - padRight;
        let innerHeight = panel.clientHeight - padTop - padBottom;
        if (title) innerHeight -= title.offsetHeight;
        if (toolbar) innerHeight -= toolbar.offsetHeight;

        const cssWidth = Math.max(80, Math.floor(innerWidth));
        const cssHeight = Math.max(80, Math.floor(innerHeight));

        // Preserve current drawing
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width || Math.floor(cssWidth * dpr);
        tmp.height = canvas.height || Math.floor(cssHeight * dpr);
        const tctx = tmp.getContext('2d');
        if (canvas.width && canvas.height) {
            try { tctx.drawImage(canvas, 0, 0, tmp.width, tmp.height); } catch (e) { }
        }

        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = cssWidth + 'px';
        canvas.style.height = cssHeight + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tmp.width && tmp.height) {
            ctx.clearRect(0, 0, cssWidth, cssHeight);
            try { ctx.drawImage(tmp, 0, 0, tmp.width / dpr, tmp.height / dpr, 0, 0, cssWidth, cssHeight); } catch (e) { }
        }
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function start(e) {
        e.preventDefault();
        drawing = true;
        points = [];
        const pos = getPos(e);
        // push starting point twice to initialize smoothing
        points.push(pos, pos);
    }

    function move(e) {
        if (!drawing) return;
        e.preventDefault();
        const p = getPos(e);
        points.push(p);

        ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = erasing ? eraseSize : penSize;

        // If we have fewer than 3 points, draw a simple line
        if (points.length < 3) {
            const b = points[0];
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.closePath();
            return;
        }

        // Use quadratic curves between midpoints for smoothing
        const len = points.length;
        const p0 = points[len - 3];
        const p1 = points[len - 2];
        const p2 = points[len - 1];

        const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        ctx.beginPath();
        ctx.moveTo(mid1.x, mid1.y);
        ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
        ctx.stroke();
        ctx.closePath();

        // Keep last two points so we can continue smoothing seamlessly
        if (points.length > 1000) {
            points = points.slice(-50);
        }
    }

    function end() {
        if (!drawing) return;
        drawing = false;
        points = [];
        ctx.closePath();
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    drawBtn.addEventListener('click', () => { erasing = false; drawBtn.classList.add('active'); eraseBtn.classList.remove('active'); });
    eraseBtn.addEventListener('click', () => { erasing = true; eraseBtn.classList.add('active'); drawBtn.classList.remove('active'); });

    // Confirmation modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');

    clearBtn.addEventListener('click', () => {
        if (confirmModal) confirmModal.classList.remove('hidden');
    });

    if (confirmYes) {
        confirmYes.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (confirmModal) confirmModal.classList.add('hidden');
        });
    }
    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            if (confirmModal) confirmModal.classList.add('hidden');
        });
    }

    // Emoji cursor helper: create an SVG data URL with the emoji and return CSS cursor value
    function makeEmojiCursor(emoji, size = 48) {
        const svg = `<?xml version="1.0" encoding="utf-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` +
            `<style>text{font-family: 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif; font-size:${Math.floor(size * 0.8)}px;}</style>` +
            `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>${emoji}</text></svg>`;
        const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        // hotspot roughly center
        return `url("${url}") ${Math.floor(size/2)} ${Math.floor(size/2)}, auto`;
    }

    // Apply cursor depending on current tool selection
    function updateCursor() {
        if (!panel) return;
        if (erasing) {
            panel.style.cursor = makeEmojiCursor('🧽', 48);
            canvas.style.cursor = makeEmojiCursor('🧽', 48);
        } else {
            panel.style.cursor = makeEmojiCursor('🖌️', 48);
            canvas.style.cursor = makeEmojiCursor('🖌️', 48);
        }
    }

    // Update pen color according to current (body) dark-mode state
    function updatePenColor() {
        const isDark = document.body.classList.contains('dark-mode');
        const prevPen = penColor;
        penColor = isDark ? '#fff' : '#000';
        // If pen color changed, recolor existing drawing to match
        if ((isDark && prevPen !== '#fff') || (!isDark && prevPen !== '#000')) {
            recolorCanvas(isDark);
        }
    }

    // Parse an rgb(...) or rgba(...) string to [r,g,b]
    function parseRgb(str) {
        if (!str) return [255,255,255];
        const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (m) return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10)];
        return [255,255,255];
    }

    // Recolor existing canvas strokes so they match the new pen color/background.
    // This works by sampling the canvas, detecting pixels that differ from the
    // previous background and blending them toward the target pen color.
    function recolorCanvas(toDarkMode) {
        const w = canvas.width;
        const h = canvas.height;
        if (!w || !h) return;

        // sample top-left pixel as previous background color
        const sample = ctx.getImageData(0, 0, 1, 1).data;
        const bgOld = [sample[0], sample[1], sample[2]];

        // new panel background color (after toggle)
        const panelBg = window.getComputedStyle(panel).backgroundColor;
        const bgNew = parseRgb(panelBg);

        const targetPen = toDarkMode ? [255,255,255] : [0,0,0];

        const img = ctx.getImageData(0, 0, w, h);
        const data = img.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];

            const dr = r - bgOld[0];
            const dg = g - bgOld[1];
            const db = b - bgOld[2];
            const dist = Math.sqrt(dr*dr + dg*dg + db*db);

            if (dist < 10) {
                // background pixel -> set to new background
                data[i] = bgNew[0];
                data[i+1] = bgNew[1];
                data[i+2] = bgNew[2];
            } else {
                // stroke pixel - compute mask from distance
                const mask = Math.min(1, dist / 200);
                data[i] = Math.round(bgNew[0] + (targetPen[0] - bgNew[0]) * mask);
                data[i+1] = Math.round(bgNew[1] + (targetPen[1] - bgNew[1]) * mask);
                data[i+2] = Math.round(bgNew[2] + (targetPen[2] - bgNew[2]) * mask);
            }
            // preserve alpha channel
        }

        ctx.putImageData(img, 0, 0);
    }

    // Hook cursor update to tool buttons
    drawBtn.addEventListener('click', () => { erasing = false; drawBtn.classList.add('active'); eraseBtn.classList.remove('active'); updateCursor(); });
    eraseBtn.addEventListener('click', () => { erasing = true; eraseBtn.classList.add('active'); drawBtn.classList.remove('active'); updateCursor(); });

    // Set initial pen color and cursor based on current mode/tool
    updatePenColor();
    updateCursor();

    // Update pen color and cursor when global dark-mode toggle changes
    if (typeof darkModeToggle !== 'undefined' && darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            // toggleDarkMode already toggles classes; just update pen and cursor
            updatePenColor();
            updateCursor();
        });
    }
    saveBtn.addEventListener('click', () => {
        const exportCanvas = document.createElement('canvas');
        const cssW = parseInt(canvas.style.width, 10) || canvas.width;
        const cssH = parseInt(canvas.style.height, 10) || canvas.height;
        exportCanvas.width = cssW;
        exportCanvas.height = cssH;
        const ectx = exportCanvas.getContext('2d');
        ectx.fillStyle = window.getComputedStyle(canvas).backgroundColor || '#fff';
        ectx.fillRect(0, 0, cssW, cssH);
        ectx.drawImage(canvas, 0, 0, cssW, cssH);
        const link = document.createElement('a');
        link.download = 'blackboard.png';
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    });

    // match panel size to pomodoro timer on init and resize
    const pomodoroEl = document.querySelector('.pomodoro-timer');
    function matchPanel() {
        if (pomodoroEl && panel) {
            const r = pomodoroEl.getBoundingClientRect();
            panel.style.width = r.width + 'px';
            panel.style.height = r.height + 'px';
        }
        setCanvasSize();
    }
    let resizeTimeout;
    window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(matchPanel, 150); });
    matchPanel();
}

document.addEventListener('DOMContentLoaded', initDrawingPanel);