// Decides whether a fresh build differs from what is already published on the
// gh-pages branch. Writes `changed=true|false` to GITHUB_OUTPUT so the deploy
// workflow can skip a redundant push.
//
// DESIGN NOTE â€” this deliberately does NOT try to diff the built bundle.
//
// A byte diff of `dist/` is unreliable across environments: this repo checks
// out with CRLF on Windows and LF on CI, the minifier's short-identifier naming
// and ordering is not stable between machines, and those bytes feed Vite's
// content hashes. A Windows build of an unchanged tree legitimately differs from
// the published Linux build in every hashed filename, with no functional change.
// Normalising all of that reliably means re-implementing a JS parser, and a
// half-right normaliser is worse than none: it can silently mask a real change.
//
// Instead we ask the only question that actually matters â€” did any input that
// can affect the output change since the last publish?
//
//   * inside CI, `LAST_DEPLOY_SHA` (recorded at the previous successful publish)
//     and the current commit are both real, so this is a precise git diff.
//
// This errs towards publishing. A redundant publish costs one force-push to
// gh-pages; a missed publish ships stale code. `peaceiris` keeps the previous
// commit in history, and `workflow_dispatch` has a `force` input for the rare
// case where the recorded SHA is not trustworthy.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const IGNORED = new Set(['CNAME', '.nojekyll', '.git']);

// Directories whose contents cannot change the built site.
const NON_BUILD_PATHS = ['docs/', 'coverage/', 'node_modules/', '.git/'];

// Files that never affect the emitted bundle.
const NON_BUILD_FILES = [
  'README.md',
  'ROADMAP.md',
  'AGENTS.md',
  'SECURITY_ANALYSIS.md',
  '.gitattributes',
  '.gitignore',
  'package-lock.json',
  'bun.lock',
  'CNAME',
];

export function isBuildInput(rel) {
  const normalized = rel.split(path.sep).join('/');
  if (NON_BUILD_FILES.includes(normalized)) return false;
  if (NON_BUILD_PATHS.some((p) => normalized.startsWith(p))) return false;
  // Unit tests are compiled out of the production bundle; the suite itself is
  // gated by CI, so a test-only change needs no redeploy.
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized)) return false;
  if (normalized.startsWith('src/test/')) return false;
  if (normalized.startsWith('.github/')) return false;
  return true;
}

export function changedFiles(fromSha, toSha, { git = execGit } = {}) {
  const out = git(['diff', '--name-only', `${fromSha}..${toSha}`]);
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(isBuildInput);
}

function execGit(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export function normalizeText(buf) {
  // Git's CRLF translation can leave a lone \r (e.g. on the final line), so
  // every CR form is normalised, not just \r\n.
  return buf.toString('utf8').replace(/\r\n?/g, '\n');
}

function looksBinary(buf) {
  return buf.subarray(0, 8000).includes(0);
}

// Retained for the deployed-tree check used by the tests and for manual
// debugging via GH_PAGES_DIR. The workflow itself uses the git-diff path above.
export function digestOf(buf) {
  if (looksBinary(buf)) {
    return createHash('sha256').update(buf).digest('hex');
  }
  return createHash('sha256').update(Buffer.from(normalizeText(buf), 'utf8')).digest('hex');
}

export function collectFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).split(path.sep).join('/');
      if (IGNORED.has(rel) || IGNORED.has(entry.name)) continue;
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.push({ rel, canonical: rel });
    }
  };
  walk(root);
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
}

export function compareTrees(currentRoot, liveRoot) {
  const current = collectFiles(currentRoot);
  const live = new Map(collectFiles(liveRoot).map((f) => [f.canonical, f]));
  const digest = (root, rel) => digestOf(fs.readFileSync(path.join(root, rel)));

  const added = current.filter((f) => !live.has(f.canonical)).map((f) => f.rel);
  const removed = [...live.keys()].filter((k) => !current.some((f) => f.canonical === k));
  const modified = current
    .filter((f) => live.has(f.canonical))
    .filter((f) => digest(currentRoot, f.rel) !== digest(liveRoot, live.get(f.canonical).rel))
    .map((f) => f.rel);

  return { added, removed, modified, hashedChanged: false };
}

function emit(value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${value}\n`);
  }
  console.log(`changed=${value}`);
}

function main() {
  const from = process.env.LAST_DEPLOY_SHA?.trim();
  const to = (process.env.CURRENT_SHA ?? 'HEAD').trim();

  // No recorded baseline: first run, or a dispatch with no history. Publish.
  if (!from) {
    console.log('No LAST_DEPLOY_SHA recorded - publishing.');
    emit('true');
    return;
  }

  if (from === to) {
    console.log(`Already published ${to.slice(0, 7)} - nothing to do.`);
    emit('false');
    return;
  }

  let changed;
  try {
    changed = changedFiles(from, to);
  } catch (error) {
    // An unknown baseline (force-pushed history, shallow clone) must not block
    // a release. Publishing is always the safe default.
    console.log(`Could not diff ${from.slice(0, 7)}..${to.slice(0, 7)} (${error.message}) - publishing.`);
    emit('true');
    return;
  }

  if (changed.length === 0) {
    console.log(`No build inputs changed since ${from.slice(0, 7)} - skipping publish.`);
    emit('false');
    return;
  }

  console.log(`Build inputs changed since ${from.slice(0, 7)}:`);
  for (const rel of changed) console.log(`  - ${rel}`);
  emit('true');
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
