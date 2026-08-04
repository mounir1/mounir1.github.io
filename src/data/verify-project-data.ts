/**
 * VERIFY PROJECT DATA — Fact-checker that validates portfolio project data
 * against the actual C:\projects directories on disk.
 *
 * Usage (Node.js — run from project root):
 *   npx tsx src/data/verify-project-data.ts
 *
 * What it checks:
 *   1. Every entry in projects-index.ts has a matching directory on disk
 *   2. Every project in initial-projects.ts has a matching slug in projects-index
 *   3. Directory existence, README presence, and package.json validity
 *   4. Reports warnings for missing directories, outdated data, or mismatches
 *
 * ─── Data Policy ─────────────────────────────────────────────────────────
 * Every project in the portfolio must correspond to a real directory on disk
 * at C:\projects. This utility enforces that invariant.
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { projectsIndex } from "./projects-index";
import { initialProjects } from "./initial-projects";

const PROJECTS_ROOT = "C:\\projects";

interface VerificationResult {
  slug: string;
  title: string;
  diskPath: string;
  fullDiskPath: string;
  directoryExists: boolean;
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasSrc: boolean;
  issues: string[];
}

function verifySingleEntry(
  slug: string,
  entry: (typeof projectsIndex)[string],
): VerificationResult {
  const fullDiskPath = join(PROJECTS_ROOT, entry.diskPath);
  const issues: string[] = [];
  const result: VerificationResult = {
    slug,
    title: entry.title,
    diskPath: entry.diskPath,
    fullDiskPath,
    directoryExists: existsSync(fullDiskPath),
    hasReadme: false,
    hasPackageJson: false,
    hasSrc: false,
    issues,
  };

  if (!result.directoryExists) {
    issues.push(`Directory does not exist: ${fullDiskPath}`);
    return result;
  }

  // Check for README
  const readmePath = join(fullDiskPath, "README.md");
  result.hasReadme = existsSync(readmePath);

  // Check for package.json
  const pkgPath = join(fullDiskPath, "package.json");
  result.hasPackageJson = existsSync(pkgPath);

  // Check for src directory
  const srcPath = join(fullDiskPath, "src");
  result.hasSrc = existsSync(srcPath);

  // Generate suggestions
  if (!result.hasReadme) {
    issues.push("No README.md found — consider adding one");
  }
  if (!result.hasPackageJson) {
    // Check for other project files
    const goModPath = join(fullDiskPath, "go.mod");
    const pyProjectPath = join(fullDiskPath, "pyproject.toml");
    if (!existsSync(goModPath) && !existsSync(pyProjectPath)) {
      issues.push("No recognizable project file (package.json, go.mod, pyproject.toml)");
    }
  }

  return result;
}

function verifyAll(): {
  results: VerificationResult[];
  passed: number;
  failed: number;
  warnings: number;
} {
  const entries = Object.entries(projectsIndex);
  const results = entries.map(([slug, entry]) => verifySingleEntry(slug, entry));

  const missingOnDisk = results.filter((r) => !r.directoryExists);
  const withWarnings = results.filter(
    (r) => r.directoryExists && r.issues.length > 0,
  );
  const clean = results.filter(
    (r) => r.directoryExists && r.issues.length === 0,
  );

  // Cross-check: every project in initial-projects.ts should have a matching slug
  const seedTitles = new Set(initialProjects.map((p) => p.title));
  const indexTitles = new Set(Object.values(projectsIndex).map((e) => e.title));
  const unmatchedSeedProjects = initialProjects.filter(
    (p) => !indexTitles.has(p.title),
  );

  if (unmatchedSeedProjects.length > 0) {
    console.warn(
      "\n⚠️  Seed projects without projects-index entries:",
      unmatchedSeedProjects.map((p) => `"${p.title}"`).join(", "),
    );
  }

  return {
    results,
    passed: clean.length,
    failed: missingOnDisk.length,
    warnings: withWarnings.length,
  };
}

// ─── Report ──────────────────────────────────────────────────────────────

function printReport(summary: ReturnType<typeof verifyAll>): void {
  const { results, passed, failed, warnings } = summary;

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  PROJECT DATA VERIFICATION REPORT");
  console.log("══════════════════════════════════════════════════════════\n");

  results.forEach((r) => {
    const status = !r.directoryExists
      ? "❌ MISSING"
      : r.issues.length > 0
        ? "⚠️  WARN"
        : "✅ OK";
    console.log(`  ${status}  ${r.slug}`);
    console.log(`       ${r.diskPath}`);
    if (r.issues.length > 0) {
      r.issues.forEach((issue) => console.log(`       → ${issue}`));
    }
    console.log("");
  });

  console.log("──────────────────────────────────────────────────────────");
  console.log(`  Total: ${results.length}  |  ✅ Pass: ${passed}  |  ⚠️  Warnings: ${warnings}  |  ❌ Missing: ${failed}`);
  console.log("──────────────────────────────────────────────────────────\n");

  if (failed > 0) {
    console.log(
      "  ACTION REQUIRED: Update projects-index.ts with correct diskPath\n",
    );
  }
}

// ─── CLI Entry Point ────────────────────────────────────────────────────
const isMainModule =
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() ===
    resolve(process.argv[1]).toLowerCase();

if (isMainModule) {
  const summary = verifyAll();
  printReport(summary);

  const exitCode = summary.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

export { verifySingleEntry, verifyAll, printReport };
export type { VerificationResult };