import sharp from "sharp";
import { promises as fs } from "node:fs";

await fs.mkdir("public", { recursive: true });

const makeIcon = async (size, outFile) => {
  const face = await sharp("assets/images/natan-face.png")
    .resize(Math.round(size * 0.9), Math.round(size * 0.9), { fit: "contain" })
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
