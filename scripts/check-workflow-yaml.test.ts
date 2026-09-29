import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { checkFile, findCoercedValues } from './check-workflow-yaml.mjs';

const SCRIPT = path.resolve('scripts/check-workflow-yaml.mjs');

let dir: string;
const outputs: string[] = [];

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wf-'));
  outputs.push(dir);
});

afterEach(() => {
  while (outputs.length) fs.rmSync(outputs.pop() as string, { recursive: true, force: true });
});

function write(name: string, contents: string) {
  fs.writeFileSync(path.join(dir, name), contents);
}

function runCli() {
  try {
    const stdout = execFileSync(process.execPath, [SCRIPT, dir], { stdio: 'pipe' });
    return { code: 0, output: stdout.toString() };
  } catch (error) {
    const e = error as { status: number; stderr: Buffer };
    return { code: e.status, output: e.stderr.toString() };
  }
}

describe('checkFile — the footgun that silently deletes a workflow', () => {
  it('flags an unquoted run value containing ": "', () => {
    // This exact line shipped once and made the deploy workflow vanish from CI.
    // Note the "- " list marker, which is how steps actually appear.
    write(
      'deploy.yml',
      'jobs:\n  b:\n    steps:\n      - run: echo "Skipped: nothing to do."\n',
    );
    const problems = checkFile(path.join(dir, 'deploy.yml'));
    expect(problems).toHaveLength(1);
    expect(problems[0].line).toBe(4);
    expect(problems[0].message).toContain('block scalar');
  });

  it('accepts the same command double-quoted', () => {
    write('deploy.yml', 'jobs:\n  b:\n    steps:\n      - run: \'echo "Skipped: nothing."\'\n');
    expect(checkFile(path.join(dir, 'deploy.yml'))).toHaveLength(0);
  });

  it('accepts a block scalar', () => {
    write('deploy.yml', 'jobs:\n  b:\n    steps:\n      - run: |\n          echo "a: b"\n');
    expect(checkFile(path.join(dir, 'deploy.yml'))).toHaveLength(0);
  });

  it('accepts a ${{ }} expression containing a colon', () => {
    write(
      'deploy.yml',
      "jobs:\n  b:\n    steps:\n      - if: ${{ github.event_name == 'push' }}\n",
    );
    expect(checkFile(path.join(dir, 'deploy.yml'))).toHaveLength(0);
  });

  it('accepts an ordinary command with no colon', () => {
    write('deploy.yml', 'jobs:\n  b:\n    steps:\n      - run: npm test\n');
    expect(checkFile(path.join(dir, 'deploy.yml'))).toHaveLength(0);
  });

  it('flags an unquoted name value containing ": "', () => {
    write('deploy.yml', 'jobs:\n  b:\n    steps:\n      - name: Deploy: to pages\n');
    expect(checkFile(path.join(dir, 'deploy.yml'))).toHaveLength(1);
  });

  it('ignores comments and blank lines', () => {
    write('deploy.yml', 'jobs:\n  # run: echo "a: b"\n\n  b:\n    steps: []\n');
    expect(checkFile(path.join(dir, 'deploy.yml'))).toHaveLength(0);
  });

  it('handles CRLF line endings', () => {
    write('deploy.yml', 'jobs:\r\n  b:\r\n    steps:\r\n      - run: echo "a: b"\r\n');
    const problems = checkFile(path.join(dir, 'deploy.yml'));
    expect(problems).toHaveLength(1);
    expect(problems[0].line).toBe(4);
  });
});

describe('findCoercedValues', () => {
  it('reports a run value that parsed as an object', () => {
    const parsed = { jobs: { b: { steps: [{ run: { Skipped: 'nothing.' } }] } } };
    const problems = findCoercedValues(parsed);
    expect(problems).toHaveLength(1);
    expect(problems[0].path).toBe('jobs.b.steps.[0].run');
  });

  it('accepts a run value that is a string', () => {
    const parsed = { jobs: { b: { steps: [{ run: 'echo hi' }] } } };
    expect(findCoercedValues(parsed)).toHaveLength(0);
  });

  it('does not descend into on/permissions/concurrency', () => {
    const parsed = {
      on: { push: { branches: ['main'] } },
      permissions: { contents: 'write' },
      concurrency: { group: 'deploy-pages' },
    };
    expect(findCoercedValues(parsed)).toHaveLength(0);
  });
});

describe('CLI', () => {
  it('exits 0 for the repository workflows', () => {
    const result = execFileSync(process.execPath, [SCRIPT], { stdio: 'pipe' });
    expect(result.toString()).toContain('Workflow YAML looks fine');
  });

  it('exits non-zero and names the offending line', () => {
    write('bad.yml', 'jobs:\n  b:\n    steps:\n      - run: echo "a: b"\n');
    const result = runCli();
    expect(result.code).toBe(1);
    expect(result.output).toContain('bad.yml:4');
  });

  it('fails loudly when the workflow directory is missing', () => {
    const missing = path.join(dir, 'nope');
    expect(() =>
      execFileSync(process.execPath, [SCRIPT, missing], { stdio: 'pipe' }),
    ).toThrow();
  });
});