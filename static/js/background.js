// static/background.js

const bg = document.getElementById("tetromino-background");
let intervalId = null;

// Définition des Tétrominos (formes en matrices simples)
const tetrominos = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J
];

// Crée un tétrimino qui tombe
function createTetromino() {
  if (!bg) return;

  const tetromino = document.createElement("div");
  tetromino.classList.add("tetromino");

  const shape = tetrominos[Math.floor(Math.random() * tetrominos.length)];

  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const block = document.createElement("div");
        block.classList.add("block");
        block.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
        block.style.gridColumn = x + 1;
        block.style.gridRow = y + 1;
        tetromino.appendChild(block);
      }
    });
  });

  // Position aléatoire horizontale
  tetromino.style.left = `${Math.random() * window.innerWidth}px`;
  tetromino.style.top = "-50px";

  // Durée aléatoire (5 à 10s)
  tetromino.style.animationDuration = `${Math.random() * 5 + 5}s`;

  // Ajoute au DOM
  bg.appendChild(tetromino);

  // Retire le tetromino après l'animation
  tetromino.addEventListener("animationend", () => {
    tetromino.remove();
  });
}

// Arrête l'animation, supprime les tétriminos
function stopTetrominoes() {
  const allTetrominoes = document.querySelectorAll(".tetromino");
  allTetrominoes.forEach((t) => t.remove());
}

function manageBackgroundCheckbox() {
  let backgroundbox = document.getElementsByName("background");

  backgroundbox.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        if (!intervalId) {
          intervalId = setInterval(createTetromino, 700);
        }
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        stopTetrominoes();
      }
    });
  });
}

// Init
export function initBackground() {
  console.log("Background animation initialized");
  manageBackgroundCheckbox();
}
