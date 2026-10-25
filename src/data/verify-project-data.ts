/**
 * VERIFY PROJECT DATA — Fact-checker that validates portfolio project data
 * against the actual C:\projects directories on disk.
 *
 * Usage (Node.js — run from project root):
 *   npx tsx src/data/verify-project-data.ts
 *
 * What it checks:
 *   1. Local entries in projects-index.ts have matching directories on disk
 *   2. Remote-only entries have a repository reference (the URL is not probed)
 *   3. Every project in initial-projects.ts has a matching slug in projects-index
 *   4. Local directory existence, README presence, and package.json validity
 *   5. Reports warnings for missing references or local project files
 *
 * ─── Data Policy ─────────────────────────────────────────────────────────
 * Every project must correspond to a local checkout or a recorded remote
 * repository. Remote availability and portfolio claims require separate review.
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { projectsIndex } from "./projects-index";
import { initialProjects } from "./initial-projects";
import { initialSkills } from "./initial-skills";

const PROJECTS_ROOT = "C:\\projects";

interface VerificationResult {
  slug: string;
  title: string;
  diskPath: string;
  fullDiskPath: string;
  verificationMode: "local" | "remote";
  directoryExists: boolean | null;
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasSrc: boolean;
  issues: string[];
}

function verifySingleEntry(
  slug: string,
  entry: (typeof projectsIndex)[string],
  projectsRoot = PROJECTS_ROOT,
): VerificationResult {
  const verificationMode = entry.diskPath ? "local" : "remote";
  const fullDiskPath = entry.diskPath ? join(projectsRoot, entry.diskPath) : "";
  const issues: string[] = [];
  const result: VerificationResult = {
    slug,
    title: entry.title,
    diskPath: entry.diskPath,
    fullDiskPath,
    verificationMode,
    directoryExists: verificationMode === "local" ? existsSync(fullDiskPath) : null,
    hasReadme: false,
    hasPackageJson: false,
    hasSrc: false,
    issues,
  };

  // Remote-only entries have no local checkout to inspect. The repository URL
  // is recorded as a reference, but this offline check does not probe it.
  if (verificationMode === "remote") {
    if (!entry.repoUrl) {
      issues.push("Remote-only entry has neither diskPath nor repoUrl");
    }
    return result;
  }

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
    // Check for other recognized project files
    const goModPath = join(fullDiskPath, "go.mod");
    const pyProjectPath = join(fullDiskPath, "pyproject.toml");
    const composerPath = join(fullDiskPath, "composer.json");
    const pomPath = join(fullDiskPath, "pom.xml");
    const gradlePath = join(fullDiskPath, "build.gradle");
    const firebasePath = join(fullDiskPath, "firebase.json");
    const dockerfilePath = join(fullDiskPath, "Dockerfile");
    if (
      !existsSync(goModPath) &&
      !existsSync(pyProjectPath) &&
      !existsSync(composerPath) &&
      !existsSync(pomPath) &&
      !existsSync(gradlePath) &&
      !existsSync(firebasePath) &&
      !existsSync(dockerfilePath)
    ) {
      issues.push("No recognizable project file (package.json, go.mod, composer.json, pom.xml, etc.)");
    }
  }

  return result;
}

function verifyAll(): {
  results: VerificationResult[];
  passed: number;
  failed: number;
  warnings: number;
  remote: number;
} {
  const entries = Object.entries(projectsIndex);
  const results = entries.map(([slug, entry]) => verifySingleEntry(slug, entry));

  const missingOnDisk = results.filter(
    (r) => r.verificationMode === "local" && !r.directoryExists,
  );
  const withWarnings = results.filter((r) => r.issues.length > 0);
  const clean = results.filter(
    (r) => r.verificationMode === "local" && r.directoryExists && r.issues.length === 0,
  );
  const remote = results.filter((r) => r.verificationMode === "remote");

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

  // Cross-check: every project slug referenced by a skill must exist in the index
  const knownSlugs = new Set(Object.keys(projectsIndex));
  const badSkillRefs = initialSkills
    .filter((s) => (s.projects ?? []).some((slug) => !knownSlugs.has(slug)))
    .map((s) => ({
      skill: s.name,
      bad: (s.projects ?? []).filter((slug) => !knownSlugs.has(slug)),
    }));

  if (badSkillRefs.length > 0) {
    console.warn(
      "\n⚠️  Skills referencing unknown project slugs:",
      badSkillRefs
        .map((b) => `"${b.skill}" → [${b.bad.join(", ")}]`)
        .join("; "),
    );
  }

  return {
    results,
    passed: clean.length,
    failed: missingOnDisk.length,
    warnings: withWarnings.length,
    remote: remote.length,
  };
}

// ─── Report ──────────────────────────────────────────────────────────────

function printReport(summary: ReturnType<typeof verifyAll>): void {
  const { results, passed, failed, warnings } = summary;

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  PROJECT DATA VERIFICATION REPORT");
  console.log("══════════════════════════════════════════════════════════\n");

  results.forEach((r) => {
    const status =
      r.issues.length > 0
        ? "⚠️  WARN"
        : r.verificationMode === "remote"
          ? "🌐 REMOTE"
          : !r.directoryExists
            ? "❌ MISSING"
            : "✅ OK";
    console.log(`  ${status}  ${r.slug}`);
    console.log(
      `       ${r.diskPath || `Remote reference: ${projectsIndex[r.slug]?.repoUrl ?? "not recorded (not network-checked)"}`}`,
    );
    if (r.issues.length > 0) {
      r.issues.forEach((issue) => console.log(`       → ${issue}`));
    }
    console.log("");
  });

  console.log("──────────────────────────────────────────────────────────");
  console.log(
    `  Total: ${results.length}  |  ✅ Local pass: ${passed}  |  🌐 Remote refs: ${summary.remote} (not network-checked)  |  ⚠️  Warnings: ${warnings}  |  ❌ Missing local: ${failed}`,
  );
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