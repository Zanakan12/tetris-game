let soundbox = document.querySelectorAll("[name='sound']");
let sound = new Audio("/static/sound/base_sound.mp3");
sound.loop = true;
let value = true;
let userInteracted = false;

// 🔹 Déclencher une interaction utilisateur pour activer l'audio
function enableAudio() {
  if (!userInteracted) {
    let silentAudio = new Audio("/static/sound/silent.wav"); // Un fichier silencieux de 1s
    silentAudio.play().catch(() => {}); // Joue un son vide pour débloquer l'audio
    userInteracted = true;
  }
}

// 🔹 Écouter la première interaction utilisateur
document.addEventListener("click", enableAudio);
document.addEventListener("keydown", enableAudio);

// 🔹 Fonction principale pour gérer les sons
export function controlSound(action) {
  if (!userInteracted) return; // 🔹 Empêcher l'audio si aucune interaction utilisateur

  if (!value) action = "stop";

  switch (action) {
    case "play":
      sound.play().catch((err) => console.error("Erreur lecture son:", err));
      break;
    case "pause":
      sound.pause();
      break;
    case "stop":
      sound.pause();
      sound.currentTime = 0;
      break;
    case "remove":
      playEffect("remove.mp3", 0.3);
      break;
    case "collision":
      playEffect("collision.mp3");
      break;
    case "down":
      playEffect("down.mp3", 0.1);
      break;
    case "typeWriter":
      playEffect("typewriter.wav", 0.3);
      break;
    case "rotate":
      playEffect("rotate.wav");
      break;
    case "damage":
      playEffect("damage.mp3");
      break;
    case "lrMove":
      playEffect("lrMove.mp3");
      break;
    default:
      console.warn("Aucun son associé à :", action);
      break;
  }
}

// 🔹 Fonction utilitaire pour jouer un son d'effet
function playEffect(filename, volume = 1.0) {
  let audio = new Audio(`/static/sound/${filename}`);
  audio.volume = volume;
  audio.play().catch((err) => console.error("Erreur lecture son:", err));
}

// 🔹 Gestion du checkbox "sound"
function manageSoundCheckbox() {
  soundbox.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      value = checkbox.checked;
      console.log(value ? "Son activé" : "Son désactivé");
    });
  });
}

// 🔹 Init
export function initSound() {
  console.log("🔊 Sound system initialized");
  manageSoundCheckbox();
}
