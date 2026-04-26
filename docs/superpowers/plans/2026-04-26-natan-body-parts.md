# Natan Body Parts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `natan-body-parts`, a standalone no-fail PWA where Natan taps a close-up face to hear five English body-part words.

**Architecture:** Vanilla ESM modules mirror the proven `safari-de-sons` shape, but the scene is a face map instead of an animal diorama. `body-parts.js` is pure data, `audio.js` owns media playback, `face-scene.js` owns DOM rendering and touch interaction, and `main.js` wires them together synchronously for iOS audio.

**Tech Stack:** Vite, plain HTML/CSS/JS, Node `node:test`, Playwright, ElevenLabs-generated MP3 voice clips, local PWA manifest/service worker.

**Spec:** `docs/superpowers/specs/2026-04-26-natan-body-parts-design.md`

---

## File Structure

- Create `package.json`, `package-lock.json`, `.npmrc`, `.gitignore`, `.env.example`, `vite.config.js`, `index.html`.
- Create `src/body-parts.js` for the five vocabulary items, voice paths, tap-zone geometry, and highlight geometry.
- Create `src/audio.js` from the Safari audio pattern, with cooldown and interruption behavior.
- Create `src/face-scene.js` for rendering the face image, invisible tap zones, idle hint, body-part reactions, and sparkles.
- Create `src/main.js` to preload voice clips, render the scene, and register the service worker.
- Create `src/styles.css` for the face layout, stable landscape viewport, portrait rotate hint, animations, and toddler-safe tap targets.
- Create `scripts/voice-config.mjs`, `scripts/generate-voiceover.mjs`, and `scripts/make-icons.mjs`.
- Create `assets/images/natan-face.png` as the polished face asset.
- Create `assets/voice/eyes.mp3`, `nose.mp3`, `mouth.mp3`, `ears.mp3`, `hair.mp3`.
- Create `public/manifest.webmanifest`, `public/service-worker.js`, `public/icon-192.png`, `public/icon-512.png`, `public/splash-1170x2532.png`.
- Create tests under `tests/unit/` and `tests/e2e/`.

## Task 1: Bootstrap the Vite PWA Shell

**Files:**
- Create: `package.json`
- Create: `.npmrc`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/styles.css`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "natan-body-parts",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build && cp -R assets dist/",
    "preview": "vite preview --host",
    "voiceover:generate": "node scripts/generate-voiceover.mjs",
    "icons:generate": "node scripts/make-icons.mjs",
    "test": "node --test $(find tests/unit -name '*.test.js' | sort)",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "dotenv": "^16.4.5",
    "sharp": "^0.33.5",
    "vite": "^5.4.10"
  }
}
```

Create `.npmrc`:

```text
registry=https://registry.npmjs.org/
```

Create `.gitignore`:

```text
node_modules/
dist/
.env
test-results/
playwright-report/
.DS_Store
```

Create `.env.example`:

```text
ELEVENLABS_API_KEY=
```

- [ ] **Step 2: Create Vite config**

Create `vite.config.js`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: "index.html"
      }
    }
  },
  publicDir: "public",
  server: {
    port: 4174,
    host: true
  },
  preview: {
    port: 4174,
    host: true
  }
});
```

- [ ] **Step 3: Create the HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#f7b267" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Natan Nose" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="apple-touch-icon" href="./icon-192.png" />
    <title>Cadê o Nariz do Natan?</title>
  </head>
  <body>
    <main id="face-game" aria-label="Natan body parts game"></main>
    <div id="rotate-hint" aria-hidden="true">Vire o celular</div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Add temporary boot files**

Create `src/main.js`:

```js
console.log("Natan body parts booted");
```

Create `src/styles.css`:

```css
:root {
  --bg-warm: #f7b267;
  --bg-soft: #ffe8c7;
}

* { box-sizing: border-box; }

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: var(--bg-soft);
  color: #3d2b1f;
  font-family: system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

#face-game {
  min-height: 100vh;
}
```

- [ ] **Step 5: Install and verify the shell**

Run:

```bash
npm install
npm run build
```

Expected: `npm install` creates `package-lock.json`; `npm run build` exits 0 and creates `dist/`.

- [ ] **Step 6: Commit the shell**

Run:

```bash
git add package.json package-lock.json .npmrc .gitignore .env.example vite.config.js index.html src/main.js src/styles.css
git commit -m "Bootstrap Natan body parts PWA shell."
```

## Task 2: Add Body-Part Data with Tests

**Files:**
- Create: `src/body-parts.js`
- Create: `tests/unit/body-parts.test.js`

- [ ] **Step 1: Write the failing body-parts tests**

Create `tests/unit/body-parts.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { BODY_PARTS } from "../../src/body-parts.js";

test("BODY_PARTS exports five body parts", () => {
  assert.ok(Array.isArray(BODY_PARTS));
  assert.equal(BODY_PARTS.length, 5);
});

test("expected body part ids are present", () => {
  const ids = BODY_PARTS.map((part) => part.id).sort();
  assert.deepEqual(ids, ["ears", "eyes", "hair", "mouth", "nose"]);
});

test("each body part has valid geometry and voice data", () => {
  for (const part of BODY_PARTS) {
    assert.equal(typeof part.id, "string");
    assert.equal(typeof part.englishWord, "string");
    assert.equal(typeof part.voicePath, "string");
    assert.ok(part.voicePath.endsWith(`${part.id}.mp3`));
    for (const key of ["left", "top", "width", "height"]) {
      assert.equal(typeof part.zone[key], "number", `${part.id}.zone.${key}`);
      assert.ok(part.zone[key] >= 0 && part.zone[key] <= 100);
    }
    for (const key of ["left", "top", "width", "height"]) {
      assert.equal(typeof part.highlight[key], "number", `${part.id}.highlight.${key}`);
      assert.ok(part.highlight[key] >= 0 && part.highlight[key] <= 100);
    }
  }
});

test("body part ids are unique", () => {
  const ids = BODY_PARTS.map((part) => part.id);
  assert.equal(new Set(ids).size, ids.length);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test
```

Expected: FAIL because `src/body-parts.js` does not exist.

- [ ] **Step 3: Implement body-part data**

Create `src/body-parts.js`:

```js
export const BODY_PARTS = [
  {
    id: "eyes",
    englishWord: "Eyes",
    voicePath: "assets/voice/eyes.mp3",
    zone: { left: 29, top: 30, width: 42, height: 18 },
    highlight: { left: 34, top: 33, width: 32, height: 11 }
  },
  {
    id: "nose",
    englishWord: "Nose",
    voicePath: "assets/voice/nose.mp3",
    zone: { left: 41, top: 43, width: 18, height: 20 },
    highlight: { left: 44, top: 46, width: 12, height: 14 }
  },
  {
    id: "mouth",
    englishWord: "Mouth",
    voicePath: "assets/voice/mouth.mp3",
    zone: { left: 35, top: 58, width: 30, height: 16 },
    highlight: { left: 39, top: 61, width: 22, height: 9 }
  },
  {
    id: "ears",
    englishWord: "Ears",
    voicePath: "assets/voice/ears.mp3",
    zone: { left: 13, top: 35, width: 74, height: 23 },
    highlight: { left: 12, top: 38, width: 76, height: 17 }
  },
  {
    id: "hair",
    englishWord: "Hair",
    voicePath: "assets/voice/hair.mp3",
    zone: { left: 26, top: 8, width: 48, height: 24 },
    highlight: { left: 28, top: 12, width: 44, height: 16 }
  }
];
```

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
npm test
```

Expected: PASS with 4 body-parts tests.

- [ ] **Step 5: Commit data and tests**

Run:

```bash
git add src/body-parts.js tests/unit/body-parts.test.js
git commit -m "Add body part data model."
```

## Task 3: Add Audio System with Tests

**Files:**
- Create: `src/audio.js`
- Create: `tests/unit/audio.test.js`

- [ ] **Step 1: Write audio tests**

Create `tests/unit/audio.test.js` using the Safari audio tests, adjusted to single voice clips:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createAudioSystem } from "../../src/audio.js";

function makeFakeBackend() {
  const calls = [];
  return {
    calls,
    create(src) {
      const el = {
        src,
        playing: false,
        currentTime: 0,
        play: () => {
          el.playing = true;
          calls.push({ op: "play", src });
          return Promise.resolve();
        },
        pause: () => {
          el.playing = false;
          calls.push({ op: "pause", src });
        }
      };
      return el;
    }
  };
}

function makeClock(initial = 0) {
  let now = initial;
  return {
    now: () => now,
    advance: (ms) => {
      now += ms;
    }
  };
}

test("play() plays a clip via the backend", async () => {
  const backend = makeFakeBackend();
  const clock = makeClock();
  const audio = createAudioSystem({ backend, clock, cooldownMs: 900 });
  await audio.play("assets/voice/nose.mp3");
  assert.deepEqual(backend.calls, [{ op: "play", src: "assets/voice/nose.mp3" }]);
});

test("rapid same-source play() within cooldown is ignored", async () => {
  const backend = makeFakeBackend();
  const clock = makeClock();
  const audio = createAudioSystem({ backend, clock, cooldownMs: 900 });
  await audio.play("assets/voice/nose.mp3");
  clock.advance(300);
  await audio.play("assets/voice/nose.mp3");
  assert.equal(backend.calls.filter((c) => c.op === "play").length, 1);
});

test("same-source play() after cooldown plays again", async () => {
  const backend = makeFakeBackend();
  const clock = makeClock();
  const audio = createAudioSystem({ backend, clock, cooldownMs: 900 });
  await audio.play("assets/voice/nose.mp3");
  clock.advance(1000);
  await audio.play("assets/voice/nose.mp3");
  assert.equal(backend.calls.filter((c) => c.op === "play").length, 2);
});

test("different-source play() interrupts current clip", async () => {
  const backend = makeFakeBackend();
  const clock = makeClock();
  const audio = createAudioSystem({ backend, clock, cooldownMs: 900 });
  await audio.play("assets/voice/nose.mp3");
  clock.advance(100);
  await audio.play("assets/voice/mouth.mp3");
  assert.deepEqual(backend.calls.map((c) => c.op), ["play", "pause", "play"]);
});

test("preload() creates elements without playing", () => {
  const backend = makeFakeBackend();
  const clock = makeClock();
  const audio = createAudioSystem({ backend, clock });
  audio.preload(["assets/voice/nose.mp3", "assets/voice/eyes.mp3"]);
  assert.deepEqual(backend.calls, []);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test
```

Expected: FAIL because `createAudioSystem` is not exported.

- [ ] **Step 3: Implement audio system**

Create `src/audio.js`:

```js
export function createAudioSystem({ backend, clock, cooldownMs = 900 }) {
  const cache = new Map();
  let currentSrc = null;
  let currentEl = null;
  const lastPlayedAt = new Map();

  function getElement(src) {
    if (!cache.has(src)) {
      cache.set(src, backend.create(src));
    }
    return cache.get(src);
  }

  async function play(src) {
    const now = clock.now();
    if (currentSrc === src) {
      const last = lastPlayedAt.get(src) ?? -Infinity;
      if (now - last < cooldownMs) return;
    } else if (currentEl && currentEl.playing) {
      currentEl.pause();
    }

    const el = getElement(src);
    el.currentTime = 0;
    currentSrc = src;
    currentEl = el;
    lastPlayedAt.set(src, now);
    try {
      await el.play();
    } catch (err) {
      // Audio errors stay silent for toddler play.
    }
  }

  function preload(srcs) {
    for (const src of srcs) getElement(src);
  }

  return { play, preload };
}

export function createBrowserBackend() {
  return {
    create(src) {
      const el = new Audio(src);
      el.preload = "auto";
      el.playing = false;
      el.addEventListener("playing", () => {
        el.playing = true;
      });
      el.addEventListener("pause", () => {
        el.playing = false;
      });
      el.addEventListener("ended", () => {
        el.playing = false;
      });
      return el;
    }
  };
}

export function createBrowserClock() {
  return { now: () => performance.now() };
}
```

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
npm test
```

Expected: PASS with body-part and audio tests.

- [ ] **Step 5: Commit audio**

Run:

```bash
git add src/audio.js tests/unit/audio.test.js
git commit -m "Add body part audio playback."
```

## Task 4: Build the Face Scene

**Files:**
- Create: `src/face-scene.js`
- Modify: `src/main.js`
- Replace: `src/styles.css`
- Create: `assets/images/natan-face.png`

- [ ] **Step 1: Create the polished face asset**

Use the image-generation workflow to create `assets/images/natan-face.png` with this prompt:

```text
Use case: illustration-story
Asset type: toddler educational game face asset
Primary request: Warm polished 3D children's storybook close-up of a happy Brazilian toddler boy named Natan, front-facing, head and neck visible, big friendly eyes, small nose, smiling mouth, visible ears, soft dark brown hair, kind expression, not uncanny.
Scene/backdrop: plain warm peach background that can sit inside a simple web game.
Style/medium: rounded expressive 3D storybook illustration, bedtime warmth, similar polish to modern children's animation, soft materials.
Composition/framing: centered close-up face, generous margin around ears and hair, every facial feature clearly visible and separated enough for large tap zones.
Lighting/mood: soft cheerful daylight, cozy and gentle.
Constraints: no text, no watermark, no extra characters, no props, no exaggerated teeth, no scary realism.
Avoid: photorealism, uncanny face, distorted eyes, hidden ears, cropped hair, busy background.
```

Save the chosen output as `assets/images/natan-face.png`.

- [ ] **Step 2: Implement face scene rendering**

Create `src/face-scene.js`:

```js
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
```

- [ ] **Step 3: Wire the app**

Replace `src/main.js`:

```js
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
```

- [ ] **Step 4: Replace app styling**

Replace `src/styles.css` with a stable landscape face layout:

```css
:root {
  --bg-warm: #f7b267;
  --bg-soft: #ffe8c7;
  --glow: rgba(255, 245, 170, 0.9);
}

* { box-sizing: border-box; }

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: var(--bg-soft);
  color: #3d2b1f;
  font-family: system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

#face-game {
  width: 100vw;
  height: 100vh;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  background:
    radial-gradient(circle at 24% 28%, rgba(255, 255, 255, 0.42), transparent 24%),
    linear-gradient(135deg, #f7b267, #ffe8c7 62%, #9fd8cb);
}

.face-scene {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.face-frame {
  position: relative;
  height: min(94vh, 62vw);
  aspect-ratio: 1 / 1;
}

.face-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 22px rgba(79, 49, 25, 0.24));
  pointer-events: none;
}

.part-target,
.part-highlight {
  position: absolute;
  border-radius: 999px;
}

.part-target {
  z-index: 3;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.part-highlight {
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transform-origin: center;
}

.part-highlight.is-active {
  animation: part-pop 700ms ease-out;
}

.part-highlight.pulse-hint {
  animation: hint-pulse 1400ms ease-in-out;
}

.sparkle {
  position: absolute;
  z-index: 4;
  width: 10%;
  aspect-ratio: 1;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(255, 255, 190, 0.95), rgba(255, 255, 190, 0) 72%);
  animation: sparkle-fade 1250ms ease-out forwards;
}

#rotate-hint {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 99;
  background: #f7b267;
  color: #3d2b1f;
  font-size: 24px;
  font-weight: 700;
}

@keyframes part-pop {
  0% { opacity: 0; box-shadow: 0 0 0 0 var(--glow); transform: scale(0.76) rotate(0deg); }
  35% { opacity: 1; box-shadow: 0 0 30px 14px var(--glow); transform: scale(1.14) rotate(-3deg); }
  72% { opacity: 0.72; box-shadow: 0 0 20px 8px var(--glow); transform: scale(1.03) rotate(3deg); }
  100% { opacity: 0; box-shadow: 0 0 0 0 rgba(255, 245, 170, 0); transform: scale(1) rotate(0deg); }
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
  50% { opacity: 0.8; box-shadow: 0 0 22px 9px rgba(255, 255, 255, 0.78); transform: scale(1.08); }
}

@keyframes sparkle-fade {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.35); }
  60% { opacity: 0.72; transform: translate(-50%, -50%) scale(1.25); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.65); }
}

@media (orientation: portrait) {
  #rotate-hint { display: flex; }
  #face-game { display: none; }
}
```

- [ ] **Step 5: Verify build**

Run:

```bash
npm run build
```

Expected: PASS and `dist/assets/images/natan-face.png` exists.

- [ ] **Step 6: Commit scene**

Run:

```bash
git add src/face-scene.js src/main.js src/styles.css assets/images/natan-face.png
git commit -m "Build interactive face scene."
```

## Task 5: Generate Voice Clips and Icons

**Files:**
- Create: `scripts/voice-config.mjs`
- Create: `scripts/generate-voiceover.mjs`
- Create: `scripts/make-icons.mjs`
- Create: `assets/voice/eyes.mp3`
- Create: `assets/voice/nose.mp3`
- Create: `assets/voice/mouth.mp3`
- Create: `assets/voice/ears.mp3`
- Create: `assets/voice/hair.mp3`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`
- Create: `public/splash-1170x2532.png`

- [ ] **Step 1: Add voice configuration**

Create `scripts/voice-config.mjs`:

```js
export const VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2";
export const MODEL_ID = "eleven_multilingual_v2";
export const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.75,
  style: 0.5
};
```

- [ ] **Step 2: Add voice generation script**

Create `scripts/generate-voiceover.mjs`:

```js
import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BODY_PARTS } from "../src/body-parts.js";
import { MODEL_ID, VOICE_ID, VOICE_SETTINGS } from "./voice-config.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY in .env");
  process.exit(1);
}

const force = process.argv.includes("--force");
await fs.mkdir("assets/voice", { recursive: true });

for (const part of BODY_PARTS) {
  const outFile = path.resolve(part.voicePath);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const exists = await fs.stat(outFile).then(() => true).catch(() => false);
  if (exists && !force) {
    console.log(`  skip  ${part.id} (already exists; pass --force to regenerate)`);
    continue;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      text: `${part.englishWord}!`,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS
    })
  });

  if (!res.ok) {
    console.error(`  FAIL  ${part.id}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  await fs.writeFile(outFile, Buffer.from(await res.arrayBuffer()));
  console.log(`  ok    ${part.id} -> ${path.relative(process.cwd(), outFile)}`);
}

console.log("Done.");
```

- [ ] **Step 3: Generate voice clips**

If `.env` is present with `ELEVENLABS_API_KEY`, run:

```bash
npm run voiceover:generate
```

Expected: creates five MP3 files under `assets/voice/`.

If the API key is unavailable, copy the existing Safari voice-generation pattern and pause with a clear note; do not commit empty MP3 files.

- [ ] **Step 4: Add icon generation script**

Create `scripts/make-icons.mjs`:

```js
import sharp from "sharp";
import { promises as fs } from "node:fs";

await fs.mkdir("public", { recursive: true });

const makeIcon = async (size, outFile) => {
  const face = await sharp("assets/images/natan-face.png")
    .resize(Math.round(size * 0.86), Math.round(size * 0.86), { fit: "contain" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#f7b267"
    }
  })
    .composite([{ input: face, gravity: "center" }])
    .png()
    .toFile(outFile);
};

await makeIcon(192, "public/icon-192.png");
await makeIcon(512, "public/icon-512.png");

const splashFace = await sharp("assets/images/natan-face.png")
  .resize(760, 760, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 1170,
    height: 2532,
    channels: 4,
    background: "#ffe8c7"
  }
})
  .composite([{ input: splashFace, top: 760, left: 205 }])
  .png()
  .toFile("public/splash-1170x2532.png");

console.log("Generated PWA icons and splash.");
```

- [ ] **Step 5: Generate icons**

Run:

```bash
npm run icons:generate
```

Expected: creates `public/icon-192.png`, `public/icon-512.png`, and `public/splash-1170x2532.png`.

- [ ] **Step 6: Commit assets and scripts**

Run:

```bash
git add scripts/voice-config.mjs scripts/generate-voiceover.mjs scripts/make-icons.mjs assets/voice public/icon-192.png public/icon-512.png public/splash-1170x2532.png
git commit -m "Add voice and PWA image assets."
```

## Task 6: Add PWA Files and End-to-End Tests

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/service-worker.js`
- Create: `playwright.config.mjs`
- Create: `tests/e2e/tap-flow.spec.mjs`
- Create: `tests/e2e/pwa.spec.mjs`

- [ ] **Step 1: Create manifest**

Create `public/manifest.webmanifest`:

```json
{
  "name": "Cadê o Nariz do Natan?",
  "short_name": "Natan Nose",
  "start_url": ".",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#ffe8c7",
  "theme_color": "#f7b267",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Create service worker**

Create `public/service-worker.js`:

```js
const CACHE_VERSION = "v1";
const CACHE_NAME = `natan-body-parts-${CACHE_VERSION}`;

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./splash-1170x2532.png",
  "./assets/images/natan-face.png",
  "./assets/voice/eyes.mp3",
  "./assets/voice/nose.mp3",
  "./assets/voice/mouth.mp3",
  "./assets/voice/ears.mp3",
  "./assets/voice/hair.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("natan-body-parts-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
```

- [ ] **Step 3: Add Playwright config**

Create `playwright.config.mjs`:

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:4174/",
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: "http://127.0.0.1:4174/",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "Mobile Safari landscape",
      use: {
        ...devices["iPhone 14 landscape"]
      }
    }
  ]
});
```

- [ ] **Step 4: Add tap-flow e2e test**

Create `tests/e2e/tap-flow.spec.mjs`:

```js
import { test, expect } from "@playwright/test";

test("face scene renders five tappable body parts", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".part-target");
  await expect(page.locator(".part-target")).toHaveCount(5);
});

test("tapping each part applies a reaction and triggers the voice clip", async ({ page }) => {
  await page.addInitScript(() => {
    window.__playLog = [];
    HTMLMediaElement.prototype.play = function () {
      window.__playLog.push(this.src);
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      this.dispatchEvent(new Event("pause"));
    };
  });

  await page.goto("/");
  await page.waitForSelector(".part-target");

  for (const id of ["eyes", "nose", "mouth", "ears", "hair"]) {
    const before = await page.evaluate(() => window.__playLog.length);
    await page.click(`.part-target[data-id="${id}"]`);
    await expect(page.locator(".part-highlight.is-active")).toHaveCount(1);
    const after = await page.evaluate(() => window.__playLog.length);
    expect(after).toBeGreaterThan(before);
    const log = await page.evaluate(() => window.__playLog);
    expect(log.some((src) => src.includes(`/voice/${id}.mp3`))).toBe(true);
    await page.waitForTimeout(1000);
  }
});
```

- [ ] **Step 5: Add PWA e2e test**

Create `tests/e2e/pwa.spec.mjs`:

```js
import { test, expect } from "@playwright/test";

test("manifest is reachable and configured for landscape standalone use", async ({ page }) => {
  const res = await page.request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.orientation).toBe("landscape");
  expect(manifest.icons).toHaveLength(2);
});

test("service worker script contains core cached assets", async ({ page }) => {
  const res = await page.request.get("/service-worker.js");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("natan-body-parts-v1");
  expect(body).toContain("./assets/images/natan-face.png");
  expect(body).toContain("./assets/voice/nose.mp3");
});
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test
npm run test:e2e
```

Expected: all unit and Playwright tests pass.

- [ ] **Step 7: Commit PWA and e2e tests**

Run:

```bash
git add public/manifest.webmanifest public/service-worker.js playwright.config.mjs tests/e2e
git commit -m "Add PWA support and browser tests."
```

## Task 7: Final Verification and Local Handoff

**Files:**
- Modify only if verification exposes issues.

- [ ] **Step 1: Run complete verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all commands exit 0.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite serves the app at `http://127.0.0.1:4174/`.

- [ ] **Step 3: Commit any final fixes**

If Step 1 required changes, commit them:

```bash
git add package.json package-lock.json index.html vite.config.js src assets public scripts tests playwright.config.mjs
git commit -m "Polish body parts game verification."
```

If there were no changes, skip this commit.

- [ ] **Step 4: Report handoff**

Report the local URL, verification commands, and any known caveats. Do not claim deployment unless a remote and Pages workflow have been added separately.

## Self-Review Notes

- Spec coverage: the plan covers standalone project creation, five words, polished face asset, generated voice clips, no-fail touch interaction, visual-only idle hint, portrait rotate hint, PWA offline files, unit tests, and Playwright smoke tests.
- Placeholder scan: the only temporary placeholder path is explicitly limited to development and not the delivered v1.
- Type consistency: `BODY_PARTS`, `englishWord`, `voicePath`, `zone`, `highlight`, `createAudioSystem`, `renderFaceScene`, and CSS selectors are used consistently across tasks.
