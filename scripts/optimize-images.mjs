// Regenerates the hero LCP image as a real WebP (public/profile.webp) and the
// social/agent preview (public/og-image.jpg) from public/profile-source.png.
//
// Why this exists: public/profile.webp used to be a PNG with a .webp extension.
// The browser sniffed the real type, so it was served as a 400x400 PNG — 202 KB
// for an image that is the Largest Contentful Paint element on every visit, and
// the og:image / schema.org image tags declared 1200x630 for it, so every
// crawler and agent preview got wrong dimensions.
//
// Keep profile-source.png as the lossless master; this script is idempotent, so
// it is safe to re-run after replacing the source. Requires `sharp`, which is
// already a devDependency.
//
//   node scripts/optimize-images.mjs
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(import.meta.dirname, '..', 'public');
const SOURCE = path.join(publicDir, 'profile-source.png');

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  let source = readFileSync(SOURCE);
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

main().catch((error) => {
  console.error('optimize-images failed:', error);
  process.exit(1);
});
