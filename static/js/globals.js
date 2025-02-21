// static/globals.js

// URL vers ton backend
export const apiBaseUrl = "http://localhost:8080/api/scores";


// Petite fonction utilitaire
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fonction d'init optionnelle (si besoin)
export function initGlobals() {
  console.log("Globals initialized");
}
