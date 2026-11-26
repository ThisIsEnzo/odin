// Re-encode large photographic JPEGs (hero/experiences/gallery/restaurant).
// Official brand artwork under public/images/brand is NEVER touched.
// Usage: npm i -D sharp && node scripts/optimize-images.mjs
import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const ROOT = "public/images";
const SCAN = ["hero", "experiences", "gallery", "restaurant"]; // exclude "brand"
const QUALITY = 78;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if ([".jpg", ".jpeg"].includes(extname(entry.name).toLowerCase())) yield p;
  }
}

let before = 0, after = 0, count = 0;
for (const sub of SCAN) {
  const dir = join(ROOT, sub);
  try { await stat(dir); } catch { continue; }
  for await (const file of walk(dir)) {
    const src = await stat(file);
    const tmp = file + ".opt";
    await sharp(file).jpeg({ quality: QUALITY, mozjpeg: true, progressive: true }).toFile(tmp);
    const out = await stat(tmp);
    if (out.size < src.size) {
      await rename(tmp, file);
      before += src.size; after += out.size; count++;
      console.log(`${file}: ${(src.size / 1048576).toFixed(2)}MB -> ${(out.size / 1048576).toFixed(2)}MB`);
    } else {
      await unlink(tmp);
    }
  }
}
console.log(`\nOptimized ${count} files: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
