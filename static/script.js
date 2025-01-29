// Code complet pour un jeu Tetris affichant les lettres sur la grille
document.addEventListener("DOMContentLoaded", () => {
  let score = 0;
  let bestScore = 0;
  let lastTime = 0; // Dernière fois que la fonction a été appelée
  let lastDropTime = 0; // Dernier moment où un bloc est descendu
  let isPaused = true; // État du jeu

  const dropInterval = 700; // Intervalle de descente (en ms)

  // Afficher les données
  const grid = document.querySelector("#grid");
  const scoreDisplay = document.querySelector("#score");
  const bestScoreDisplay = document.querySelector("#best-score");
  // const rankDisplay = document.getElementById("rank");

  // Création de la grille (10x20 + 10 cellules invisibles pour les collisions)
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    grid.appendChild(cell);
  }

  // Ajouter une classe spéciale aux 10 dernières cellules pour le style
  for (let i = 0; i < 10; i++) {
    const cell = document.createElement("div");
    cell.classList.add("taken", "bottom-line"); // Ajoute une nouvelle classe "bottom-line"
    grid.appendChild(cell);
  }

  const squares = Array.from(document.querySelectorAll("#grid div"));
  const width = 10;

  // Définition des Tetrominos personnalisés (lettres)
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

  const letters = Object.keys(customTetrominoes);
  let currentPosition = 4;
  let currentRotation = 0;
  let random = Math.floor(Math.random() * letters.length);
  let currentLetter = letters[random];
  let current = customTetrominoes[currentLetter][currentRotation];

  // Dessiner le Tetromino (lettre)
  function draw() {
    current.forEach((index) => {
      const square = squares[currentPosition + index];
      square.classList.add("block", currentLetter); // Ajoute la classe de la lettre
      square.textContent = (() => {
        switch (currentLetter) {
          case "J":
            return "🟥";
          case "T":
            return "🟩";
          case "I":
            return "🟪";
          case "O":
            return "🟨";
          case "L":
            return "🟧";
          case "Z":
            return "🟦";
          case "S":
            return "🟫";
          default:
            return;
        }
      })();
    });
  }

  // Effacer le Tetromino (lettre)
  function undraw() {
    current.forEach((index) => {
      const position = currentPosition + index;
      if (squares[position]) {
        // Vérifie si la cellule existe
        squares[position].classList.remove("block", currentLetter); // Supprime les classes
        squares[position].textContent = ""; // Supprime la lettre
      }
    });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // Déplacement vers le bas
  async function moveDown() {
    if (!isPaused) {
      undraw();
      if (current.every((index) => squares[currentPosition + index + width])) {
        currentPosition += width;
      }
      draw();
      //await wait(3000);
      freeze();
      endGame();
    }
  }

  // Gérer les collisions et geler les blocs
  async function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width]?.classList.contains("taken")
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index]?.classList.add("taken")
      );
      removeLine();
      startNewTetromino();
    }
  }

  // Déplacer à gauche
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );
    if (!isAtLeftEdge) currentPosition -= 1;
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition += 1;
    }
    draw();
  }

  // Déplacer à droite
  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );
    if (!isAtRightEdge) currentPosition += 1;
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      currentPosition -= 1;
    }
    draw();
  }

  // Faire pivoter le Tetromino
  function rotate() {
    undraw();
    const nextRotation =
      (currentRotation + 1) % customTetrominoes[currentLetter].length;
    const next = customTetrominoes[currentLetter][nextRotation];

    const isValidRotation = next.every(
      (index) =>
        squares[currentPosition + index] && // Vérifie que la cellule existe
        !squares[currentPosition + index].classList.contains("taken") // Vérifie qu'elle n'est pas prise
    );

    if (isValidRotation) {
      currentRotation = nextRotation;
      current = next;
    }
    draw();
  }

  // Lancer un nouveau Tetromino (lettre)
  function startNewTetromino() {
    random = Math.floor(Math.random() * letters.length);
    currentLetter = letters[random];
    current = customTetrominoes[currentLetter][currentRotation];
    currentPosition = 4;
    draw();
  }

  const pauseButton = document.getElementById("pause-btn");

  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Play" : "Pause";
  });

  // Contrôles clavier
  document.addEventListener("keydown", (e) => {
    if (isPaused) return; // Bloque les mouvements si le jeu est en pause
    if (e.keyCode === 37) moveLeft();
    else if (e.keyCode === 39) moveRight();
    else if (e.keyCode === 38) rotate();
    else if (e.keyCode === 40) moveDown();
  });

  const resetButton = document.getElementById("reset-btn");
  resetButton.addEventListener("click", resetGrid);

  function resetGrid() {
    isPaused = true;
    for (let i = 0; i < 200; i++) {
      squares[i].classList.remove("block", "taken", ...letters);
      squares[i].textContent = "";
    }

    pauseButton.textContent = "Play";
    resetButton.style.display = "";
    startNewTetromino();
  }

  function endGame() {
    // Vérifier si un Tetromino touche le haut de la grille
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      // Afficher un message de fin de jeu
      setTimeout(() => {
        alert("Game Over! Merci d'avoir joué."); // Afficher un message
      }, 100);

      // Réinitialiser la grille après un court délai
      resetGrid();
      bestScoreDisplay.textContent = `Best score: ${(bestScore = score)}`;
      scoreDisplay.textContent = `score: ${(score = 0)}`;
      pauseButton.textContent = "restart";
      resetButton.style.display = "none";
      isPaused = !isPaused;
    }
  }

  function removeLine() {
    for (let i = 0; i < 200; i += width) {
      const row = Array.from({ length: width }, (_, j) => i + j);

      // Vérifier si toute la ligne est prise
      if (row.every((index) => squares[index]?.classList.contains("taken"))) {
        // Supprimer la ligne (effacer classes et contenu)
        row.forEach((index) => {
          squares[index].classList.remove("taken", "block", ...letters);
          squares[index].textContent = "";
        });

        // Faire descendre toutes les lignes au-dessus
        for (let j = i - 1; j >= 0; j--) {
          if (squares[j].classList.contains("taken")) {
            squares[j + width].classList.add(
              "taken",
              ...Array.from(squares[j].classList)
            );
            squares[j + width].textContent = squares[j].textContent;

            squares[j].classList.remove("taken", "block", ...letters);
            squares[j].textContent = "";
          }
        }

        // Faire tomber les blocs détachés
        scoreDisplay.textContent = `score: ${(score += 10)}`;
        dropFloatingBricks();
      }
    }
  }

  function dropFloatingBricks() {
    // Parcourir la grille de bas en haut, colonne par colonne
    for (let y = 18; y >= 0; y--) {
      // Ignorer la dernière ligne
      for (let x = 0; x < width; x++) {
        const index = y * width + x;

        // Vérifier si un bloc est flottant
        if (
          squares[index].classList.contains("taken") &&
          !squares[index + width]?.classList.contains("taken") // Pas de support en dessous
        ) {
          // Vérifier si le bloc est vraiment flottant
          const isFloating = isBlockFloating(index);

          if (isFloating) {
            // Faire tomber le bloc
            squares[index + width].classList.add(
              ...Array.from(squares[index].classList)
            );
            squares[index + width].textContent = squares[index].textContent;

            // Vider la cellule d'origine
            squares[index].classList.remove("taken", "block", ...letters);
            squares[index].textContent = "";
          }
        }
      }
    }
  }

  // Fonction pour vérifier si un bloc est flottant
  function isBlockFloating(index) {
    // Vérifie uniquement les blocs dans la grille
    if (index >= 190) return false; // Les blocs sur la dernière ligne ne tombent pas

    // Vérifier les blocs en dessous
    if (squares[index + width]?.classList.contains("taken")) {
      return false; // Bloc soutenu par une cellule en dessous
    }

    // Vérifier les blocs adjacents (gauche et droite)
    const isLeftSupported =
      index % width > 0 && // Pas à l'extrémité gauche
      squares[index - 1]?.classList.contains("taken") &&
      squares[index - 1 + width]?.classList.contains("taken");

    const isRightSupported =
      index % width < width - 1 && // Pas à l'extrémité droite
      squares[index + 1]?.classList.contains("taken") &&
      squares[index + 1 + width]?.classList.contains("taken");

    return !(isLeftSupported || isRightSupported);
  }
  function animate(time) {
    if (!isPaused) {
      const deltaTime = time - lastDropTime;

      if (deltaTime > dropInterval) {
        moveDown();
        lastDropTime = time;
      }
    }

    // Continuer l'animation
    requestAnimationFrame(animate);
  }

  // Déplacement automatique
  requestAnimationFrame(animate);
});
