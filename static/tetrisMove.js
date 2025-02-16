import { trapTouch } from "./liveManager.js";
import { endGame } from "./manageGame.js";
const width = 10;

export const customTetrominoes = {
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

export const squares = Array.from(document.querySelectorAll("#grid div"));
const letters = Object.keys(customTetrominoes);
let currentPosition = 3;
let currentRotation = 0;
let random = Math.floor(Math.random() * letters.length);
let currentLetter = letters[random];
let current = customTetrominoes[currentLetter][currentRotation];
// --- Gestion des symboles des Tetrominos ---
export function getTetrominoSymbol(letter, type) {
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

export function updateNextPieces() {
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
export function draw() {
  current.forEach((index) => {
    const square = squares[currentPosition + index];
    // Vérifier que la cellule n'est pas déjà prise
    if (!square.classList.contains("taken")) {
      // square.classList.add("block", currentLetter); // Ajoute la classe de la lettre
      square.textContent = getTetrominoSymbol(currentLetter, "");
    }
  });
}

export function undraw() {
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
export function moveDown() {
  undraw();
  const newPosition = currentPosition + width;

  // Vérifier si le Tetromino va entrer dans une case "taken"
  const isCollision = current.some((index) =>
    squares[newPosition + index]?.classList.contains("taken")
  );

  if (!isCollision) {
    currentPosition = newPosition;
  }
  trapTouch(currentPosition,current,squares);
  endGame(squares,current,currentPosition);
  draw();
  freeze();
}

let freezeDelay = false;
// Gérer les collisions et geler les blocs
export function freeze() {
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

export function moveLeft() {
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

export function moveRight() {
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
export function rotate() {
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
export function startNewTetromino() {
  currentLetter = nextPieces.shift(); // Prendre le premier de la liste
  nextPieces.push(letters[Math.floor(Math.random() * letters.length)]); // Ajouter un nouveau

  currentRotation = 0;
  current = customTetrominoes[currentLetter][currentRotation];
  currentPosition = 4;
  updateNextPieces(); // Mettre à jour l'affichage des prochains Tetrominos
  draw();
}

// Intégration avec le jeu Tetris existant
export function removeLine() {
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

export function dropFloatingBricks() {
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
export function isBlockFloating(index) {
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

