let timer;
let isRunning = false;
let isBreak = false;
let workTime = 25 * 60;
let breakTime = 5 * 60;
let timeLeft = workTime;
let player;
let playerReady = false;
let selectedSound = 'yIQd2Ya0Ziw'; // Default sound (rain)

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

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning && playerReady) {
        workTime = parseFloat(workTimeInput.value) * 60;
        breakTime = parseFloat(breakTimeInput.value) * 60;
        if (!isBreak) {
            timeLeft = workTime;
        }
        isRunning = true;
        player.playVideo();
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
                player.stopVideo();
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
    player.stopVideo();
    updateTimer();
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: selectedSound,
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    event.target.setVolume(50);
}

function changeSound(videoId, button) {
    selectedSound = videoId;
    if (playerReady) {
        player.loadVideoById(videoId);
        if (isRunning) {
            player.playVideo();
        } else {
            player.stopVideo();
        }
    }
    soundButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
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
});

rainSoundButton.addEventListener('click', () => changeSound('yIQd2Ya0Ziw', rainSoundButton)); // Replace with actual rain sound ID
jungleSoundButton.addEventListener('click', () => changeSound('nZUMdnky11E', jungleSoundButton)); // Replace with actual jungle sound ID
oceanSoundButton.addEventListener('click', () => changeSound('bn9F19Hi1Lk', oceanSoundButton)); // Replace with actual ocean sound ID

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
darkModeToggle.addEventListener('change', toggleDarkMode);

updateTimer();
