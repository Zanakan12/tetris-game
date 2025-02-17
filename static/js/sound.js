// static/sound.js
let soundbox = document.getElementsByName("sound");
let sound = new Audio("/static/song/base_sound.mp3");
let value= true;
sound.loop = true;

// Fonction principale pour gérer les sons
export function controlSound(action) {
  if (!value) action = "stop" 
    switch (action) {
      case "play":
        sound.play();
        break;
      case "pause":
        sound.pause();
        break;
      case "stop":
        sound.pause();
        sound.currentTime = 0;
        break;
      case "remove": {
        let removeSound = new Audio("/static/song/remove.mp3");
        removeSound.play();
        break;
      }
      case "collision": {
        let collision = new Audio("/static/song/collision.mp3");
        collision.play();
        break;
      }
      case "down": {
        let down = new Audio("/static/song/down.mp3");
        down.play();
        break;
      }
      case "typeWriter": {
        let typeWriter = new Audio("/static/song/typewriter.wav");
        typeWriter.play();
        break;
      }
      case "rotate": {
        let rotate = new Audio("/static/song/rotate.wav");
        rotate.play();
        break;
      }
      case "damage": {
        let damage = new Audio("/static/song/damage.mp3");
        damage.play();
        break;
      }
      case "lrMove": {
        let lr = new Audio("/static/song/lrMove.mp3");
        lr.play();
        break;
      }
      case "down": {
        let down = new Audio("/static/song/down.mp3");
        down.play();
        break;
      }
      default:
        break;
    }
}

// Gestion du checkbox "sound"
function manageSoundCheckbox() {
  soundbox.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        value = true;
        console.log("true")
      } else {
        value = false;
        console.log("here")
      }
    });
  });
}

// Init
export function initSound() {
  console.log("Sound system initialized");
  manageSoundCheckbox();
}
