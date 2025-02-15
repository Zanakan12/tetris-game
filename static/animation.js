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

export function animate(time) {
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
