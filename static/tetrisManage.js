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