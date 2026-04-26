import { BODY_PARTS } from "./body-parts.js";

const IDLE_HINT_DELAY_MS = 2400;
const HINT_PAUSE_AFTER_TAP_MS = 4200;
const HINT_INTERVAL_MS = 1600;

export function renderFaceScene(container, { onTap } = {}) {
  container.innerHTML = "";
  const scene = document.createElement("section");
  scene.className = "face-scene";

  const frame = document.createElement("div");
  frame.className = "face-frame";

  const img = document.createElement("img");
  img.className = "face-image";
  img.src = "assets/images/natan-face.png";
  img.alt = "";
  frame.appendChild(img);

  const partEls = new Map();
  for (const part of BODY_PARTS) {
    const target = document.createElement("button");
    target.className = "part-target";
    target.dataset.id = part.id;
    target.setAttribute("aria-label", part.englishWord);
    setBox(target, part.zone);

    const highlight = document.createElement("span");
    highlight.className = "part-highlight";
    setBox(highlight, part.highlight);
    frame.appendChild(highlight);

    const handle = (event) => {
      event.preventDefault();
      triggerPart(part, highlight, frame);
      idle.notifyTap();
      if (onTap) onTap(part);
    };
    target.addEventListener("touchstart", handle, { passive: false });
    target.addEventListener("click", handle);

    frame.appendChild(target);
    partEls.set(part.id, { target, highlight });
  }

  scene.appendChild(frame);
  container.appendChild(scene);

  const idle = createIdleScheduler([...partEls.values()]);
  idle.start();
  return container;
}

function setBox(el, box) {
  el.style.left = `${box.left}%`;
  el.style.top = `${box.top}%`;
  el.style.width = `${box.width}%`;
  el.style.height = `${box.height}%`;
}

function triggerPart(part, highlight, frame) {
  highlight.classList.remove("is-active", "pulse-hint");
  void highlight.offsetWidth;
  highlight.classList.add("is-active");
  setTimeout(() => highlight.classList.remove("is-active"), 750);

  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.style.left = `${part.highlight.left + part.highlight.width / 2}%`;
  sparkle.style.top = `${part.highlight.top + part.highlight.height / 2}%`;
  frame.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 1300);
}

function createIdleScheduler(parts) {
  let cursor = 0;
  let timer = null;

  function pulseNext() {
    const { highlight } = parts[cursor % parts.length];
    cursor += 1;
    highlight.classList.remove("pulse-hint");
    void highlight.offsetWidth;
    highlight.classList.add("pulse-hint");
    setTimeout(() => highlight.classList.remove("pulse-hint"), 1500);
  }

  function loop() {
    pulseNext();
    timer = setTimeout(loop, HINT_INTERVAL_MS);
  }

  return {
    start() {
      clearTimeout(timer);
      timer = setTimeout(loop, IDLE_HINT_DELAY_MS);
    },
    notifyTap() {
      clearTimeout(timer);
      timer = setTimeout(loop, HINT_PAUSE_AFTER_TAP_MS);
    }
  };
}
