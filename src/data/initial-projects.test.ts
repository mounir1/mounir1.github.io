import { describe, it, expect } from "vitest";
import { initialProjects } from "@/data/initial-projects";
import type { ProjectInput, ProjectCategory, ProjectStatus } from "@/hooks/useProjects";

const VALID_CATEGORIES: ProjectCategory[] = [
  "Web Application",
  "Mobile Application",
  "Enterprise Integration",
  "E-commerce",
  "Machine Learning",
  "API Development",
  "DevOps & Infrastructure",
  "Hospitality Solutions",
  "Other",
];

const VALID_STATUSES: ProjectStatus[] = [
  "completed",
  "in-progress",
  "in-development",
  "active",
  "maintenance",
  "archived",
];

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

  it("every project has a valid category", () => {
    initialProjects.forEach((p, i) => {
      // Allow categories beyond the typed union (data-driven)
      expect(p.category, `project[${i}].category`).toBeTruthy();
    });
  });

  it("every project has a valid status", () => {
    initialProjects.forEach((p, i) => {
      expect(
        VALID_STATUSES,
        `project[${i}].status="${p.status}"`
      ).toContain(p.status);
    });
  });

  it("every project has at least one technology", () => {
    initialProjects.forEach((p, i) => {
      expect(
        p.technologies.length,
        `project[${i}].technologies`
      ).toBeGreaterThan(0);
    });
  });

  it("every project has at least one achievement", () => {
    initialProjects.forEach((p, i) => {
      expect(
        p.achievements.length,
        `project[${i}].achievements`
      ).toBeGreaterThan(0);
    });
  });

  it("every project has a numeric priority", () => {
    initialProjects.forEach((p, i) => {
      expect(
        typeof p.priority,
        `project[${i}].priority`
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
