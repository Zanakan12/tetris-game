
export function resetGrid() {
  isPaused = true;
  for (let i = 0; i < 200; i++) {
    squares[i].classList.remove("block", "taken", "trap", ...letters);
    squares[i].textContent = "";
  }
  resetButton.style.display = "";
  startNewTetromino();
}

// --- Fin de partie ---
export function endGame(squares,current,currentPosition) {
  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    ) ||
    lives < 1
  ) {
    pauseTimer();
    showPrompt().then((playerName) => {
      if (playerName) {
        submitScore(playerName, score, timer);
      }
    });
    resetGrid();
    resetGame();
  }
}

const buttonPromptCancel = document.getElementById("btn-cancel");
buttonPromptCancel.addEventListener("click", () => {
  closePrompt();
});

export function closePrompt() {
  document.getElementById("customPrompt").classList.remove("active");
}

export function resetGame() {
  lives = 3;
  loadMap(maps[mapsName[0]]);
  loadMap(maps[mapsName[mapPosition]]);
  pauseButton.style.backgroundImage = "url('static/image/playBouton.svg')";
  let echec =
    "Dommage tu n'es qu'un simple humain, tu n'as pas pu sauver Damso de la misère";
  resetTimer();
  typeWriter(echec, "story-text", 100);
  dropInterval = 500;
  scoreDisplay.textContent = `Score: ${(score = 0)}`;
  manageLives(lives);
}
