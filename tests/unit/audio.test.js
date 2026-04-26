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
