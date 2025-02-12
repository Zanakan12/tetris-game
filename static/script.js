// ========== VARIABLES GLOBALES & FONCTIONS UTILITAIRES ==========
const apiBaseUrl = "http://localhost:8080/api/scores";
let timer = "";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========== LOGIQUE DU JEU TETRIS ==========
document.addEventListener("DOMContentLoaded", () => {
  // --- Variables du jeu ---
  let score = 0;
  let lives = 3;
  let lastDropTime = 0; // Dernier moment où un bloc est descendu
  let isPaused = true; // État du jeu
  let dropInterval = 500; // Intervalle de descente (en ms)
  const scoreboard = document.getElementById("scoreboard");
  const nextPiecesContainer = document.getElementById("next-pieces-container");

  const prevMap = document.getElementById("prevMap");
  const nextMap = document.getElementById("nextMap");
  const map = document.getElementById("map");

  map.textContent = "collisé";
  prevMap.style.backgroundImage = "url('static/image/prevMap.svg')";
  nextMap.style.backgroundImage = "url('static/image/nextMap.svg')";

  prevMap.addEventListener("click", () => {});

  function manageLives(lives) {
    let liveDisplay = document.getElementById("lives");

    liveDisplay.innerHTML = ""; // Clear previous lives

    let maxLives = 3;

    for (let i = 0; i < maxLives; i++) {
      let color = i < lives ? "red" : "gray"; // Active = Red, Lost = Gray

      let svgHeart = `
              <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
          `;

      liveDisplay.innerHTML += svgHeart;
    }
  }

  manageLives(lives);

  function wallTouch() {
    if (squares[currentPosition].classList.contains("wall")) {
      lives--;
      manageLives(lives);
    }
  }

  // --- Sélection des éléments du DOM ---
  const grid = document.querySelector("#grid");
  const scoreDisplay = document.querySelector("#score");
  // --- Création de la grille (10x20 + 10 cellules invisibles pour les collisions) ---
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    grid.appendChild(cell);
  }
  // Ajout des 10 cellules spéciales en bas (pour le style et les collisions)
  for (let i = 0; i < 10; i++) {
    const cell = document.createElement("div");
    cell.classList.add("taken", "bottom-line");
    cell.textContent = "🧱";
    grid.appendChild(cell);
  }

  const squares = Array.from(document.querySelectorAll("#grid div"));
  const width = 10;

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

  const letters = Object.keys(customTetrominoes);
  let currentPosition = 3;
  let currentRotation = 0;
  let random = Math.floor(Math.random() * letters.length);
  let currentLetter = letters[random];
  let current = customTetrominoes[currentLetter][currentRotation];

  // --- Définition des maps ---
  const maps = {
    // map medium
    collise: [
      0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0,
      0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0,
      0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    // map hard
    stadeFrance: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],

    kaweni: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  };

  function loadMap(mapIndex) {
    const selectedMap = maps.collise;
    for (let i = 0; i < selectedMap.length; i++) {
      if (selectedMap[i] === 1) {
        squares[i].classList.add("wall");
        squares[i].textContent = "💠"; // Mur fixe
      }
    }
  }

  document.getElementById("change-map-btn").addEventListener("click", () => {
    let newMapIndex = "collise";
    resetGrid(); // Réinitialiser la grille
    loadMap(newMapIndex); // Charger la nouvelle map
  });

  // --- Gestion des symboles des Tetrominos ---
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

  // --- Gestion des prochaines pièces ---
  let nextPieces = [];
  for (let i = 0; i < 3; i++) {
    nextPieces.push(letters[Math.floor(Math.random() * letters.length)]);
  }

  function updateNextPieces() {
    for (let i = 0; i < 3; i++) {
      const nextPieceDiv = document.getElementById(`next-piece-${i + 1}`);

      if (!nextPieceDiv) continue; // Vérifie si l'élément existe

      // Supprime toutes les classes précédentes sauf "next-piece"
      nextPieceDiv.className = "next-piece";

      // Vérifie si nextPieces existe et contient une pièce valide
      if (nextPieces && nextPieces[i]) {
        const pieceType = nextPieces[i]; // Exemple : "T", "I", "J", etc.

        // Ajoute la classe correspondant à la pièce
        nextPieceDiv.classList.add(pieceType);

        // Ajoute le symbole de la pièce
        nextPieceDiv.textContent = getTetrominoSymbol(pieceType, "symbol");
      } else {
        nextPieceDiv.textContent = ""; // Vide le contenu si aucune pièce
      }
    }
  }

  updateNextPieces();

  // --- Fonctions de dessin et d'effacement ---
  function draw() {
    current.forEach((index) => {
      const square = squares[currentPosition + index];
      // Vérifier que la cellule n'est pas déjà prise
      if (!square.classList.contains("taken")) {
        // square.classList.add("block", currentLetter); // Ajoute la classe de la lettre
        square.textContent = getTetrominoSymbol(currentLetter, "");
      }
    });
  }

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

  // --- Gestion des déplacements et de la rotation ---
  function moveDown() {
    undraw();
    const newPosition = currentPosition + width;

    // Vérifier si le Tetromino va entrer dans une case "taken"
    const isCollision = current.some((index) =>
      squares[newPosition + index]?.classList.contains("taken")
    );

    if (!isCollision) {
      currentPosition = newPosition;
    }
    endGame();
    draw();
    wallTouch();
    freeze();
  }

  let freezeDelay = false;
  // Gérer les collisions et geler les blocs
  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width]?.classList.contains("taken")
      )
    ) {
      if (!freezeDelay) {
        freezeDelay = true; // Active le délai

        setTimeout(() => {
          // Vérifier si le joueur a réussi à bouger la pièce
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
          freezeDelay = false; // Réinitialise le délai
        }, 300); // Attente de 200ms avant de figer
        return;
      }
    }
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

      isCollision = current.some((index) =>
        squares[newPosition].classList.contains("obstacle")
      );

      if (!isCollision) {
        currentPosition = newPosition;
      }
    }

    draw();

    // Empêcher une descente immédiate après le mouvement
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

    // Empêcher une descente immédiate après le mouvement
    lastDropTime = performance.now();
  }

  // Faire pivoter le Tetromino
  function rotate() {
    undraw();
    let right = 0;
    let left = 0;
    current.forEach((index) => {
      if ((currentPosition + index) % width === width - 1) {
        right++;
      } else if ((currentPosition + index) % width === 0) {
        left++;
      }
    });

    // Permettre un cycle infini de rotation sans if
    const nextRotation =
      (currentRotation + 1) % customTetrominoes[currentLetter].length;
    const next = customTetrominoes[currentLetter][nextRotation];

    const isValidRotation = next.every(
      (index) =>
        squares[currentPosition + index] && // Vérifie que la cellule existe
        !squares[currentPosition + index].classList.contains("taken")
    );

    if (isValidRotation) {
      currentRotation = nextRotation;
      current = next;
    }

    if (right > 2) currentPosition = currentPosition - (right - 2);
    else if ((currentPosition + 3) % width === 0 && currentLetter === "I")
      currentPosition -= 1;
    else if (right > 1 && currentLetter === "Z") currentPosition -= 1;
    else if (currentLetter === "S" && left > 1) currentPosition += 1;
    else if (currentLetter === "I" && left > 1) currentPosition += 1;
    else if (left > 1) currentPosition += 1;
    draw();
  }

  // --- Lancer un nouveau Tetromino ---
  function startNewTetromino() {
    currentLetter = nextPieces.shift(); // Prendre le premier de la liste
    nextPieces.push(letters[Math.floor(Math.random() * letters.length)]); // Ajouter un nouveau

    currentRotation = 0;
    current = customTetrominoes[currentLetter][currentRotation];
    currentPosition = 4;
    updateNextPieces(); // Mettre à jour l'affichage des prochains Tetrominos
    draw();
  }

  // --- Gestion de la pause / reprise ---
  const pauseButton = document.getElementById("pause-toggle-btn");
  pauseButton.style.backgroundImage = "url('static/image/playBouton.svg')";
  // Quand on appuie sur "P", on met en pause/reprend
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "p") {
      togglePause();
    }
  });

  // Quand on clique sur le bouton Pause/Reprendre
  pauseButton.addEventListener("click", () => {
    pauseButton.style.backgroundImage = "url('static/image/pauseBouton.svg')";
    !isPaused ? togglePause() : (isPaused = !isPaused);
    controlSound("play");
    startTimer();
    if (isPaused) pauseButton.style.visibility = "hidden";
    if (isPaused) controlSound("pause");
  });

  const pauseMenu = document.getElementById("pause-menu");
  // Fonction pour basculer l'affichage du menu pause
  function togglePause() {
    isPaused = !isPaused;
    scoreboard.classList.add("overlay");
    nextPiecesContainer.classList.add("overlay");

    if (isPaused) {
      pauseMenu.classList.add("active"); // Affiche le menu
      pauseMenu.classList.remove("hidden"); // Assure qu'il est visible
      pauseTimer(); // Met le timer en pause
      controlSound("pause"); // Joue le son de pause
    } else {
      pauseMenu.classList.remove("active"); // Cache le menu
      pauseMenu.classList.add("hidden"); // Assure qu'il est caché
      startTimer(); // Reprend le timer
      controlSound("play"); // Joue le son de reprise
    }
  }

  const resumeButton = document.getElementById("resume-btn");

  resumeButton.addEventListener("click", () => {
    nextPiecesContainer.classList.remove("overlay");
    scoreboard.classList.remove("overlay");
    pauseMenu.classList.toggle("active");
    isPaused = !isPaused;
    pauseButton.style.visibility = "visible";
    if (!isPaused) startTimer();
  });

  const tryAgain = "réessaie encore tu voir l'avenir sur les cases à droite";
  // --- Bouton de réinitialisation ---
  const resetButton = document.getElementById("reset-btn");
  resetButton.addEventListener("click", () => {
    isPaused = !isPaused;
    typeWriter(tryAgain, "story-text", 100);
    dropInterval = 500;
    controlSound("stop");
    resetTimer();
    resetGrid();
    score = 0;
    scoreDisplay.textContent = "Score: 0";
    nextPiecesContainer.classList.remove("overlay");
    scoreboard.classList.remove("overlay");
    pauseMenu.classList.remove("active");
    pauseMenu.classList.add("hidden");
    pauseButton.style.backgroundImage = "url('static/image/playBouton.svg')";
    pauseButton.style.visibility = "visible";
  });

  const settingMenu = document.getElementById("setting-main");
  const settingButton = document.getElementById("setting-btn");
  const doneButton = document.getElementById("done");

  settingButton.addEventListener("click", () => {
    pauseMenu.classList.remove("active");
    pauseMenu.classList.add("hidden");
    settingMenu.style.visibility = "visible";
  });

  doneButton.addEventListener("click", () => {
    pauseMenu.classList.remove("hidden");
    pauseMenu.classList.add("active");
    settingMenu.style.visibility = "hidden";
    settingMenu.classList.add("active");
  });

  const quitButton = document.getElementById("quit-btn");
  quitButton.addEventListener("click", () => {
    window.close();
  });
  function resetGrid() {
    isPaused = true;
    for (let i = 0; i < 200; i++) {
      squares[i].classList.remove("block", "taken", ...letters);
      squares[i].textContent = "";
    }
    resetButton.style.display = "";
    startNewTetromino();
  }

  // --- Fin de partie ---
  function endGame() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      ) ||
      lives < 1
    ) {
      pauseTimer();
      resetGrid();
      showPrompt().then((playerName) => {
        if (playerName) {
          submitScore(playerName, score, timer);
        }
        lives -= 1;
        manageLives(lives);
        resetGame();
      });
    }
  }

  function showPrompt() {
    return new Promise((resolve) => {
      document.getElementById("customPrompt").classList.add("active");
      const buttonPromptConfirm = document.getElementById("btn-confirm");
      buttonPromptConfirm.addEventListener(
        "click",
        () => {
          const playerName = document.getElementById("playerNameInput").value;
          closePrompt();
          resolve(playerName || "Player1"); // Si vide, utiliser "Player1"
        },
        { once: true }
      ); // Ajout de `{ once: true }` pour éviter plusieurs écoutes
    });
  }

  const buttonPromptCancel = document.getElementById("btn-cancel");
  buttonPromptCancel.addEventListener("click", () => {
    closePrompt();
  });

  function closePrompt() {
    document.getElementById("customPrompt").classList.remove("active");
    resetGame();
  }

  function resetGame() {
    let echec =
      "Dommage tu n'es qu'un simple humain, tu n'as pas pu sauver Damso de la misère";
    resetTimer();
    controlSound("stop");
    typeWriter(echec, "story-text", 100);
    dropInterval = 500;
    scoreDisplay.textContent = `Score: ${(score = 0)}`;
  }

  // --- Suppression des lignes et gestion des briques flottantes ---
  // Variables pour la progression de Dasmso

  function showStory(score) {
    const levels = {
      1: "Damso trouve un billet de 5$ pour un repas chaud.",
      2: "Damso trouve un briquet pour faire du feu.",
      3: "Damso trouve un logement contre service.",
      4: "Damso trouve un micro et une enceinte.",
      5: "Damso est repéré par Booba et signe un premier contrat.",
      6: "Damso enregistre son premier morceau en studio.",
      7: "Damso gagne en popularité et sort son premier album.",
      8: "Damso reçoit un disque d’or pour son album.",
      9: "Damso devient une star internationale et collabore avec de grands artistes.",
      10: "Damso marque l’histoire du rap et inspire une nouvelle génération d’artistes.",
    };

    const icons = {
      1: "💵", // Argent pour acheter un repas
      2: "🔥", // Feu pour survivre
      3: "🏠", // Logement contre service
      4: "🎤", // Micro pour faire de la musique
      5: "🎼", // Signature d’un contrat avec Booba
      6: "🎧", // Studio d'enregistrement
      7: "📀", // Premier album
      8: "🏆", // Disque d’or
      9: "🌍", // Succès international
      10: "👑", // Roi du rap
    };

    const bottomLineCells = document.querySelectorAll(".bottom-line");

    // Déterminer le niveau de progression
    let level;
    if (score >= 0 && score < 20) {
      level = 1;
    } else if (score >= 20 && score < 40) {
      level = 2;
    } else if (score >= 40 && score < 60) {
      level = 3;
    } else if (score >= 60 && score < 80) {
      level = 4;
    } else if (score >= 80 && score < 100) {
      level = 5;
    } else if (score >= 100 && score < 120) {
      level = 6;
    } else if (score >= 120 && score < 140) {
      level = 7;
    } else if (score >= 140 && score < 160) {
      level = 8;
    } else if (score >= 160 && score < 180) {
      level = 9;
    } else {
      level = 10;
    }

    // Mettre à jour le texte affiché
    typeWriter(levels[level], "story-text", 100);

    // Changer les icônes des cellules en fonction du niveau
    bottomLineCells.forEach((cell) => {
      cell.textContent = icons[level] || "⭐"; // Icône par défaut si non définie
    });
  }

  function typeWriter(text, elementId, speed = 150) {
    let i = 0;
    let targetElement = document.getElementById(elementId);

    // Assure-toi de bien vider l'élément AVANT de commencer
    targetElement.textContent = "";

    // Empêche plusieurs appels successifs
    clearInterval(targetElement.typeWriterInterval);

    targetElement.typeWriterInterval = setInterval(() => {
      if (i < text.length) {
        targetElement.textContent += text[i];
        controlSound("typeWriter");
        i++;
      } else {
        clearInterval(targetElement.typeWriterInterval); // Arrête l'animation quand terminé
      }
    }, speed);
  }

  // Intégration avec le jeu Tetris existant
  function removeLine() {
    for (let i = 0; i < 200; i += width) {
      const row = Array.from({ length: width }, (_, j) => i + j);

      // Vérifier si toute la ligne est prise
      if (row.every((index) => squares[index]?.classList.contains("taken"))) {
        // Supprimer la ligne (effacer classes et contenu)
        controlSound("remove");
        showStory(score);
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

        scoreDisplay.textContent = `score: ${(score += 10)}`;
        dropFloatingBricks(); // Appeler la fonction pour suivre la progression
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

  // Vérifier si un bloc est flottant
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

  // --- Boucle d'animation ---
  let lastFrameTime = performance.now();
  let fpsDisplay = document.getElementById("fps-display");
  let frameCount = 0;
  let lastFpsUpdate = performance.now();
  let fps = 0;
  let showFps = false;
  const targetFrameTime = 1000 / 60; // 60 FPS = 16.67 ms par frame

  fpsCheckbox = document.getElementsByName("fps");
  fpsCheckbox.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      showFps = checkbox.checked; // Mettre à jour la variable
      if (!showFps) {
        fpsDisplay.textContent = ""; // Effacer le texte quand c'est désactivé
      }
    });
  });

  function animate(time) {
    let deltaTime = time - lastFrameTime;
    if (isPaused) {
      requestAnimationFrame(animate);
      return;
    }
    // 🔥 Assurer un timing stable à 60 FPS
    if (deltaTime >= targetFrameTime) {
      lastFrameTime = time - (deltaTime % targetFrameTime); // ✅ Correction anti-dérive temporelle

      // 🔥 Calcul des FPS (mise à jour toutes les secondes)
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = time;
        if (showFps) fpsDisplay.textContent = `FPS: ${fps}`;
      }

      // 🔥 Mettre à jour le jeu normalement (déplacement + descente)
      if (time - lastDropTime > dropInterval) {
        moveDown();
        lastDropTime = time;
      }
    }

    requestAnimationFrame(animate);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowUp") rotate();
    else if (e.key === "ArrowDown") moveDown();
  });

  // Lancement de l'animation
  requestAnimationFrame(animate);
});

// ========== GESTION DES SCORES & PAGINATION ==========
let currentPage = 1;
const limit = 5;
const tableBody = document.getElementById("scoreTableBody");

document.addEventListener("DOMContentLoaded", function () {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  let currentPage = 1;
  let totalPages = 5; // Remplace ça par le nombre réel de pages si connu

  nextButton.disabled = true;
  function updatePaginationButtons() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchScores(currentPage);
      updatePaginationButtons();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchScores(currentPage);
      updatePaginationButtons();
    }
  });

  // Charger les scores initiaux et mettre à jour les boutons
  fetchScores(currentPage);
  updatePaginationButtons();
});

async function submitScore(name, score, time) {
  try {
    const response = await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score: parseInt(score), time }),
    });
    fetchScores(1);
  } catch (error) {
    console.error("Erreur lors de la soumission du score :", error);
  }
}

// Fonction pour récupérer les scores
async function fetchScores(page) {
  try {
    const response = await fetch(`${apiBaseUrl}?page=${page}&limit=${limit}`);
    const scores = await response.json();
    displayScores(scores);
  } catch (error) {
    console.error("Erreur lors de la récupération des scores :", error);
  }
}

// Fonction pour afficher les scores
function displayScores(scores) {
  tableBody.innerHTML = ""; // Vider le tableau avant d'ajouter de nouveaux scores

  if (scores.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='4'>Aucun score disponible</td></tr>";
    return;
  }

  scores.forEach((score, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
              <td>${(currentPage - 1) * limit + index + 1}</td>
              <td>${score.name}</td>
              <td>${score.score}</td>
              <td>${score.time}</td>
          `;
    tableBody.appendChild(row);
  });
}

// ========== GESTION DU TIMER ==========
let totalSeconds = 0;
let timerInterval = null;
const timerDisplay = document.getElementById("timer");

function updateTimer() {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  timerDisplay.textContent = `Time : ${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
  totalSeconds++;
  timer = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Démarrer le timer
function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// Mettre en pause
function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Réinitialiser
function resetTimer() {
  pauseTimer();
  totalSeconds = 0;
  timerDisplay.textContent = "Time : 0:00";
}

// ========== GESTION DU SON ==========
let sound = new Audio("/static/song/base_sound.mp3");
sound.loop = true;

let soundbox = document.getElementsByName("sound");
soundbox.forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      controlSound("play");
    } else {
      controlSound("stop");
    }
  });
});

function controlSound(action) {
  switch (action) {
    case "play":
      sound.play();
      break;
    case "pause":
      sound.pause();
      break;
    case "stop":
      sound.pause();
      sound.currentTime = 0;
      break;
    case "remove":
      let remove = new Audio("/static/song/remove.mp3");
      remove.play();
      break;
    case "collision":
      let collision = new Audio("/static/song/collision.mp3");
      collision.play();
    case "down":
      let down = new Audio("/static/song/down.mp3");
      down.play();
      break;
    case "typeWriter":
      let typeWriter = new Audio("/static/song/typewriter.wav");
      typeWriter.play();
  }
}

// ------BackGround-------
document.addEventListener("DOMContentLoaded", () => {
  const bg = document.getElementById("tetromino-background");
  let intervalId = null; // Variable globale pour gérer setInterval

  // Définition des Tétrominos (formes en matrices)
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

  function createTetromino() {
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

    // Position aléatoire
    tetromino.style.left = `${Math.random() * window.innerWidth}px`;
    tetromino.style.top = "-50px";
    tetromino.style.animationDuration = `${Math.random() * 5 + 5}s`;

    bg.appendChild(tetromino);

    // Supprime après l'animation
    tetromino.addEventListener("animationend", () => {
      tetromino.remove();
    });
  }

  function stopTetrominoes() {
    document.querySelectorAll(".tetromino").forEach((tetromino) => {
      tetromino.remove();
    });
  }

  function BackGroundManage() {
    let backgroundbox = document.getElementsByName("background");

    backgroundbox.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          if (!intervalId) {
            intervalId = setInterval(createTetromino, 700); // Démarrer seulement si aucun intervalle actif
          }
        } else {
          if (intervalId) {
            clearInterval(intervalId); // Arrête l'animation
            intervalId = null; // Réinitialise
          }
          stopTetrominoes(); // Supprime les tétriminos affichés
        }
      });
    });
  }

  BackGroundManage();
});
