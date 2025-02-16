const tryAgain = "réessaie encore tu voir l'avenir sur les cases à droite";
  // --- Bouton de réinitialisation ---

export function showPrompt() {
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

export function closePrompt() {
  document.getElementById("customPrompt").classList.remove("active");
}

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
