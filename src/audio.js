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
