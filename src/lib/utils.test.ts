import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes via objects", () => {
    expect(cn("base", { hidden: false, active: true })).toBe("base active");
  });

  it("deduplicates conflicting Tailwind utilities (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("deduplicates conflicting colors", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("filters out falsy values", () => {
    expect(cn("keep", false, null, undefined, "", "also")).toBe("keep also");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });

  it("handles arrays of classes", () => {
    expect(cn(["px-2", "py-1"], "mx-auto")).toBe("px-2 py-1 mx-auto");
  });
});
