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

// Create rain effect
function createRain() {
    const raindropsCount = 100;
    
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
    const leavesCount = 30;
    
    // Remove old leaves if too many
    const existingLeaves = jungleContainer.querySelectorAll('.leaf');
    if (existingLeaves.length > 60) {
        for (let i = 0; i < 15; i++) {
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
        
        // Continuously add leaves frequently
        jungleAnimationId = setInterval(createJungle, 3000); // Even more frequent refreshes
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

// Create ocean effect
function createOcean() {
    // Clear container first for waves
    oceanContainer.innerHTML = '';
    
    // Create waves
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.classList.add('wave');
        oceanContainer.appendChild(wave);
    }
    
    // Create bubbles gradually
    function createBubbles() {
        // Limit bubbles to prevent performance issues
        const existingBubbles = oceanContainer.querySelectorAll('.bubble');
        if (existingBubbles.length > 50) return;
        
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Randomize bubble properties
        const size = Math.random() * 5 + 3;
        const posX = Math.floor(Math.random() * window.innerWidth);
        const duration = Math.random() * 8 + 4;
        const opacity = Math.random() * 0.5 + 0.2;
        
        // Apply styles
        bubble.style.left = `${posX}px`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.opacity = opacity;
        bubble.style.animationDuration = `${duration}s`;
        
        oceanContainer.appendChild(bubble);
        
        // Remove bubble after animation completes
        setTimeout(() => {
            if (bubble.parentNode === oceanContainer) {
                bubble.remove();
            }
        }, duration * 1000);
    }
    
    // Create initial bubbles and start creating more
    for (let i = 0; i < 20; i++) {
        setTimeout(createBubbles, i * 300);
    }
    
    return setInterval(createBubbles, 300);
}

function startOceanAnimation() {
    if (!oceanAnimationId) {
        oceanContainer.classList.add('active');
        
        // Create waves immediately
        setTimeout(() => {
            oceanAnimationId = createOcean();
        }, 100);
    }
}

function stopOceanAnimation() {
    if (oceanAnimationId) {
        clearInterval(oceanAnimationId);
        oceanAnimationId = null;
        
        oceanContainer.classList.remove('active');
        
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
    document.title = `Pomodoro Timer - ${formattedTime}`;
}

function startTimer() {
    if (!isRunning) {
        workTime = parseFloat(workTimeInput.value) * 60;
        breakTime = parseFloat(breakTimeInput.value) * 60;
        
        // Set up the timeLeft value based on mode
        if (!isBreak) {
            timeLeft = workTime;
        } else {
            timeLeft = breakTime;
        }
        
        isRunning = true;
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
                
                // Toggle between work and break
                if (isBreak) {
                    isBreak = false;
                    timeLeft = workTime;
                } else {
                    isBreak = true;
                    timeLeft = breakTime;
                }
                
                // Start next timer
                startTimer();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isBreak = false;
    workTime = parseFloat(workTimeInput.value) * 60;
    breakTime = parseFloat(breakTimeInput.value) * 60;
    timeLeft = workTime;
    // Removed stopSound() so ambient sound continues playing when timer is reset
    updateTimer();
}

// Update changeSound function to handle all visual effects
function changeSound(sound, button) {
    // Keep the currently playing state
    const wasPlaying = !soundFile.paused;
    
    // Stop any current sound effects
    stopAllAnimations();
    
    // Pause current sound
    soundFile.pause();
    soundFile.currentTime = 0;
    
    // Update the sound source
    selectedSound = sound;
    soundFile.src = sounds[sound];
    
    // If sound was playing before, start the new sound
    if (wasPlaying) {
        soundFile.play();
        
        // Start appropriate visual effect immediately
        setTimeout(() => {
            if (sound === 'rain') {
                startRainAnimation();
            } else if (sound === 'jungle') {
                startJungleAnimation();
            } else if (sound === 'ocean') {
                startOceanAnimation();
            }
        }, 0); // Run on next tick to ensure immediate start
    }
    
    // Update the active button
    soundButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Add event listeners for audio playback to control animations
soundFile.addEventListener('play', () => {
    if (selectedSound === 'rain') {
        startRainAnimation();
    } else if (selectedSound === 'jungle') {
        startJungleAnimation();
    } else if (selectedSound === 'ocean') {
        startOceanAnimation();
    }
});

soundFile.addEventListener('pause', stopAllAnimations);

// Keep these functions for manual sound control through UI
function playSound() {
    soundFile.currentTime = 0;
    soundFile.play();
}

function stopSound() {
    soundFile.pause();
    soundFile.currentTime = 0;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.pomodoro-timer').classList.toggle('dark-mode');
    document.querySelectorAll('button').forEach(button => button.classList.toggle('dark-mode'));
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode');
    document.querySelector('.pomodoro-timer').classList.add('dark-mode');
    document.querySelectorAll('button').forEach(button => button.classList.add('dark-mode'));
    rainSoundButton.classList.add('active'); // Set rain sound button as active from the start
    soundFile.src = sounds['rain']; // Set rain sound as default sound
});

rainSoundButton.addEventListener('click', () => changeSound('rain', rainSoundButton));
jungleSoundButton.addEventListener('click', () => changeSound('jungle', jungleSoundButton));
oceanSoundButton.addEventListener('click', () => changeSound('ocean', oceanSoundButton));

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
darkModeToggle.addEventListener('change', toggleDarkMode);

updateTimer();
