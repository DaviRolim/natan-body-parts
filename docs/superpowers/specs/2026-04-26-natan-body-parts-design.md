# Cadê o Nariz do Natan? — Design Doc

**Date:** 2026-04-26
**Status:** Approved concept; awaiting implementation plan
**Author:** Davi Rolim, with Codex

## 1. Overview

Cadê o Nariz do Natan? is the second standalone educational micro-game for Natan, a 2-year-old Portuguese-native child learning English. It teaches a first set of English body-part words through a no-fail tap-and-respond loop.

The first version is a close-up, storybook-style face of Natan. Tapping a large invisible target over a body part makes that part gently react, then plays a warm English voice clip for the word. There are no labels, menus, scores, wrong answers, or instructions.

## 2. Learning Goal

The game teaches five English words:

- Eyes
- Nose
- Mouth
- Ears
- Hair

The goal is recognition and imitation, not testing. Natan should be able to tap freely, hear the same words many times, and connect them with his own body during parent play.

## 3. User Experience

The first screen is the whole game: a friendly close-up of Natan's face in the same warm children's storybook direction as `natan-escova-floresta` and `safari-de-sons`.

Each body part has a large invisible tap zone. When tapped:

1. The tapped part gets a soft glow/wiggle reaction.
2. A generated voice clip plays the English word, such as "Nose!".
3. A small sparkle appears near the tapped part.
4. The game is immediately ready for another tap.

An idle hint softly pulses one body part after a few seconds of inactivity. The hint is visual only, with no attract sounds.

Portrait mode shows a simple rotate-device hint, matching the Safari project. Landscape is the primary layout.

## 4. Project Shape

This is a new standalone project under:

`/Users/davirolim/playground/creatives/natan-body-parts`

It will follow the proven Safari de Sons structure:

- Vanilla HTML/CSS/JS with ESM modules
- Vite for development and static builds
- PWA manifest and service worker for iPhone home-screen install and offline use
- Build-time ElevenLabs voice clips
- Unit tests for data/audio behavior
- Playwright smoke tests for mobile landscape interaction

The game does not share a runtime bundle with Safari. Reuse happens by copying the proven project pattern and adapting it locally, so each game can deploy independently.

## 5. Assets

Version 1 needs one custom face asset:

- `assets/images/natan-face.png`

The image must be a warm, polished, toddler-friendly cartoon close-up of Natan's face, with eyes, nose, mouth, ears, and hair clearly visible and spaced enough for forgiving tap zones. The v1 implementation will generate or otherwise create the polished asset before final verification. If image generation fails, a simple local placeholder may be used only while app behavior is under development, not as the delivered v1 asset.

Voice clips live under:

- `assets/voice/eyes.mp3`
- `assets/voice/nose.mp3`
- `assets/voice/mouth.mp3`
- `assets/voice/ears.mp3`
- `assets/voice/hair.mp3`

No sound effects are required in v1. The voice word is the main reward.

## 6. Module Boundaries

- `src/main.js` bootstraps the app, audio system, face scene, and service worker.
- `src/body-parts.js` stores body-part data: id, word, voice path, tap-zone geometry, and highlight geometry.
- `src/face-scene.js` renders the face, invisible tap zones, idle hint, tap reactions, and sparkles.
- `src/audio.js` owns clip loading, playback, interruption, and cooldown behavior.
- `src/styles.css` owns layout, responsive sizing, animations, and portrait rotate hint.

The data module stays pure so adding a sixth body part later is a small data-and-asset change.

## 7. Interaction Rules

- Taps use `touchstart` plus click fallback, as in Safari.
- Audio playback is called synchronously from the user gesture for iOS Safari compatibility.
- Rapid taps on the same part are visually acknowledged, but audio is cooldown-limited to avoid chattering.
- Tapping a different part interrupts the current voice clip and plays the new one.
- If audio is missing or not loaded, the visual reaction still works and no error UI is shown.

## 8. Non-Goals

- No quiz mode or "Where is the nose?" prompts in v1.
- No score, progression, stickers, or unlocks.
- No bilingual toggle.
- No face-expression animation beyond CSS highlight/wiggle.
- No analytics or telemetry.
- No full-body vocabulary in v1.

## 9. Validation

The v1 is successful if:

- Natan can play it after a one-time demo.
- He voluntarily repeats or attempts at least two of the five words after several sessions.
- The tap zones feel forgiving on iPhone landscape.
- The game installs and runs offline as a PWA.
- Adding another body part remains a small data/asset change.

## 10. Asset Delivery Decision

The delivered v1 includes the polished `natan-face.png` asset. A temporary placeholder is acceptable during development only if it helps unblock code and tests before the final asset is ready.
