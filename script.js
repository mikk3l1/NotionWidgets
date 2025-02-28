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
const rainSoundFile = document.getElementById('rain-sound-file');
const jungleSoundFile = document.getElementById('jungle-sound-file');
const oceanSoundFile = document.getElementById('ocean-sound-file');

const sounds = {
    rain: rainSoundFile,
    jungle: jungleSoundFile,
    ocean: oceanSoundFile
};

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
        if (!isBreak) {
            timeLeft = workTime;
        }
        isRunning = true;
        playSound();
        timer = setInterval(() => {
            if (timeLeft > 0) {
                if (timeLeft === 4) {
                    endSound.play();
                }
                timeLeft--;
                updateTimer();
            } else {
                clearInterval(timer);
                isRunning = false;
                stopSound();
                if (isBreak) {
                    isBreak = false;
                    timeLeft = workTime;
                } else {
                    isBreak = true;
                    timeLeft = breakTime;
                }
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
    stopSound();
    updateTimer();
}

function changeSound(sound, button) {
    stopSound();
    selectedSound = sound;
    if (isRunning) {
        playSound();
    }
    soundButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

function playSound() {
    if (sounds[selectedSound]) {
        sounds[selectedSound].currentTime = 0;
        sounds[selectedSound].play();
    }
}

function stopSound() {
    Object.values(sounds).forEach(sound => {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    });
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
});

rainSoundButton.addEventListener('click', () => changeSound('rain', rainSoundButton));
jungleSoundButton.addEventListener('click', () => changeSound('jungle', jungleSoundButton));
oceanSoundButton.addEventListener('click', () => changeSound('ocean', oceanSoundButton));

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
darkModeToggle.addEventListener('change', toggleDarkMode);

updateTimer();
