import { describe, it, expect } from "vitest";
import { deepMerge, stripUndefined, DEFAULT_SETTINGS } from "@/hooks/useSettings";

describe("deepMerge", () => {
  it("fills missing nested optional keys from defaults", () => {
    const override = { seo: { siteTitle: "Custom Title" }, updatedAt: 123 };
    const merged = deepMerge(DEFAULT_SETTINGS, override) as typeof DEFAULT_SETTINGS;
    expect(merged.seo.siteTitle).toBe("Custom Title");
    expect(merged.seo.siteDescription).toBe(DEFAULT_SETTINGS.seo.siteDescription);
    expect(merged.seo.twitterHandle).toBe(DEFAULT_SETTINGS.seo.twitterHandle);
    expect(merged.personalInfo.name).toBe(DEFAULT_SETTINGS.personalInfo.name);
    expect(merged.features.showTestimonials).toBe(DEFAULT_SETTINGS.features.showTestimonials);
    expect(merged.updatedAt).toBe(123);
  });

  it("keeps top-level values from the override even over defaults", () => {
    const merged = deepMerge(DEFAULT_SETTINGS, { personalInfo: { name: "X" } });
    expect((merged as typeof DEFAULT_SETTINGS).personalInfo.name).toBe("X");
  });

  it("handles non-object overrides", () => {
    expect(deepMerge("base", "override")).toBe("override");
    expect(deepMerge("base", undefined)).toBe("base");
  });
});

describe("stripUndefined", () => {
  it("removes undefined values recursively", () => {
    const result = stripUndefined({
      a: 1,
      b: undefined,
      nested: { c: "ok", d: undefined },
      arr: [1, undefined, 2],
    });
    expect(result).toEqual({ a: 1, nested: { c: "ok" }, arr: [1, 2] });
  });

  it("returns primitives as-is", () => {
    expect(stripUndefined("x")).toBe("x");
    expect(stripUndefined(0)).toBe(0);
    expect(stripUndefined(null)).toBe(null);
  });
});