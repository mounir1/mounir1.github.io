import { describe, it, expect } from "vitest";
import { stripUndefined, sanitizeDoc } from "@/utils/firestore-write";

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

  it("returns primitives and null as-is", () => {
    expect(stripUndefined("x")).toBe("x");
    expect(stripUndefined(0)).toBe(0);
    expect(stripUndefined(null)).toBe(null);
    expect(stripUndefined(false)).toBe(false);
  });

  it("keeps Date instances intact", () => {
    const d = new Date(1700000000000);
    expect(stripUndefined({ at: d })).toEqual({ at: d });
  });
});

describe("sanitizeDoc", () => {
  it("drops a top-level local id and undefined fields", () => {
    const out = sanitizeDoc({ id: "local-3", title: "T", hidden: undefined, priority: 10 });
    expect(out).toEqual({ title: "T", priority: 10 });
  });

  it("keeps nested object contents (deep undefined removal only)", () => {
    const out = sanitizeDoc({
      id: "x1",
      metrics: { usersReached: undefined, uptime: "99.9%" },
      tags: ["a", undefined],
    });
    expect(out).toEqual({ metrics: { uptime: "99.9%" }, tags: ["a"] });
  });

  it("produces an object safe to hand to Firestore", () => {
    const out = sanitizeDoc({ category: undefined, title: "Upcoming" });
    Object.values(out).forEach((v) => expect(v).not.toBeUndefined());
  });
});
