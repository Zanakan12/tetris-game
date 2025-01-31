// Code complet pour un jeu Tetris affichant les lettres sur la grille
const apiBaseUrl = "http://localhost:8080/api/scores";
let timer = "";
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
document.addEventListener("DOMContentLoaded", () => {
  let score = 0;
  let lastDropTime = 0; // Dernier moment où un bloc est descendu
  let isPaused = true; // État du jeu
  let dropInterval = 700; // Intervalle de descente (en ms)

  // Afficher les données
  const grid = document.querySelector("#grid");
  const scoreDisplay = document.querySelector("#score");
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

    // Vérifier que la cellule n'est pas déjà prise
    if (!square.classList.contains("taken")) {
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
            return "";
        }
      })();
    }
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

  
  // Déplacement vers le bas
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
   
    draw();
    freeze();
    endGame();
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
        console.log("⏳ Attente pour un dernier déplacement...");
        
        setTimeout(() => {
          // Vérifier si le joueur a réussi à bouger la pièce
          if (
            current.some((index) =>
              squares[currentPosition + index + width]?.classList.contains("taken")
            )
          ) {
            console.log("🛑 Bloc figé !");
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
    let right= 0;
    let left=0;
    current.forEach((index) => {
      if ((currentPosition + index) % width === width - 1) {
        right++
      }else if ((currentPosition + index) % width ===0) {
        left++
      }
    });
    
    //permettre un cycle infini de rotation sans if
    const nextRotation =
      (currentRotation + 1) % customTetrominoes[currentLetter].length;
    const next = customTetrominoes[currentLetter][nextRotation];

    const isValidRotation = next.every(
      (index) =>
        (squares[currentPosition + index] && // Vérifie que la cellule existe
          !squares[currentPosition + index].classList.contains("taken")) // Vérifie qu'elle n'est pas prise
    ); 
    
    if (isValidRotation) {
      currentRotation = nextRotation;
      current = next;
    }
    
    if(right>2)currentPosition =currentPosition-(right-2);
    else if((currentPosition+3)%width===0&&currentLetter==="I")currentPosition-=1;
    else if(right>1&&currentLetter==="Z")currentPosition-=1;
    else if (currentLetter==="S"&&(left>1))currentPosition+=1;
    else if (currentLetter==="I"&&(left>1))currentPosition+=1;
    else if (left>1)currentPosition+=1
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
    pauseButton.textContent = isPaused ? "⏯︎" : "⏸︎";
    isPaused ? pauseTimer() : startTimer();
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
  resetButton.addEventListener("click", () => {
    dropInterval =700
    resetTimer();
    resetGrid();
  });

  function resetGrid() {
    isPaused = true;
    for (let i = 0; i < 200; i++) {
      squares[i].classList.remove("block", "taken", ...letters);
      squares[i].textContent = "";
    }

    pauseButton.textContent = "⏯︎";
    resetButton.style.display = "";
    startNewTetromino();
  }

  function endGame() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("taken")
      )
    ) {
      // Demander le nom du joueur et enregistrer son score
      const playerName = prompt(
        "Entrez votre nom pour sauvegarder votre score :"
      );
      pauseTimer();
      if (playerName) {
        submitScore(playerName, score, timer); // Temps par défaut (à adapter)
      }
      // Réinitialiser le jeu
      resetGrid();
      resetTimer();
      dropInterval = 700;
      scoreDisplay.textContent = `Score: ${(score = 0)}`;
      isPaused = true;
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
  async function animate(time) {
    if (!isPaused) {
      const deltaTime = time - lastDropTime;
      if (timer.includes(":15") || timer.includes(":30")) {
        await wait(1000);
        dropInterval -= 100;
      }
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

//-----------------------------------------------------------------------

let currentPage = 1;
const limit = 5;
const tableBody = document.getElementById("scoreTableBody");

document.addEventListener("DOMContentLoaded", function () {
  if (!tableBody) {
    console.error("⛔ ERREUR : `scoreTableBody` introuvable dans l'HTML !");
    return;
  }

  // Gestion des boutons de pagination
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchScores(currentPage);
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    currentPage++;
    fetchScores(currentPage);
  });

  // Charger les scores initiaux
  fetchScores(currentPage);
});

async function submitScore(name, score, time) {
  try {
    const response = await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score: parseInt(score), time }),
    });

    if (response.ok) {
      alert(`${name}, ton score de ${score} a été enregistré !`);
      fetchScores(1); // Mettre à jour le tableau des scores
    } else {
      alert("Erreur lors de l'ajout du score.");
    }
  } catch (error) {
    console.error("Erreur lors de la soumission du score :", error);
  }
}
// Fonction pour récupérer les scores
async function fetchScores(page) {
  try {
    const response = await fetch(`${apiBaseUrl}?page=${page}&limit=${limit}`);
    const scores = await response.json();
    console.log("📊 Scores récupérés :", scores);
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
/*-------------------------------------------------------------------------*/
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
