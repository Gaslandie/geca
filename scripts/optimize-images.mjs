import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Originaux conservés hors du dossier public. Aucun téléchargement distant.
const root = path.resolve("assets/source-images");
const output = path.resolve("public/images/optimized");
await mkdir(output, { recursive: true });
const manifest = {};
const report = [];
for (const relative of (await readdir(root, { recursive: true })).sort()) {
  if (!/\.(jpg|png)$/.test(relative)) continue;
  const source = path.join(root, relative);
  const info = await stat(source);
  if (!info.isFile() || info.size > 20_000_000) throw new Error(`Source invalide : ${relative}`);
  const input = await readFile(source);
  const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  const logo = relative.endsWith(".png");
  const maxWidth = Math.min(metadata.width, logo ? 640 : 1600);
  const widths = [...new Set([192, 320, 480, 640, 960, 1280, 1600].filter((width) => width < maxWidth).concat(maxWidth))];
  const variants = [];
  for (const width of widths) {
    // Aucun recadrage, agrandissement ou ajout de métadonnées privées.
    const buffer = await sharp(input, { limitInputPixels: 40_000_000 }).rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: logo ? 85 : 55, effort: 6 }).toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const name = `${relative.replace(/\.(jpg|png)$/, "").replaceAll(path.sep, "-")}-${width}-${hash}.webp`;
    const url = `/images/optimized/${name}`;
    await writeFile(path.join(output, name), buffer);
    variants.push({ width, src: url });
    report.push({ source: `/${relative}`, width, bytes: buffer.length, originalBytes: info.size });
  }
  manifest[`/${relative}`] = variants;
}
await writeFile("src/content/image-variants.json", `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile("docs/image-sizes.json", `${JSON.stringify(report, null, 2)}\n`);
const largest = report.filter((item, index) => report[index + 1]?.source !== item.source);
console.log(JSON.stringify({ images: largest.length, originalBytes: largest.reduce((sum, item) => sum + item.originalBytes, 0), largestVariantsBytes: largest.reduce((sum, item) => sum + item.bytes, 0), variants: report.length }));
