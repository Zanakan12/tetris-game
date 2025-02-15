// ========== GESTION DU TIMER ==========
let totalSeconds = 0;
let timerInterval = null;
const timerDisplay = document.getElementById("timer");

export function updateTimer() {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  timerDisplay.textContent = `Time : ${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
  totalSeconds++;
  timer = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
  timerDisplay.textContent = "Time : 0:00";
}