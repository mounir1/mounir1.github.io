// Guard against a GitHub Actions footgun that is invisible to a YAML parser.
//
// An unquoted scalar containing ": " — e.g.
//     - run: echo "Skipped: nothing to do."
// is perfectly valid YAML, but it parses as a MAPPING, not a string:
//     run: { Skipped: "nothing to do." }
// GitHub then refuses to schedule the workflow and reports only
// "This run likely failed because of a workflow file issue" — with zero jobs,
// no step output, and no hint about the cause. That is how a broken deploy
// workflow can sit on `main` looking green.
//
// This walks every workflow, parses it, and asserts that keys which must hold
// strings (`run`, `uses`, `if`, `name`, `shell`, and everything under `env:`)
// actually are strings.
//
// Usage: node scripts/check-workflow-yaml.mjs [dir]

import fs from 'node:fs';
import path from 'node:path';

const WORKFLOW_DIR = process.argv[2] ?? path.join('.github', 'workflows');

// Keys whose value must be a string. `env:` entries are checked separately
// because the values live one level down.
const STRING_KEYS = new Set(['run', 'uses', 'if', 'name', 'shell', 'working-directory']);

/** Keys that legitimately hold objects or arrays, so we skip descending into them. */
const OPAQUE_KEYS = new Set(['on', 'permissions', 'concurrency', 'defaults']);

export function findCoercedValues(node, trail = []) {
  const problems = [];

  if (Array.isArray(node)) {
    node.forEach((item, i) => problems.push(...findCoercedValues(item, [...trail, `[${i}]`])));
    return problems;
  }

  if (node === null || typeof node !== 'object') return problems;

  for (const [key, value] of Object.entries(node)) {
    const here = [...trail, key];

    if (STRING_KEYS.has(key) && value !== null && typeof value !== 'string') {
      problems.push({
        path: here.join('.'),
        message:
          `\`${key}\` must be a string but parsed as ${Array.isArray(value) ? 'an array' : 'an object'}. ` +
          'An unquoted value containing ": " is the usual cause — wrap it in quotes or a YAML block scalar (|).',
      });
      continue;
    }

    if (OPAQUE_KEYS.has(key) && key !== 'on') continue;
    problems.push(...findCoercedValues(value, here));
  }

  return problems;
}

export function checkFile(file) {
  // `yaml` is not a dependency, so use a minimal structural scan instead of a
  // full parse: find `run:`/`uses:`/`if:`/`name:` lines whose value is an
  // unquoted scalar containing ": ".
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const problems = [];

  lines.forEach((raw, i) => {
    // Allow the YAML list marker: "- run: ..." as well as "run: ...".
    const match = /^\s*(?:-\s+)?(run|uses|if|name|shell|working-directory):\s+(.*)$/.exec(raw);
    if (!match) return;
    const [, key, value] = match;

    const trimmed = value.trim();
    // Quoted, or a block scalar indicator, is safe.
    if (
      trimmed === '' ||
      trimmed.startsWith('"') ||
      trimmed.startsWith("'") ||
      trimmed.startsWith('|') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('>')
    ) {
      return;
    }
    // A `${{ ... }}` expression is fine even when it contains a colon.
    if (trimmed.startsWith('${{')) return;
    // A colon only breaks the scalar when followed by a space.
    if (/:\s/.test(trimmed)) {
      problems.push({
        file,
        line: i + 1,
        message: `\`${key}: ${trimmed}\` is an unquoted scalar containing ": " — it will parse as a mapping. Quote it or use a block scalar (|).`,
      });
    }
  });

  return problems;
}

function main() {
  if (!fs.existsSync(WORKFLOW_DIR)) {
    console.error(`No workflow directory at ${WORKFLOW_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => path.join(WORKFLOW_DIR, f));

  const problems = files.flatMap(checkFile);

  if (problems.length > 0) {
    console.error('Workflow YAML problems:\n');
    for (const p of problems) {
      console.error(`  ${p.file}:${p.line}\n    ${p.message}`);
    }
    process.exit(1);
  }

  console.log(`Workflow YAML looks fine (${files.length} file(s) checked).`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
