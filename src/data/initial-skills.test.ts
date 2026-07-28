import { describe, it, expect } from "vitest";
import { initialSkills } from "@/data/initial-skills";

describe("initial-skills data integrity", () => {
  it("has at least one skill", () => {
    expect(initialSkills.length).toBeGreaterThan(0);
  });

  it("every skill has a non-empty name", () => {
    initialSkills.forEach((s, i) => {
      expect(s.name, `skill[${i}].name`).toBeTruthy();
    });
  });

  it("every skill has a non-empty category", () => {
    initialSkills.forEach((s, i) => {
      expect(s.category, `skill[${i}].category`).toBeTruthy();
    });
  });

  it("every skill level is between 0 and 100", () => {
    initialSkills.forEach((s, i) => {
      expect(s.level, `skill[${i}].level`).toBeGreaterThanOrEqual(0);
      expect(s.level, `skill[${i}].level`).toBeLessThanOrEqual(100);
    });
  });

  it("every skill has a numeric yearsOfExperience", () => {
    initialSkills.forEach((s, i) => {
      expect(
        typeof s.yearsOfExperience,
        `skill[${i}].yearsOfExperience`
      ).toBe("number");
      expect(s.yearsOfExperience).toBeGreaterThanOrEqual(0);
    });
  });

  it("featured flag is a boolean", () => {
    initialSkills.forEach((s, i) => {
      expect(typeof s.featured, `skill[${i}].featured`).toBe("boolean");
    });
  });

  it("disabled flag is a boolean", () => {
    initialSkills.forEach((s, i) => {
      expect(typeof s.disabled, `skill[${i}].disabled`).toBe("boolean");
    });
  });

  it("every skill has createdAt and updatedAt timestamps", () => {
    initialSkills.forEach((s, i) => {
      expect(s.createdAt, `skill[${i}].createdAt`).toBeGreaterThan(0);
      expect(s.updatedAt, `skill[${i}].updatedAt`).toBeGreaterThan(0);
    });
  });

  it("has no duplicate skill names", () => {
    const names = initialSkills.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("at least one skill is featured", () => {
    expect(initialSkills.some((s) => s.featured)).toBe(true);
  });

  it("has multiple categories", () => {
    const categories = new Set(initialSkills.map((s) => s.category));
    expect(categories.size).toBeGreaterThan(1);
  });
});
