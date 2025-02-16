// static/score.js
import { apiBaseUrl } from "./globals.js";

let currentPage = 1;
const limit = 5;
const tableBody = document.getElementById("scoreTableBody");

export async function submitScore(name, score, time) {
  try {
    await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score: parseInt(score), time }),
    });
    // Après soumission, on recharge la page 1
    fetchScores(1);
  } catch (error) {
    console.error("Erreur lors de la soumission du score :", error);
  }
}

// Récupère les scores
export async function fetchScores(page) {
  try {
    const response = await fetch(`${apiBaseUrl}?page=${page}&limit=${limit}`);
    const scores = await response.json();
    displayScores(scores);
  } catch (error) {
    console.error("Erreur lors de la récupération des scores :", error);
  }
}

// Affiche les scores dans le tableau
function displayScores(scores) {
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (!scores || scores.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='4'>Aucun score disponible</td></tr>";
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

// Gère la pagination (Prev / Next)
function managePagination() {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        fetchScores(currentPage);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      // Ici on n'a pas forcément de `totalPages` connu.
      // Soit on gère autrement, soit on incrémente simple :
      currentPage++;
      fetchScores(currentPage);
    });
  }
}

// Initialisation
export function initScore() {
  console.log("Scoreboard initialized");
  managePagination();
  // Charger la page 1 au démarrage
  fetchScores(currentPage);
}
