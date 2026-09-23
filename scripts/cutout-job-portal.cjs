// One-off script: background removal for the homepage Job Portal portrait.
// Flood-fills near-white pixels connected to the image border (so enclosed
// whites like her T-shirt are kept), feathers the edge, then trims to the
// subject's bounding box. Not ML segmentation — hair edges are best-effort.
const sharp = require("sharp");
const path = require("path");

const input = path.join(__dirname, "..", "public", "assets", "img", "normal", "about-job-portal-346x580.png");
const output = path.join(__dirname, "..", "public", "assets", "img", "normal", "job-portal-cutout.png");

const INNER = 14; // distance-from-white treated as background during the fill
const OUTER = 60; // feathered edge: fully opaque beyond this

async function run() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const dist = (p) => 255 - Math.min(data[p * channels], data[p * channels + 1], data[p * channels + 2]);

  // 1. Flood-fill background from every border pixel.
  const bg = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || dist(p) > INNER) continue;
    bg[p] = 1;
    const x = p % width, y = (p / width) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  // 2. Alpha: background -> 0; pixels touching the background get a feather.
  for (let p = 0; p < width * height; p++) {
    let a = 255;
    if (bg[p]) a = 0;
    else {
      const x = p % width, y = (p / width) | 0;
      const nearBg = (x > 0 && bg[p - 1]) || (x < width - 1 && bg[p + 1]) || (y > 0 && bg[p - width]) || (y < height - 1 && bg[p + width]);
      if (nearBg) {
        const d = dist(p);
        a = d >= OUTER ? 255 : Math.round(((d - INNER) / (OUTER - INNER)) * 255);
      }
    }
    data[p * channels + 3] = Math.max(0, Math.min(255, a));
  }

  await sharp(data, { raw: { width, height, channels } }).trim({ threshold: 0 }).png().toFile(output);
  console.log("Wrote", output, await sharp(output).metadata().then((m) => `${m.width}x${m.height}`));
}

run().catch((err) => { console.error(err); process.exit(1); });
