// --- Création de la grille (10x20 + 10 cellules invisibles pour les collisions) ---
export function creatGrid() {
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
}
