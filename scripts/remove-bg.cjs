// One-off script: crude white-background removal for the hero student photo.
// Not true ML segmentation — keys out near-white/light-gray pixels with a
// feathered threshold. Best-effort only; edges around hair may be imperfect.
const sharp = require("sharp");
const path = require("path");

const input = path.join(__dirname, "..", "public", "assets", "img", "hero", "hero-student.jpeg");
const output = path.join(__dirname, "..", "public", "assets", "img", "hero", "hero-student.png");

// Below this "distance from white" -> fully transparent.
// Above this -> fully opaque. Linear feather in between.
const INNER = 18; // fully transparent threshold
const OUTER = 55; // fully opaque threshold

async function run() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // distance from pure white, weighted so pale/desaturated pixels count as "background"
    const dist = 255 - Math.min(r, g, b);
    let alpha;
    if (dist <= INNER) {
      alpha = 0;
    } else if (dist >= OUTER) {
      alpha = 255;
    } else {
      alpha = Math.round(((dist - INNER) / (OUTER - INNER)) * 255);
    }
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(output);

  console.log("Wrote", output);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
