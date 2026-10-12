// Rasterises public/favicon.svg into the PNG sizes the site actually links, plus
// a real multi-resolution favicon.ico.
//
//   node scripts/generate-favicons.mjs
//
// Two things this script exists to get right:
//
// 1. Palette PNGs. The source is a blurred gradient, so a plain
//    `.resize(n).png()` emits a 32-bit RGBA image: 66 KB for the 512 px tile
//    and ~56 KB across the set, served to every visitor who hits
//    /site.webmanifest or a legacy favicon request. Icons are flat-colour by
//    nature — 256-entry palette PNG is visually identical at favicon sizes and
//    is roughly 10x smaller.
//
// 2. A genuine ICO container. The previous version wrote a 32x32 *PNG* to
//    favicon.ico, so browsers that honour the ICO directory got exactly one
//    resolution and upscaled it for the tab strip. ICO entries may embed PNG
//    payloads (Windows Vista and later), so the directory is assembled by hand
//    below instead of shipping a single-resolution mislabelled file.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const inputSvg = path.join(root, 'public', 'favicon.svg');
const outputDir = path.join(root, 'public');

// Sizes referenced from index.html (16/32/180) and site.webmanifest (16/32/48/
// 180/192/512).
const PNG_SIZES = [16, 32, 48, 180, 192, 512];
const ICO_SIZES = [16, 32, 48, 256];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

// 8-bit palette, maximum deflate effort. `quality` (0-100, default 90) is
// libimagequant's error bound — anything at or above 90 on flat vector art is
// visually lossless while keeping the palette under the 256-entry limit.
const png = { compressionLevel: 9, effort: 10, palette: true, quality: 90 };

/**
 * Builds an ICO file from PNG payloads. Structure:
 *   ICONDIR (6 bytes) | ICONDIRENTRY[count] (16 bytes each) | image data
 * A width/height byte of 0 means 256 in the directory entry.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6 + entries.length * 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(entries.length, 4);

  let offset = header.length;
  entries.forEach(({ size, data }, index) => {
    const at = 6 + index * 16;
    header.writeUInt8(size >= 256 ? 0 : size, at);
    header.writeUInt8(size >= 256 ? 0 : size, at + 1);
    header.writeUInt8(0, at + 2); // palette size (0 = truecolor)
    header.writeUInt8(0, at + 3); // reserved
    header.writeUInt16LE(1, at + 4); // colour planes
    header.writeUInt16LE(32, at + 6); // bits per pixel
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, ...entries.map((e) => e.data)]);
}

async function main() {
  const svg = fs.readFileSync(inputSvg);
  const before = new Map();
  const total = (sizes) =>
    sizes.reduce((sum, size) => {
      const file = path.join(outputDir, `favicon-${size}x${size}.png`);
      if (fs.existsSync(file)) before.set(size, fs.statSync(file).size);
      return sum + (before.get(size) ?? 0);
    }, 0);

  const baseline = total(PNG_SIZES);
  let after = 0;

  for (const size of PNG_SIZES) {
    const file = path.join(outputDir, `favicon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png(png).toFile(file);
    const size2 = fs.statSync(file).size;
    after += size2;
    const was = before.get(size);
    console.log(
      `favicon-${size}x${size}.png ${was ? `${kb(was)} -> ` : ''}${kb(size2)}`,
    );
  }

  const icoEntries = [];
  for (const size of ICO_SIZES) {
    const data = await sharp(svg).resize(size, size).png(png).toBuffer();
    icoEntries.push({ size, data });
  }
  const icoPath = path.join(outputDir, 'favicon.ico');
  const previousIco = fs.existsSync(icoPath) ? fs.statSync(icoPath).size : 0;
  fs.writeFileSync(icoPath, buildIco(icoEntries));
  console.log(
    `favicon.ico ${ICO_SIZES.join('/')} ${
      previousIco ? `${kb(previousIco)} -> ` : ''
    }${kb(fs.statSync(icoPath).size)}`,
  );

  if (baseline > 0) {
    console.log(
      `PNG set ${kb(baseline)} -> ${kb(after)} (${Math.round(
        (1 - after / baseline) * 100,
      )}% smaller)`,
    );
  }
}

main().catch((error) => {
  console.error('generate-favicons failed:', error);
  process.exit(1);
});