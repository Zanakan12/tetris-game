// ========== GESTION DU SON ==========
let sound = new Audio("/static/song/base_sound.mp3");
sound.loop = true;

let soundbox = document.getElementsByName("sound");
soundbox.forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      controlSound("play");
    } else {
      controlSound("stop");
    }
  });
});

export function controlSound(action) {
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
    case "remove":
      let remove = new Audio("/static/song/remove.mp3");
      remove.play();
      break;
    case "collision":
      let collision = new Audio("/static/song/collision.mp3");
      collision.play();
    case "down":
      let down = new Audio("/static/song/down.mp3");
      down.play();
      break;
    case "typeWriter":
      let typeWriter = new Audio("/static/song/typewriter.wav");
      typeWriter.play();
  }
}
