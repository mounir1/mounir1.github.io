// Regenerates the hero LCP image as a real WebP (public/profile.webp), the
// social/agent preview (public/og-image.jpg), the self-hosted client brand
// marks and the portfolio project card images — all from the masters in
// asset-sources/.
//
// Why this exists: public/profile.webp used to be a PNG with a .webp extension.
// The browser sniffed the real type, so it was served as a 400x400 PNG — 202 KB
// for an image that is the Largest Contentful Paint element on every visit, and
// the og:image / schema.org image tags declared 1200x630 for it, so every
// crawler and agent preview got wrong dimensions.
//
// Masters live in asset-sources/, not public/, and are committed: GitHub Pages
// serves dist/, dist copies public/ verbatim, so a master parked in public/
// ships 25 KB of dead weight on every deploy — and a *gitignored* master in
// either place makes the pipeline unrunnable on the next clone, which is how
// profile-source.png went missing. This script is idempotent, so it is safe to
// re-run after replacing a source. Requires `sharp`, already a devDependency.
//
//   node scripts/optimize-images.mjs
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(rootDir, 'public');
const sourceDir = path.join(rootDir, 'asset-sources');

// public/profile-source.png is the historical location; it is still honoured so
// an existing local master keeps working until it is moved next to the others.
const AVATAR_MASTERS = [
  path.join(sourceDir, 'profile-source.png'),
  path.join(publicDir, 'profile-source.png'),
];

// Client brand marks are pulled from the client's own site and shipped as WebP
// for the same reason as the avatar: the Techno wordmark master is an 800x200 /
// 25 KB PNG that renders inside a 96x24 CSS px badge. Widths are 2x the largest
// size any card badge displays it at.
const BRAND_LOGOS = [
  { source: 'technostationery-logo.png', out: 'technostationery-logo.webp', width: 192 },
  { source: 'noor-almaarifa-logo.png', out: 'noor-almaarifa-logo.webp', width: 192 },
  { source: 'mabcoin-icon.png', out: 'mabcoin-logo.webp', width: 192 },
];

const VECTOR_LOGOS = [
  { source: 'mab-modules-icon.svg', out: 'mab-modules-logo.svg' },
];

// Project card images. Each card crops to 192px tall with object-cover, and the
// grid is at most 3 columns (~600 CSS px wide), so ~960px covers 2x the widest
// render. These are real OG/hero art pulled from each project's own repo.
const PROJECT_CARDS = [
  { source: 'domino-table-og.png', out: 'project-domino-table.webp', width: 960 },
  { source: 'quickkeep-og.png', out: 'project-quickkeep.webp', width: 960 },
  { source: 'aquafine-hero.jpg', out: 'project-aquafine.webp', width: 960 },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function deriveAvatar() {
  // A machine without the master (a fresh clone before it is restored, or CI)
  // must still be able to run this script for the assets it *can* derive. Warn
  // rather than throw — the ENOENT used to abort before the brand marks below.
  const master = AVATAR_MASTERS.find((file) => existsSync(file));
  if (!master) {
    console.warn(
      `skip profile.webp + og-image.jpg: no profile-source.png in ${path.relative(rootDir, sourceDir)} or public/`,
    );
    return;
  }

  const source = readFileSync(master);
  const meta = await sharp(source).metadata();
  const aspect = meta.width / meta.height;

  // The LCP image is rendered at max 28rem square. 512px covers every DPR that
  // matters (2x of 256 CSS px); 800px would double the bytes for no visible gain.
  const hero = await sharp(source, { failOn: 'none' })
    .resize({
      width: 512,
      height: Math.round(512 / aspect),
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  const heroPath = path.join(publicDir, 'profile.webp');
  writeFileSync(heroPath, hero);

  // og:image and schema.org ImageObject both advertise 1200x630.
  const og = await sharp(source, { failOn: 'none' })
    .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer();
  const ogPath = path.join(publicDir, 'og-image.jpg');
  writeFileSync(ogPath, og);

  const before = statSync(heroPath).size;
  console.log(
    `profile.webp ${meta.width}x${meta.height} ${kb(source.length)} -> ` +
      `512x${Math.round(512 / aspect)} ${kb(before)} ` +
      `(${Math.round((1 - before / source.length) * 100)}% smaller)`,
  );
  console.log(`og-image.jpg 1200x630 ${kb(og.length)}`);
}

async function deriveBrandLogos() {
  for (const brand of BRAND_LOGOS) {
    const master = path.join(sourceDir, brand.source);
    if (!existsSync(master)) {
      console.warn(`skip ${brand.out}: master ${brand.source} not found`);
      continue;
    }
    const source = readFileSync(master);
    const logo = await sharp(source, { failOn: 'none' })
      .resize({ width: brand.width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();
    const logoPath = path.join(publicDir, brand.out);
    writeFileSync(logoPath, logo);
    console.log(
      `${brand.out} ${brand.width}px ${kb(source.length)} -> ${kb(logo.length)}`,
    );
  }
}

function copyVectorLogos() {
  for (const logo of VECTOR_LOGOS) {
    const master = path.join(sourceDir, logo.source);
    if (!existsSync(master)) {
      console.warn(`skip ${logo.out}: master ${logo.source} not found`);
      continue;
    }
    const outputPath = path.join(publicDir, logo.out);
    writeFileSync(outputPath, readFileSync(master));
    console.log(`${logo.out} copied from ${logo.source}`);
  }
}

async function deriveProjectCards() {
  for (const card of PROJECT_CARDS) {
    const master = path.join(sourceDir, card.source);
    if (!existsSync(master)) {
      console.warn(`skip ${card.out}: master ${card.source} not found`);
      continue;
    }
    const source = readFileSync(master);
    const meta = await sharp(source, { failOn: 'none' }).metadata();
    const out = await sharp(source, { failOn: 'none' })
      .resize({ width: card.width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
    const outPath = path.join(publicDir, card.out);
    writeFileSync(outPath, out);
    console.log(
      `${card.out} ${meta.width}x${meta.height} ${kb(source.length)} -> ` +
        `${card.width}x${Math.round((card.width * meta.height) / meta.width)} ${kb(out.length)}`,
    );
  }
}

async function main() {
  await deriveAvatar();
  await deriveBrandLogos();
  copyVectorLogos();
  await deriveProjectCards();
}

main().catch((error) => {
  console.error('optimize-images failed:', error);
  process.exit(1);
});
