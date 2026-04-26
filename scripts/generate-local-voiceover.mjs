import { mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { BODY_PARTS } from "../src/body-parts.js";

const run = promisify(execFile);
const voice = "Flo (English (UK))";
const tmpDir = await mkdtemp(path.join(os.tmpdir(), "natan-voice-"));

try {
  for (const part of BODY_PARTS) {
    const aiffFile = path.join(tmpDir, `${part.id}.aiff`);
    await mkdir(path.dirname(part.voicePath), { recursive: true });
    await run("say", ["-v", voice, "-r", "165", "-o", aiffFile, `${part.englishWord}!`]);
    await run(ffmpegPath, ["-y", "-i", aiffFile, "-codec:a", "libmp3lame", "-b:a", "128k", part.voicePath]);
    console.log(`  ok    ${part.id} -> ${part.voicePath}`);
  }
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}

console.log("Done.");
