// static/game.js

import { pauseTimer, startTimer, resetTimer } from "./timer.js";
import { controlSound } from "./sound.js";
import { submitScore } from "./score.js";
import { resetGrid, loadMap, mapsName, mapPosition } from "./map.js";
import { timer as globalTimer } from "./timer.js";

// --- Variables globales du jeu ---
export let isPaused = true;
let score = 0;
let lives;
const width = 10;
let current;
let currentPosition;
let currentRotation = 0;
let nextPieces = [];
let lastDropTime = 0;
let dropInterval = 500;
let freezeDelay = false;
let random;

// Tétrominos personnalisés (tes lettres)
// --- Définition des Tetrominos personnalisés (lettres) ---
const customTetrominoes = {
  J: [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ],
  T: [
    [1, width, width + 1, width + 2],
    [1, width + 1, width * 2 + 1, width + 2],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ],
  I: [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ],
  O: [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ],
  L: [
    [width + 1, width * 2 + 1, width * 2 + 2, 1],
    [1, 0, width, 2],
    [1, 0, width * 2 + 1, width + 1],
    [width + 1, width + 2, width, 2],
  ],
  Z: [
    [0, 1, width + 1, width + 2],
    [width + 1, 1, width, width * 2],
    [0, 1, width + 1, width + 2],
    [width + 1, 1, width, width * 2],
  ],
  S: [
    [1, 2, width, width + 1],
    [1, width + 1, width + 2, width * 2 + 2],
    [1, 2, width, width + 1],
    [1, width + 1, width + 2, width * 2 + 2],
  ],
};

export const letters = Object.keys(customTetrominoes);
export let squares = [];
const scoreDisplay = document.getElementById("score");
const scoreboard = document.getElementById("scoreboard");
const nextPiecesContainer = document.getElementById("next-pieces-container");
const pauseButton = document.getElementById("pause-toggle-btn");
const pauseMenu = document.getElementById("pause-menu");
const resumeButton = document.getElementById("resume-btn");
export const resetButton = document.getElementById("reset-btn");
const settingMenu = document.getElementById("setting-main");
const settingButton = document.getElementById("setting-btn");
const doneButton = document.getElementById("done");
const quitButton = document.getElementById("quit-btn");
const tryAgain = "réessaie encore tu voir l'avenir sur les cases à droite";
const fpsDisplay = document.getElementById("fps-display");

// -------------------- Fonctions utilitaires --------------------

// Petit typewriter pour l'affichage
function typeWriter(text, elementId, speed = 150) {
  let i = 0;
  let targetElement = document.getElementById(elementId);
  if (!targetElement) return;

  // Vider l'élément avant de commencer
  targetElement.textContent = "";

  // Empêche plusieurs appels successifs
  clearInterval(targetElement.typeWriterInterval);

  targetElement.typeWriterInterval = setInterval(() => {
    if (i < text.length) {
      targetElement.textContent += text[i];
      controlSound("typeWriter");
      i++;
    } else {
      clearInterval(targetElement.typeWriterInterval);
    }
  }, speed);
}

// Gère l'affichage des vies (coeurs)
function manageLives(lifeCount) {
  let liveDisplay = document.getElementById("lives");
  if (!liveDisplay) return;

  liveDisplay.innerHTML = "";
  let maxLives = 3;
  for (let i = 0; i < maxLives; i++) {
    let color = i < lifeCount ? "red" : "gray"; // Active = Red, Lost = Gray
    let svgHeart = `
      <svg width="50" height="50" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 
          2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 
          4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 
          22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
          11.54L12 21.35z"/>
      </svg>`;
    liveDisplay.innerHTML += svgHeart;
  }
}

// Récupérer le symbole d'un Tetromino (lettre) selon qu'on veut un symbole ou un eveji
function getTetrominoSymbol(letter, type) {
  switch (letter) {
    case "J":
      return type === "symbol" ? "⠼" : "🟥";
    case "T":
      return type === "symbol" ? "⠺" : "🟩";
    case "I":
      return type === "symbol" ? "⠸" : "🟪";
    case "O":
      return type === "symbol" ? "∷" : "🟨";
    case "L":
      return type === "symbol" ? "⠧" : "🟧";
    case "Z":
      return type === "symbol" ? "⠞" : "🟦";
    case "S":
      return type === "symbol" ? "⠳" : "🟫";
    default:
      return type === "symbol" ? "✾" : "✳️";
  }
}

// -------------------- Dessiner et effacer le Tetromino --------------------
function draw() {
  current.forEach((index) => {
    const square = squares[currentPosition + index];
    if (square && !square.classList.contains("taken")) {
      square.textContent = getTetrominoSymbol(random, "");
    }
  });
}

function undraw() {
  current.forEach((index) => {
    const square = squares[currentPosition + index];
    if (square) {
      square.classList.remove(random);
      square.textContent = "";
    }
  });
}

// -------------------- Déplacements --------------------
async function moveDown() {
  undraw();
  const newPosition = currentPosition + width;
  const isCollision = current.some((index) =>
    squares[newPosition + index]?.classList.contains("taken")
  );

  if (!isCollision) {
    currentPosition = newPosition;
  }
  trapTouch();
  draw();
  endGame();
  controlSound("down");
  freeze();
}

function moveLeft() {
  undraw();
  const isAtLeftEdge = current.some(
    (index) => (currentPosition + index) % width === 0
  );

  if (!isAtLeftEdge) {
    const newPosition = currentPosition - 1;
    let isCollision = current.some((index) =>
      squares[newPosition + index].classList.contains("taken")
    );
    if (!isCollision) {
      currentPosition = newPosition;
    }
  }
  draw();
  controlSound("lrMove");
  lastDropTime = performance.now();
}

function moveRight() {
  undraw();
  const isAtRightEdge = current.some(
    (index) => (currentPosition + index) % width === width - 1
  );

  if (!isAtRightEdge) {
    const newPosition = currentPosition + 1;
    const isCollision = current.some((index) =>
      squares[newPosition + index].classList.contains("taken")
    );
    if (!isCollision) {
      currentPosition = newPosition;
    }
  }
  draw();
  controlSound("lrMove");
  lastDropTime = performance.now();
}

function rotate() {
  controlSound("rotate");
  undraw();
  let right = 0;
  let left = 0;
  current.forEach((index) => {
    if ((currentPosition + index) % width === width - 1) right++;
    else if ((currentPosition + index) % width === 0) left++;
  });

  const nextRotation = (currentRotation + 1) % customTetrominoes[random].length;
  const next = customTetrominoes[random][nextRotation];

  const isValidRotation = next.every(
    (index) =>
      squares[currentPosition + index] &&
      !squares[currentPosition + index].classList.contains("taken")
  );

  if (isValidRotation) {
    currentRotation = nextRotation;
    current = next;
  }

  if (right > 2) currentPosition = currentPosition - (right - 2);
  else if ((currentPosition + 3) % width === 0 && random === "I")
    currentPosition -= 1;
  else if (right > 1 && random === "Z") currentPosition -= 1;
  else if (random === "S" && left > 1) currentPosition += 1;
  else if (random === "I" && left > 1) currentPosition += 1;
  else if (left > 1) currentPosition += 1;

  draw();
}

// -------------------- Geler (freeze) le Tetromino --------------------
function freeze() {
  if (
    current.some((index) =>
      squares[currentPosition + index + width]?.classList.contains("taken")
    )
  ) {
    if (!freezeDelay) {
      freezeDelay = true;
      setTimeout(() => {
        if (
          current.some((index) =>
            squares[currentPosition + index + width]?.classList.contains(
              "taken"
            )
          )
        ) {
          current.forEach((index) =>
            squares[currentPosition + index]?.classList.add("taken")
          );
          removeLine();
          startNewTetromino();
        }
        freezeDelay = false;
      }, 300);
      return;
    }
  }
}

// -------------------- Toucher un piège (trap) --------------------
function trapTouch() {
  let livesLost = 0;
  current.forEach((index) => {
    const targetIndex = currentPosition + index;
    if (squares[targetIndex]?.classList.contains("trap")) {
      squares[targetIndex].classList.remove("trap");
      squares[targetIndex].textContent = "";
      controlSound("damage");
      livesLost++;
    }
  });

  if (livesLost > 0) {
    lives -= livesLost;
    manageLives(lives);
  }
}

// -------------------- Gestion d'une nouvelle pièce --------------------
export function startNewTetromino() {
  // On prend la prochaine de la liste
  random = nextPieces.shift();
  // On ajoute une nouvelle aléatoire
  nextPieces.push(letters[Math.floor(Math.random() * letters.length)]);

  currentRotation = 0;
  current = customTetrominoes[random][currentRotation];
  currentPosition = 3;
  updateNextPieces();
  draw();
}

// Mettre à jour l'affichage des 3 prochaines pièces
function updateNextPieces() {
  for (let i = 0; i < 3; i++) {
    const nextPieceDiv = document.getElementById(`next-piece-${i + 1}`);
    if (!nextPieceDiv) continue;

    nextPieceDiv.className = "next-piece"; // reset classes
    if (nextPieces && nextPieces[i]) {
      const pieceType = nextPieces[i];
      nextPieceDiv.classList.add(pieceType);
      nextPieceDiv.textContent = getTetrominoSymbol(pieceType, "symbol");
    } else {
      nextPieceDiv.textContent = "";
    }
  }
}

// -------------------- Gestion du menu pause, etc. --------------------
function togglePause() {
  isPaused = !isPaused;
  scoreboard.classList.add("overlay");
  nextPiecesContainer.classList.add("overlay");

  if (isPaused) {
    pauseMenu.classList.add("active");
    pauseMenu.classList.remove("hidden");
    pauseTimer();
    controlSound("pause");
  } else {
    pauseMenu.classList.remove("active");
    pauseMenu.classList.add("hidden");
    startTimer();
    controlSound("play");
  }
}

// -------------------- Fin de partie --------------------
function endGame() {
  // 1) Vérifier collision en haut
  let end = false;
  let currentScore = 0;
  for (let i = 20; i < 29; i++) {
    if (squares[i].classList.contains("taken")) {
      end = true;
      currentScore = score;
      break;
    }
  }

  // 2) Vérifier si plus de vies
  if (lives < 1 || end) {
    pauseTimer();
    isPaused = true;
    showPrompt().then((playerName) => {
      if (playerName) {
        submitScore(playerName, currentScore, globalTimer);
      }
    });
  }
}

export function showPrompt() {
  return new Promise((resolve) => {
    const promptEl = document.getElementById("customPrompt");
    if (!promptEl) return resolve("Player1");

    scoreboard.classList.add("overlay");
    nextPiecesContainer.classList.add("overlay");
    pauseButton.classList.add("overlay");

    promptEl.classList.add("active");
    const buttonPromptConfirm = document.getElementById("btn-confirm");
    const buttonPromptCancel = document.getElementById("btn-cancel");
    const playerNameInput = document.getElementById("playerNameInput");

    buttonPromptConfirm.addEventListener(
      "click",
      () => {
        const playerName = playerNameInput.value;
        scoreboard.classList.remove("overlay");
        nextPiecesContainer.classList.remove("overlay");
        pauseButton.classList.remove("overlay");

        closePrompt();
        resolve(playerName || "Player1");
      },
      { once: true }
    );

    buttonPromptCancel.addEventListener("click", () => {
      scoreboard.classList.remove("overlay");
      nextPiecesContainer.classList.remove("overlay");
      pauseButton.classList.remove("overlay");
      closePrompt();
    });
  });
}

async function closePrompt() {
  const promptEl = document.getElementById("customPrompt");
  if (promptEl) {
    promptEl.classList.remove("active");
  }
  resetGame();
  resetGrid();
}

async function resetGame() {
  lives = 3;
  pauseButton.style.backgroundImage = "url('static/image/playBouton.svg')";
  manageLives(lives);
  loadMap(mapsName[mapPosition]); // Recharge la map mis dans les paramètres.
  let echec = "Dommage tu n'es qu'un simple humain...";
  resetTimer();
  typeWriter(echec, "story-text", 100);
  dropInterval = 500;
  score = 0;
  currentPosition = 3;
  if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
}

// -------------------- Suppression des lignes --------------------
function removeLine() {
  for (let i = 0; i < 230; i += width) {
    const row = Array.from({ length: width }, (_, j) => i + j);
    if (row.every((index) => squares[index]?.classList.contains("taken"))) {
      controlSound("remove");
      showStory(score);
      row.forEach((index) => {
        squares[index].classList.remove("taken", "block", ...letters);
        squares[index].textContent = "";
      });
      // Faire descendre tout
      for (let j = i - 1; j >= 0; j--) {
        if (squares[j].classList.contains("taken")) {
          squares[j + width].classList.add(
            "taken",
            ...Array.from(squares[j].classList).filter((c) => c !== "taken")
          );
          squares[j + width].textContent = squares[j].textContent;
          squares[j].classList.remove("taken", "block", ...letters);
          squares[j].textContent = "";
        }
      }
      if (scoreDisplay) scoreDisplay.textContent = `score: ${(score += 10)}`;
      dropFloatingBricks();
    }
  }
}

// Tomber les briques “flottantes”
function dropFloatingBricks() {
  for (let y = 18; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (
        squares[index].classList.contains("taken") &&
        !squares[index + width]?.classList.contains("taken")
      ) {
        if (isBlockFloating(index)) {
          squares[index + width].classList.add(
            ...Array.from(squares[index].classList)
          );
          squares[index + width].textContent = squares[index].textContent;
          squares[index].classList.remove("taken", "block", ...letters);
          squares[index].textContent = "";
        }
      }
    }
  }
}

function isBlockFloating(index) {
  if (index >= 190) return false;
  if (squares[index + width]?.classList.contains("taken")) {
    return false;
  }
  const isLeftSupported =
    index % width > 0 &&
    squares[index - 1]?.classList.contains("taken") &&
    squares[index - 1 + width]?.classList.contains("taken");

  const isRightSupported =
    index % width < width - 1 &&
    squares[index + 1]?.classList.contains("taken") &&
    squares[index + 1 + width]?.classList.contains("taken");

  return !(isLeftSupported || isRightSupported);
}

// -------------------- Histoire/Damso / Story --------------------
function showStory(sc) {
  const levels = {
    1: "Damso trouve un billet de 5$ pour un repas chaud. 💵",
    2: "Damso trouve un briquet pour faire du feu. 🔥",
    3: "Damso trouve un logement contre service. 🏠",
    4: "Damso trouve un micro et une enceinte. 🎤",
    5: "Damso signe un premier contrat avec Booba. 🎼",
    6: "Damso enregistre son premier morceau en studio. 🎧",
    7: "Damso gagne en popularité et sort son premier album. 📀",
    8: "Damso reçoit un disque d’or pour son album. 🏆",
    9: "Damso devient une star internationale. 🌍",
    10: "Damso marque l’histoire du rap ! 👑",
  };
  const bottomLineCells = document.querySelectorAll(".bottom-line");
  let level;
  if (sc < 20) level = 1;
  else if (sc < 40) level = 2;
  else if (sc < 60) level = 3;
  else if (sc < 80) level = 4;
  else if (sc < 100) level = 5;
  else if (sc < 120) level = 6;
  else if (sc < 140) level = 7;
  else if (sc < 160) level = 8;
  else if (sc < 180) level = 9;
  else level = 10;

  typeWriter(levels[level], "story-text", 100);

  bottomLineCells.forEach((cell) => {
    cell.textContent = levels[level]?.slice(-2) || "⭐";
  });
}

// -------------------- Boucle d'animation (60 FPS) --------------------
let frameCount = 0;
let lastFpsUpdate = performance.now();
let fps = 0;
let showFps = false;

function animate(time) {
  if (!isPaused) {
    let deltaTime = time - lastDropTime;
    if (time - lastFpsUpdate >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFpsUpdate = time;
      if (showFps && fpsDisplay) fpsDisplay.textContent = `FPS: ${fps}`;
    }
    frameCount++;

    if (deltaTime > dropInterval) {
      moveDown();
      lastDropTime = time;
    }
  }
  requestAnimationFrame(animate);
}

// Gère le checkbox "fps"
function manageFpsCheckbox() {
  const fpsCheckbox = document.getElementsByName("fps");
  fpsCheckbox.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      showFps = checkbox.checked;
      if (!showFps && fpsDisplay) fpsDisplay.textContent = "";
    });
  });
}

// -------------------- Initialise tout le jeu --------------------
export function initGame() {
  console.log("Game initialized");
  // 1) Créer la grille (200 + 10)

  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  if (grid) {
    for (let i = 0; i < 30; i++) {
      const cell = document.createElement("div");
      cell.style.backgroundRepeat = "no-repeat"; // No repeating of the image
      cell.style.backgroundSize = "cover"; // Make the image fill the container
      cell.style.backgroundPosition = "center";
      cell.classList.add("invisible");
      grid.appendChild(cell);
    }

    for (let i = 0; i < 200; i++) {
      const cell = document.createElement("div");

      cell.style.backgroundRepeat = "no-repeat"; // No repeating of the image
      cell.style.backgroundSize = "cover"; // Make the image fill the container
      cell.style.backgroundPosition = "center";
      grid.appendChild(cell);
    }
    for (let i = 0; i < 10; i++) {
      const cell = document.createElement("div");
      cell.classList.add("taken", "bottom-line");
      cell.style.backgroundImage = "url('static/image/BrickBlock.svg')";
      cell.style.backgroundRepeat = "no-repeat"; // No repeating of the image
      cell.style.backgroundSize = "cover"; // Make the image fill the container
      cell.style.backgroundPosition = "center";
      grid.appendChild(cell);
    }
    squares = Array.from(grid.querySelectorAll("div"));
  }

  // 2) Initialiser variables
  score = 0;
  lives = 3;
  manageLives(lives);
  if (scoreDisplay) scoreDisplay.textContent = "Score: 0";

  // 3) Initialiser Next Pieces
  nextPieces = [];
  for (let i = 0; i < 3; i++) {
    nextPieces.push(letters[Math.floor(Math.random() * letters.length)]);
  }
  random = letters[Math.floor(Math.random() * letters.length)];
  currentRotation = 0;
  current = customTetrominoes[random][currentRotation];
  currentPosition = 3;
  updateNextPieces();
  draw();

  // 4) Gérer les input clavier
  document.addEventListener("keydown", (e) => {
    if (isPaused) return;
    if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowUp") rotate();
    else if (e.key === "ArrowDown") moveDown();
    else if (e.key.toLowerCase() === "p") togglePause();
  });

  // 5) Gérer le bouton pause
  if (pauseButton) {
    pauseButton.style.backgroundImage = "url('static/image/playBouton.svg')";
    pauseButton.addEventListener("click", () => {
      pauseButton.style.backgroundImage = "url('static/image/pauseBouton.svg')";
      if (!isPaused) togglePause();
      else {
        isPaused = false;
        controlSound("play");
        startTimer();
        if (isPaused) controlSound("pause");
      }
      if (isPaused) pauseButton.style.visibility = "hidden";
    });
  }

  // 6) Bouton Resume
  if (resumeButton) {
    resumeButton.addEventListener("click", () => {
      nextPiecesContainer.classList.remove("overlay");
      scoreboard.classList.remove("overlay");
      pauseMenu.classList.remove("active");
      pauseMenu.classList.add("hidden");
      controlSound("play");
      isPaused = false;
      if (pauseButton) pauseButton.style.visibility = "visible";
      startTimer();
    });
  }

  // 7) Bouton Reset
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (pauseButton)
        pauseButton.style.backgroundImage =
          "url('static/image/playBouton.svg')";
      isPaused = true;
      lives = 3;
      score = 0;
      dropInterval = 500;
      controlSound("stop");
      resetTimer();
      resetGrid();
      typeWriter(tryAgain, "story-text", 100);
      if (scoreDisplay) scoreDisplay.textContent = "Score: 0";
      nextPiecesContainer.classList.remove("overlay");
      scoreboard.classList.remove("overlay");
      pauseMenu.classList.remove("active");
      pauseMenu.classList.add("hidden");
      if (pauseButton) {
        pauseButton.style.backgroundImage =
          "url('static/image/playBouton.svg')";
        pauseButton.style.visibility = "visible";
      }
      // On relance le Tetris "à zéro"
      resetGame();
    });
  }

  // 8) Boutons Setting / Done
  if (settingButton) {
    settingButton.addEventListener("click", () => {
      pauseMenu.classList.remove("active");
      pauseMenu.classList.add("hidden");
      settingMenu.style.visibility = "visible";
    });
  }
  if (doneButton) {
    doneButton.addEventListener("click", () => {
      pauseMenu.classList.remove("hidden");
      pauseMenu.classList.add("active");
      settingMenu.style.visibility = "hidden";
      settingMenu.classList.add("active");
    });
  }

  // 9) Bouton Quit
  if (quitButton) {
    quitButton.addEventListener("click", () => {
      window.close();
    });
  }

  // 10) Gérer le checkbox FPS
  manageFpsCheckbox();

  // 11) Lancer l'animation
  requestAnimationFrame(animate);
}
