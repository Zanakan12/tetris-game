// static/globals.js
import { controlSound, initSound } from "./sound.js";
// URL vers ton backend
export const apiBaseUrl = "http://localhost:8080/api/scores";

// Petite fonction utilitaire
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startIntro() {
  const introContainer = document.createElement("div");
  introContainer.id = "intro-container";
  introContainer.style.position = "fixed";
  introContainer.style.top = "0";
  introContainer.style.left = "0";
  introContainer.style.width = "100%";
  introContainer.style.height = "100%";
  introContainer.style.backgroundColor = "black";
  introContainer.style.display = "flex";
  introContainer.style.flexDirection = "column";
  introContainer.style.justifyContent = "center";
  introContainer.style.alignItems = "center";
  introContainer.style.color = "white";
  introContainer.style.fontSize = "2rem";
  introContainer.style.zIndex = "1000";
  document.body.appendChild(introContainer);

  const title = document.createElement("h1");
  title.textContent = "";
  title.style.fontSize = "4rem";
  title.style.marginBottom = "20px";
  introContainer.appendChild(title);

  const storyText = document.createElement("p");
  storyText.id = "intro-text";
  storyText.style.textAlign = "center";
  storyText.style.width = "80%";
  storyText.style.maxWidth = "600px";
  storyText.style.fontSize = "1.5rem";
  storyText.style.opacity = "0";
  storyText.style.transition = "opacity 2s";
  introContainer.appendChild(storyText);

  const instructions = document.createElement("p");
  instructions.textContent = "Appuie sur ESPACE pour commencer...";
  instructions.style.fontSize = "1.2rem";
  instructions.style.marginTop = "30px";
  instructions.style.opacity = "0";
  instructions.style.transition = "opacity 2s";
  introContainer.appendChild(instructions);

  // 🔹 Bouton Skip
  const skipButton = document.createElement("button");
  skipButton.textContent = "Skip ⏭";
  skipButton.style.position = "absolute";
  skipButton.style.backgroundColor = "black";
  skipButton.style.right = "10%";
  skipButton.style.bottom = "10%";
  skipButton.style.padding = "10px 20px";
  skipButton.style.fontSize = "1.2rem";
  skipButton.style.color = "white";
  skipButton.style.border = "none";
  skipButton.style.cursor = "pointer";
  skipButton.style.opacity = "0";
  skipButton.style.transition = "opacity 1s";
  skipButton.style.zIndex = "1001";
  skipButton.addEventListener("click", startGame);
  introContainer.appendChild(skipButton);

  // Affichage progressif du bouton Skip après 1,5s
  setTimeout(() => {
      skipButton.style.opacity = "1";
  }, 1500);

  // Animation du titre "TETRIS"
  const titleText = "TETRIS";
  let i = 0;
  function typeTitle() {
      if (i < titleText.length) {
          title.textContent += titleText[i];
          controlSound("typeWriter"); // Effet sonore optionnel
          i++;
          setTimeout(typeTitle, 200);
      } else {
          showStory();
      }
  }
  
  // Histoire progressive
  function showStory() {
      const story = [
          "Dans un monde numérique,",
          "les formes s’empilent à l’infini...",
          "Seul un héros peut organiser ce chaos.",
          "Seras-tu à la hauteur du défi ?",
          "Tu es un dieu, fan de Damso, tu utilises une machine",
          "Cette Machine te permet de déplacer les formes et faire des miracles",
          "A chaque niveau, Dam's voit sa vie changé par des evenements inattendus",
          "Mais attention, la vitesse augmente",
      ];
      let j = 0;
      
      function typeStory() {
          if (j < story.length) {
              storyText.textContent = story[j];
              storyText.style.opacity = "1";
              //controlSound("story"); // Effet sonore optionnel
              j++;
              setTimeout(() => {
                  storyText.style.opacity = "0";
                  setTimeout(typeStory, 2000);
              }, 2500);
          } else {
              instructions.style.opacity = "1";
              document.addEventListener("keydown", startGame);
          }
      }
      typeStory();
  }

  function startGame(event) {
      if (event.type === "click" || (event.key && event.key === " ")) {
          document.removeEventListener("keydown", startGame);
          introContainer.style.opacity = "0";
          setTimeout(() => {
              introContainer.remove();
          }, 1000);
      }
  }

  typeTitle();
}

// Fonction d'init optionnelle (si besoin)
export function initGlobals() {
  console.log("Globals initialized");
  initSound();
  startIntro();
}
