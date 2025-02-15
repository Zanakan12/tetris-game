// background.js
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

let intervalId = null;

function createTetromino() {
  const bg = document.getElementById("tetromino-background");
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

  tetromino.style.left = `${Math.random() * window.innerWidth}px`;
  tetromino.style.top = "-50px";
  tetromino.style.animationDuration = `${Math.random() * 5 + 5}s`;

  bg.appendChild(tetromino);

  tetromino.addEventListener("animationend", () => {
    tetromino.remove();
  });
}

function stopTetrominoes() {
  document.querySelectorAll(".tetromino").forEach((tetromino) => {
    tetromino.remove();
  });
}

export function backGroundManage() {
  const backgroundbox = document.getElementsByName("background");

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
