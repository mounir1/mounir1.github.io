// One-off: pull each new project's own brand asset out of its working copy and
// write an optimised, self-hosted copy into public/.
//
// Run:  node scripts/import-brand-assets.mjs
//
// Why: the portfolio card shows the project's real logo, and the projects that
// had none were pointing `image` at an Unsplash stock photo — a third-party
// request for an unrelated picture of a hotel room or a bookshelf. Anything that
// needs a raster asset goes through sharp so a 300 KB source PNG does not ship
// as a 300 KB logo.
//
// Difference from scripts/optimize-images.mjs: this is a one-off *import* that
// reaches into a sibling working copy, so its output cannot be regenerated on a
// machine without that repo. Anything re-runnable belongs in optimize-images.mjs
// with its original committed to asset-sources/ — including project card art,
// which is derived there, not here.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const PROJECTS = path.resolve('C:/projects');

// source (relative to its project root) -> output filename in public/
const JOBS = [
  {
    project: 'Mab Project/quickkeep',
    source: 'src/assets/images/quickkeep-logo.webp',
    out: 'quickkeep-logo.webp',
  },
  { project: 'Mab Project/Dateinfo', source: 'public/icon-512.svg', out: 'mydate-icon.svg' },
  { project: 'Mab Project/domino-table', source: 'public/icon.svg', out: 'domino-icon.svg' },
  { project: 'Mab Project/godseye', source: 'web/public/icon.svg', out: 'godseye-icon.svg' },
  {
    project: 'Mab Project/aquaFine',
    source: 'assets/original/cropped-logo-aquafine-color-180x180.png',
    out: 'aquafine-logo.webp',
    // A photographic wordmark: even palette-quantised it stays 36 KB at 256 px,
    // because the gradient defeats PNG's colour-indexed model. WebP handles the
    // gradient natively and the site already serves WebP (profile.webp).
    webp: { width: 256 },
  },
];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

for (const job of JOBS) {
  const src = path.join(PROJECTS, job.project, job.source);
  if (!fs.existsSync(src)) {
    console.warn(`SKIP ${job.out}: missing source ${src}`);
    continue;
  }
  const dest = path.join(publicDir, job.out);
  const before = fs.statSync(src).size;
  if (job.raster) {
    await sharp(src, { failOn: 'none' })
      .resize(job.raster)
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toFile(dest);
  } else if (job.webp) {
    await sharp(src, { failOn: 'none' })
      .resize(job.webp)
      .webp({ quality: 82, effort: 6 })
      .toFile(dest);
  } else {
    fs.copyFileSync(src, dest);
  }
  const after = fs.statSync(dest).size;
  console.log(
    `${job.out.padEnd(24)} ${job.project}/${job.source} ${kb(before)} -> ${kb(after)}`,
  );
}