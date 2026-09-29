import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// scripts/generate_cv.py restates the portfolio facts as Python literals rather
// than reading the TypeScript seed data it is documented to be generated from.
// Nothing catches the drift: the PDF is a committed artifact, and the build
// never runs Python. These assertions pin the CV to the fact-checked data so a
// number changed in src/data/ that is missing from the CV fails CI instead of
// quietly shipping a resume that overstates the work.

const cv = fs.readFileSync(path.resolve('scripts/generate_cv.py'), 'utf8');
const settings = fs.readFileSync(path.resolve('src/hooks/useSettings.ts'), 'utf8');
const seed = ['initial-experience.ts', 'initial-projects.ts', 'initial-skills.ts']
  .map((file) => fs.readFileSync(path.resolve('src/data', file), 'utf8'))
  .join('\n');

describe('CV claims stay anchored to the fact-checked seed data', () => {
  const claims = ['28 ', '89/89', '12 tools', '165+', '6,478', 'Ext JS 8', '14+', 'wilaya'];

  for (const claim of claims) {
    it(`"${claim.trim()}" appears in the CV and is corroborated by the seed data`, () => {
      expect(cv).toContain(claim);
      expect(seed).toContain(claim);
    });
  }

  // Metrics from the pre-verification resume that could never be substantiated.
  // They must never come back, in either file.
  const debunked = ['100K+', '100+ hotels', '5TB', '99.9%'];

  for (const metric of debunked) {
    it(`keeps the unverifiable "${metric}" claim out of the CV`, () => {
      expect(cv).not.toContain(metric);
      expect(seed).not.toContain(metric);
    });
  }
});

describe('CV artifact is the one the site links to', () => {
  const filename = 'Mounir_Abderrahmani_Resume.pdf';

  it('is written to the served filename', () => {
    expect(cv).toContain(filename);
  });

  it('is the file useSettings.resumeUrl points at', () => {
    expect(settings).toContain(`/${filename}`);
  });

  it('exists in public/, so the download button is not a 404', () => {
    expect(fs.existsSync(path.resolve('public', filename))).toBe(true);
  });

  it('has no stale duplicate resurrecting beside it', () => {
    // /Mounir_CV_2025.pdf was removed from the site; the copy tracked at the
    // repo root outlived it and contradicted ROADMAP. Nothing may reference it.
    expect(fs.existsSync(path.resolve('Mounir_CV_2025.pdf'))).toBe(false);
  });
});
