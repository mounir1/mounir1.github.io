import { describe, it, expect } from "vitest";
import { projectsIndex, findSlugByDiskPath } from "@/data/projects-index";
import { initialProjects } from "@/data/initial-projects";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/hooks/useProjects";

const entries = Object.values(projectsIndex);

describe("initial-projects data integrity", () => {
  it("has at least one project", () => {
    expect(initialProjects.length).toBeGreaterThan(0);
  });

  it("every project has a non-empty title", () => {
    initialProjects.forEach((p, i) => {
      expect(p.title, `project[${i}].title`).toBeTruthy();
      expect(p.title.length).toBeGreaterThan(5);
    });
  });

  it("every project has a non-empty description", () => {
    initialProjects.forEach((p, i) => {
      expect(p.description, `project[${i}].description`).toBeTruthy();
      expect(p.description.length).toBeGreaterThan(20);
    });
  });

  it("every project has at least one technology", () => {
    initialProjects.forEach((p, i) => {
      expect(
        p.technologies.length,
        `project[${i}].technologies`,
      ).toBeGreaterThan(0);
    });
  });

  it("every project has at least one achievement", () => {
    initialProjects.forEach((p, i) => {
      expect(
        p.achievements.length,
        `project[${i}].achievements`,
      ).toBeGreaterThan(0);
    });
  });

  it("every project has a numeric priority", () => {
    initialProjects.forEach((p, i) => {
      expect(
        typeof p.priority,
        `project[${i}].priority`,
      ).toBe("number");
    });
  });

  it("every project has createdAt and updatedAt timestamps", () => {
    initialProjects.forEach((p, i) => {
      expect(p.createdAt, `project[${i}].createdAt`).toBeGreaterThan(0);
      expect(p.updatedAt, `project[${i}].updatedAt`).toBeGreaterThan(0);
    });
  });

  it("at least one project is featured", () => {
    expect(initialProjects.some((p) => p.featured)).toBe(true);
  });

  it("featured flag and disabled flag are booleans", () => {
    initialProjects.forEach((p, i) => {
      expect(typeof p.featured, `project[${i}].featured`).toBe("boolean");
      expect(typeof p.disabled, `project[${i}].disabled`).toBe("boolean");
    });
  });

  it("has no duplicate titles", () => {
    const titles = initialProjects.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

// projects-index.ts and initial-projects.ts are two layers of the same registry.
// Nothing in the build cross-checks them, so adding a project to one and not the
// other is silent: the verifier passes (it only walks the index), the portfolio
// shows whatever was seeded, and the discrepancy surfaces much later as "why is
// this project missing" or "why does this one have no disk path".
describe("projects-index <-> initial-projects", () => {
  it("has at least one indexed project", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("every index slug matches its own record key", () => {
    for (const entry of entries) {
      expect(entry.slug, `record key vs slug for "${entry.slug}"`).toBe(
        Object.keys(projectsIndex).find((k) => projectsIndex[k] === entry),
      );
    }
  });

  it("every index entry has a title and a description", () => {
    for (const entry of entries) {
      expect(entry.title, `${entry.slug}.title`).toBeTruthy();
      expect(entry.description, `${entry.slug}.description`).toBeTruthy();
    }
  });

  it("no two entries claim the same disk path", () => {
    const paths = entries.map((e) => e.diskPath).filter(Boolean);
    expect(
      new Set(paths).size,
      `duplicate diskPath in: ${paths.join(", ")}`,
    ).toBe(paths.length);
  });

  it("findSlugByDiskPath round-trips every entry that has a path", () => {
    for (const entry of entries) {
      if (!entry.diskPath) continue;
      expect(
        findSlugByDiskPath(entry.diskPath),
        `reverse lookup for ${entry.diskPath}`,
      ).toBe(entry.slug);
    }
  });

  // The verifier (scripts/verify-project-data.ts) only walks the index, so an
  // index entry with no seeded counterpart is invisible to it. Every indexed
  // project should therefore also exist as portfolio content.
  it("every index entry is reachable from the portfolio title set", () => {
    const titles = new Set(initialProjects.map((p) => p.title));
    const orphans = entries.map((e) => e.title).filter((t) => !titles.has(t));
    expect(
      orphans,
      `indexed but not seeded — add to initial-projects.ts: ${orphans.join(" | ")}`,
    ).toEqual([]);
  });
});

describe("canonical project vocabularies", () => {
  it("every seeded project has a category from the canonical vocabulary", () => {
    initialProjects.forEach((p, i) => {
      expect(PROJECT_CATEGORIES, `project[${i}] "${p.title}"`).toContain(
        p.category,
      );
    });
  });

  it("every seeded project has a status from the canonical vocabulary", () => {
    initialProjects.forEach((p, i) => {
      expect(PROJECT_STATUSES, `project[${i}] "${p.title}"`).toContain(p.status);
    });
  });
});

// Logo/image resolution lives in asset-references.test.ts, which checks every
// seed collection (projects, experience, testimonials) against public/ with the
// case sensitivity GitHub Pages applies.
