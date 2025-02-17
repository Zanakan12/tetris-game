// static/timer.js

let totalSeconds = 0;
let timerInterval = null;
const timerDisplay = document.getElementById("timer");

// Met à jour l'affichage du temps
function updateTimer() {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  if (timerDisplay) {
    timerDisplay.textContent = `Time : ${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }
  totalSeconds++;
}

// Démarrer le timer
export function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// Mettre en pause
export function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Réinitialiser
export function resetTimer() {
  pauseTimer();
  totalSeconds = 0;
  if (timerDisplay) timerDisplay.textContent = "Time : 0:00";
}

// Init optionnel
export function initTimer() {
  console.log("Timer initialized");
  // startTimer();
}
