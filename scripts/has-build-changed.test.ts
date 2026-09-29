import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { isBuildInput, changedFiles, normalizeText, digestOf } from './has-build-changed.mjs';

const SCRIPT = path.resolve('scripts/has-build-changed.mjs');

const outputs: string[] = [];
afterEach(() => {
  while (outputs.length) fs.rmSync(outputs.pop() as string, { force: true });
});

function runCli(env: Record<string, string>) {
  const outFile = path.join(os.tmpdir(), `hbc-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  outputs.push(outFile);
  fs.writeFileSync(outFile, '');
  execFileSync(process.execPath, [SCRIPT], {
    stdio: 'pipe',
    env: { ...process.env, GITHUB_OUTPUT: outFile, ...env },
  });
  return fs.readFileSync(outFile, 'utf8');
}

describe('isBuildInput', () => {
  it('treats application source as a build input', () => {
    expect(isBuildInput('src/components/sections/Hero.tsx')).toBe(true);
    expect(isBuildInput('src/lib/firebase.ts')).toBe(true);
    expect(isBuildInput('src/data/initial-projects.ts')).toBe(true);
  });

  it('treats build configuration as a build input', () => {
    expect(isBuildInput('package.json')).toBe(true);
    expect(isBuildInput('vite.config.ts')).toBe(true);
    expect(isBuildInput('tailwind.config.ts')).toBe(true);
    expect(isBuildInput('index.html')).toBe(true);
    expect(isBuildInput('public/placeholder.svg')).toBe(true);
  });

  it('ignores docs and workflow files', () => {
    expect(isBuildInput('README.md')).toBe(false);
    expect(isBuildInput('ROADMAP.md')).toBe(false);
    expect(isBuildInput('AGENTS.md')).toBe(false);
    expect(isBuildInput('SECURITY_ANALYSIS.md')).toBe(false);
    expect(isBuildInput('.github/workflows/deploy.yml')).toBe(false);
    expect(isBuildInput('.github/dependabot.yml')).toBe(false);
  });

  it('ignores unit tests, which never reach the production bundle', () => {
    expect(isBuildInput('src/hooks/useLinks.test.ts')).toBe(false);
    expect(isBuildInput('src/components/admin/DataManager.test.tsx')).toBe(false);
    expect(isBuildInput('scripts/has-build-changed.test.ts')).toBe(false);
    expect(isBuildInput('src/test/setup.ts')).toBe(false);
  });

  it('ignores the lockfile and VCS metadata', () => {
    expect(isBuildInput('package-lock.json')).toBe(false);
    expect(isBuildInput('.gitattributes')).toBe(false);
    expect(isBuildInput('.gitignore')).toBe(false);
  });

  it('normalises Windows path separators', () => {
    expect(isBuildInput('src\\test\\setup.ts')).toBe(false);
    expect(isBuildInput('src\\lib\\firebase.ts')).toBe(true);
  });
});

describe('changedFiles', () => {
  const gitStub = (list: string) => () => list;

  it('returns only build inputs from a diff', () => {
    const result = changedFiles('a', 'b', {
      git: gitStub('src/lib/firebase.ts\nROADMAP.md\n.github/workflows/ci.yml\n'),
    });
    expect(result).toEqual(['src/lib/firebase.ts']);
  });

  it('returns an empty list when only docs changed', () => {
    expect(changedFiles('a', 'b', { git: gitStub('README.md\nROADMAP.md\n') })).toEqual([]);
  });

  it('returns an empty list for an empty diff', () => {
    expect(changedFiles('a', 'b', { git: gitStub('') })).toEqual([]);
  });

  it('tolerates CRLF line endings in git output', () => {
    expect(changedFiles('a', 'b', { git: gitStub('src/a.ts\r\nsrc/b.ts\r\n') })).toEqual([
      'src/a.ts',
      'src/b.ts',
    ]);
  });
});

describe('normalizeText / digestOf', () => {
  it('normalises CRLF and a lone CR to LF', () => {
    expect(normalizeText(Buffer.from('a\r\nb\r'))).toBe('a\nb\n');
  });

  it('hashes text identically regardless of line endings', () => {
    expect(digestOf(Buffer.from('a\r\nb\r\n'))).toBe(digestOf(Buffer.from('a\nb\n')));
  });

  it('distinguishes different content', () => {
    expect(digestOf(Buffer.from('a\nb\n'))).not.toBe(digestOf(Buffer.from('a\nc\n')));
  });

  it('compares binary content byte-for-byte', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x00, 0x01]);
    expect(digestOf(png)).toBe(digestOf(Buffer.from(png)));
  });
});

describe('CLI decision', () => {
  it('publishes when there is no recorded baseline', () => {
    expect(runCli({ LAST_DEPLOY_SHA: '', CURRENT_SHA: 'HEAD' })).toContain('changed=true');
  });

  it('skips when the current commit is already the last deployed one', () => {
    const sha = 'a'.repeat(40);
    expect(runCli({ LAST_DEPLOY_SHA: sha, CURRENT_SHA: sha })).toContain('changed=false');
  });

  it('publishes when the baseline is unknown to git', () => {
    // Force-pushed or shallow history must never block a release.
    const out = runCli({ LAST_DEPLOY_SHA: 'deadbeef'.repeat(5), CURRENT_SHA: 'HEAD' });
    expect(out).toContain('changed=true');
  });

  it('publishes when build inputs changed between real commits', () => {
    const out = runCli({
      LAST_DEPLOY_SHA: 'ac98381c3cb13eb8282c567851819d35b88fc7fd',
      CURRENT_SHA: '7e6994975da3431fd968b0b99d7b4267640a354b',
    });
    expect(out).toContain('changed=true');
  });

  it('skips when only non-build files changed between real commits', () => {
    // PR #52 touched only dependabot.yml and ROADMAP.md.
    const out = runCli({
      LAST_DEPLOY_SHA: 'd8099461f1d472b28ddfd65b9dd4292216f4dc08',
      CURRENT_SHA: '7e6994975da3431fd968b0b99d7b4267640a354b',
    });
    expect(out).toContain('changed=false');
  });
});