import { BODY_PARTS } from "./body-parts.js";
import { createAudioSystem, createBrowserBackend, createBrowserClock } from "./audio.js";
import { renderFaceScene } from "./face-scene.js";
import "./styles.css";

const container = document.getElementById("face-game");
const audio = createAudioSystem({
  backend: createBrowserBackend(),
  clock: createBrowserClock(),
  cooldownMs: 900
});

audio.preload(BODY_PARTS.map((part) => part.voicePath));

renderFaceScene(container, {
  onTap: (part) => {
    audio.play(part.voicePath);
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Service worker registration failures stay silent in development.
    });
  });
}
