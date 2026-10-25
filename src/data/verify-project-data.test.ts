import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { verifySingleEntry } from "./verify-project-data";

const tempRoots: string[] = [];

afterEach(() => {
  tempRoots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }));
});

function createTempRoot(): string {
  const root = mkdtempSync(join(process.cwd(), ".verify-project-data-"));
  tempRoots.push(root);
  return root;
}

describe("verifySingleEntry", () => {
  it("treats a remote-only project as not applicable to local directory checks", () => {
    const result = verifySingleEntry(
      "remote-project",
      {
        slug: "remote-project",
        title: "Remote Project",
        diskPath: "",
        type: "personal",
        status: "active",
        importance: "supporting",
        description: "A project maintained outside the local workspace.",
        repoUrl: "https://github.com/example/remote-project",
      },
      createTempRoot(),
    );

    expect(result.verificationMode).toBe("remote");
    expect(result.fullDiskPath).toBe("");
    expect(result.directoryExists).toBeNull();
    expect(result.issues).toEqual([]);
  });

  it("flags remote-only projects with no recorded repository reference", () => {
    const result = verifySingleEntry(
      "unreferenced-project",
      {
        slug: "unreferenced-project",
        title: "Unreferenced Project",
        diskPath: "",
        type: "personal",
        status: "active",
        importance: "supporting",
        description: "A project without a recorded local or remote reference.",
      },
      createTempRoot(),
    );

    expect(result.verificationMode).toBe("remote");
    expect(result.directoryExists).toBeNull();
    expect(result.issues).toContain("Remote-only entry has neither diskPath nor repoUrl");
  });

  it("checks files only inside a declared local project directory", () => {
    const root = createTempRoot();
    const projectPath = join(root, "project");
    mkdirSync(projectPath);
    writeFileSync(join(projectPath, "README.md"), "# Project");
    writeFileSync(join(projectPath, "package.json"), "{}");

    const result = verifySingleEntry(
      "local-project",
      {
        slug: "local-project",
        title: "Local Project",
        diskPath: "project",
        type: "personal",
        status: "active",
        importance: "supporting",
        description: "A project with a local working copy.",
      },
      root,
    );

    expect(result.verificationMode).toBe("local");
    expect(result.directoryExists).toBe(true);
    expect(result.hasReadme).toBe(true);
    expect(result.hasPackageJson).toBe(true);
    expect(result.issues).toEqual([]);
  });
});
