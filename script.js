// Code complet pour un jeu Tetris affichant les lettres sur la grille
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#grid");

  // Création de la grille (10x20 + 10 cellules invisibles pour les collisions)
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    grid.appendChild(cell);
  }
  for (let i = 0; i < 10; i++) {
    const cell = document.createElement("div");
    cell.classList.add("taken");
    grid.appendChild(cell);
  }

  const squares = Array.from(document.querySelectorAll("#grid div"));
  const width = 10;

  // Définition des Tetrominos personnalisés (lettres)
  const customTetrominoes = {
    L: [
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
          case "L":
            return "🟥";
          case "T":
            return "🟩";
          case "I":
            return "🟪";
          case "O":
            return "🟨";
          default:
            return ""; // Option par défaut si aucune correspondance
        }
      })();
    });
  }

  // Effacer le Tetromino (lettre)
  function undraw() {
    console.log(current);
    current.forEach((index) => {
      const square = squares[currentPosition + index];
      square.classList.remove("block", currentLetter); // Supprime la classe de la lettre
      square.textContent = ""; // Supprime la lettre
    });
  }

  // Déplacement vers le bas
  function moveDown() {
    if (!isPaused) {
      // Si le jeu n'est pas en pause
      resetButton.style.display = "";
      undraw();
      currentPosition += width;
      draw();
      freeze();
      endGame(); // Vérifier si le jeu est terminé après chaque déplacement
    }
  }

  // Gérer les collisions et geler les blocs
  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains("taken")
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken")
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

    // Vérifiez si la rotation est possible
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

  let isPaused = false;
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
    for (let i = 0; i < 200; i++) {
      squares[i].classList.remove("block", "taken", ...letters);
      squares[i].textContent = "";
    }
    isPaused = false;
    pauseButton.textContent = "Pause";
    resetButton.style.display = "block";
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
      pauseButton.textContent = "restart";
      resetButton.style.display = "none";
      isPaused = !isPaused;
    }
  }

  function removeLine() {
    for (let i = 0; i < 199; i += width) {
      const row = Array.from({ length: width }, (_, j) => i + j);
  
      // Vérifier si la ligne est complète
      if (row.every((index) => squares[index].classList.contains("taken"))) {
        // Supprimer les blocs de la ligne
        row.forEach((index) => {
          squares[index].classList.remove("taken", "block", ...letters);
          squares[index].textContent = "";
        });
  
        // Faire descendre toutes les lignes au-dessus
        const squaresAbove = squares.splice(0, i); // Enlever les lignes au-dessus
        squares = [...Array(width).fill(null), ...squaresAbove, ...squares.slice(i)]; // Reconstituer la grille
  
        // Recréer la grille visuellement
        const fragment = document.createDocumentFragment();
        squares.forEach((cell) => fragment.appendChild(cell));
        grid.innerHTML = ""; // Réinitialiser la grille
        grid.appendChild(fragment); // Réinsérer les cellules
      }
    }
  }
  

  // Lancer le premier Tetromino
  startNewTetromino();

  // Déplacement automatique
  setInterval(moveDown, 1000);
});
