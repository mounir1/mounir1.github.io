import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// src/index.css is consumed by Tailwind and never imported, so it cannot be
// asserted through the DOM. Reading the real file keeps these honest about what
// actually ships rather than about what a mock claims.
const css = fs.readFileSync(path.resolve('src/index.css'), 'utf8');

/** Body of a `@media (prefers-reduced-motion: reduce) { ... }` block. */
function reducedMotionBlocks(source: string): string[] {
  const blocks: string[] = [];
  const open = '@media (prefers-reduced-motion: reduce) {';
  let from = 0;
  while ((from = source.indexOf(open, from)) !== -1) {
    let depth = 0;
    let i = source.indexOf('{', from);
    for (; i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}' && --depth === 0) break;
    }
    blocks.push(source.slice(from, i + 1));
    from = i;
  }
  return blocks;
}

// Every decorative infinite animation defined in this file. `animation: none`
// has to cover all of them, otherwise a visitor who asked for reduced motion
// still gets an animation that never stops — and on a low-end phone each one
// keeps the compositor busy for the whole session.
const INFINITE_ANIMATIONS = [
  '.animate-float',
  '.animate-float-slow',
  '.animate-pulse-glow',
  '.animate-spin-slow',
  '.animate-shimmer',
  '.animate-badge-bounce',
  '.gradient-text-animated',
  '.shimmer-bg',
  '.animate-pulse',
];

describe('index.css — reduced-motion coverage', () => {
  it('declares each infinite animation in the first place', () => {
    for (const selector of INFINITE_ANIMATIONS) {
      expect(css, `${selector} is no longer defined — update this list`).toContain(selector);
    }
  });

  it('has at least one prefers-reduced-motion block', () => {
    expect(reducedMotionBlocks(css).length).toBeGreaterThan(0);
  });

  it('stops every infinite animation for reduced-motion users', () => {
    // A selector only counts if it appears in a reduced-motion block that also
    // declares `animation: none` — listing it there without the declaration
    // would leave the animation running.
    const blocks = reducedMotionBlocks(css).filter((b) => /animation:\s*none/.test(b));

    for (const selector of INFINITE_ANIMATIONS) {
      const covered = blocks.some((block) => block.includes(selector));
      expect(covered, `${selector} is infinite but not disabled under prefers-reduced-motion`).toBe(true);
    }
  });

  it('keeps the scroll-reveal utilities visible rather than permanently hidden', () => {
    // The reveal classes start at opacity 0. If reduced-motion ever removed the
    // override that restores them to opacity 1, content would simply disappear.
    const revealBlock = reducedMotionBlocks(css).find((b) => b.includes('.reveal'));
    expect(revealBlock).toBeDefined();
    expect(revealBlock).toMatch(/opacity:\s*1/);
  });
});
