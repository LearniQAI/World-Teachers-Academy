const sharp = require("sharp");
const path = require("path");

const input = path.join(__dirname, "..", "public", "assets", "img", "world-teachers-logo.jpeg");
const output = path.join(__dirname, "..", "public", "assets", "img", "world-teachers-logo.png");

const INNER = 18;
const OUTER = 55;

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

  await sharp(data, { raw: { width, height, channels } }).png().toFile(output);
  console.log("Wrote", output);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
