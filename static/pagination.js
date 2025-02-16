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

export async function submitScore(name, score, time) {
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
export async function fetchScores(page) {
  try {
    const response = await fetch(`${apiBaseUrl}?page=${page}&limit=${limit}`);
    const scores = await response.json();
    displayScores(scores);
  } catch (error) {
    console.error("Erreur lors de la récupération des scores :", error);
  }
}

// Fonction pour afficher les scores
export function displayScores(scores) {
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
