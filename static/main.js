// static/main.js

import { initGlobals } from "./globals.js";
import { initTimer } from "./timer.js";
import { initSound } from "./sound.js";
import { initScore } from "./score.js";
import { initMap } from "./map.js";
import { initBackground } from "./background.js";
import { initGame } from "./game.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Initializing all modules...");

  // 1) Init des globals (optionnel)
  initGlobals();

  // 2) Init Timer
  initTimer();

  // 3) Init Son
  initSound();

  // 4) Init Scoreboard
  initScore();

  // 5) Init Map
  initMap();

  // 6) Init Background (animation)
  initBackground();

  // 7) Init Game Tetris
  initGame();

  console.log("All modules initialized. Game should be running!");
});
