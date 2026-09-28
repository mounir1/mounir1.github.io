import { describe, it, expect } from "vitest";
import {
  buildPlan,
  dedupKey,
  diffSettings,
  fromValue,
  pairRenames,
  sanitizeLocal,
  toValue,
  type ExistingDoc,
  type SeedItem,
} from "@/utils/sync-firestore-rest";

const live = (id: string, data: SeedItem): ExistingDoc => ({ id, data });

describe("toValue / fromValue (Firestore REST encoding)", () => {
  it("round-trips scalars, arrays and nested maps", () => {
    const original: SeedItem = {
      s: "text",
      i: 42,
      f: 1.5,
      b: true,
      n: null,
      arr: ["a", "b"],
      nested: { deep: { x: 1 } },
    };
    expect(fromValue(toValue(original))).toEqual(original);
  });

  it("encodes integers as integerValue and fractions as doubleValue", () => {
    expect(toValue(42)).toEqual({ integerValue: "42" });
    expect(toValue(0)).toEqual({ integerValue: "0" });
    expect(toValue(1.5)).toEqual({ doubleValue: 1.5 });
  });

  it("reads every value kind the portfolio stores", () => {
    expect(fromValue({ nullValue: null })).toBeNull();
    expect(fromValue({ stringValue: "x" })).toBe("x");
    expect(fromValue({ booleanValue: false })).toBe(false);
    expect(fromValue({ integerValue: "9" })).toBe(9);
    expect(fromValue({ doubleValue: 2.5 })).toBe(2.5);
    expect(fromValue({ arrayValue: { values: [{ stringValue: "a" }] } })).toEqual(["a"]);
    expect(fromValue({ mapValue: { fields: { k: { stringValue: "v" } } } })).toEqual({ k: "v" });
  });

  it("returns null for kinds it does not handle instead of throwing", () => {
    expect(fromValue({ referenceValue: "projects/x" })).toBeNull();
  });
});

describe("dedupKey", () => {
  it("prefers title, then name, then label, then id — trimmed and lowercased", () => {
    expect(dedupKey({ title: "  WebEX (OWeb Cloud) " })).toBe("webex (oweb cloud)");
    expect(dedupKey({ name: "React" })).toBe("react");
    expect(dedupKey({ label: "GitHub: mounir1" })).toBe("github: mounir1");
    expect(dedupKey({ id: "u1" })).toBe("u1");
    expect(dedupKey({ title: "T", name: "N" })).toBe("t");
    expect(dedupKey({})).toBe("");
  });
});

describe("sanitizeLocal", () => {
  it("drops a top-level local id and removes undefined values deep", () => {
    expect(
      sanitizeLocal({ id: "u1", title: "T", maybe: undefined, nested: { a: 1, b: undefined } }),
    ).toEqual({ title: "T", nested: { a: 1 } });
  });
});

describe("pairRenames", () => {
  it("pairs one retitled seed row with the single leftover live doc", () => {
    const pairs = pairRenames(
      [{ title: "WebEX (OWeb Cloud) — Multi-Tenant Hotel ERP Suite" }],
      [live("8AfVTlAdER73PgfIGb9T", { title: "WebEX — HoTech Web Extension Platform" })],
    );
    expect(pairs.size).toBe(1);
    expect([...pairs.values()][0].id).toBe("8AfVTlAdER73PgfIGb9T");
  });

  it("refuses to pair titles that share no word", () => {
    const pairs = pairRenames(
      [{ title: "Brand New Project" }],
      [live("d2", { title: "Totally Unrelated" })],
    );
    expect(pairs.size).toBe(0);
  });

  it("refuses when either side has more than one leftover", () => {
    expect(
      pairRenames([{ title: "A One" }, { title: "B Two" }], [live("d3", { title: "A One Thing" })]).size,
    ).toBe(0);
    expect(
      pairRenames([{ title: "A One" }], [live("d3", { title: "A One Thing" }), live("d4", { title: "A One Other" })]).size,
    ).toBe(0);
  });
});

describe("buildPlan", () => {
  const seedProjects: SeedItem[] = [
    { title: "WebEX (OWeb Cloud) — Multi-Tenant Hotel ERP Suite", description: "new", priority: 90 },
    { title: "CloudWeb — Hotel Multi-Service Web Platform", description: "same", priority: 80 },
  ];
  const liveDocs: ExistingDoc[] = [
    {
      id: "8AfVTlAdER73PgfIGb9T",
      data: {
        title: "WebEX — HoTech Web Extension Platform",
        description: "old",
        priority: 90,
        createdAt: 1501545600000,
        version: 4,
        staleField: "gone",
      },
    },
    {
      id: "plus1",
      data: {
        title: "CloudWeb — Hotel Multi-Service Web Platform",
        description: "same",
        priority: 80,
        createdAt: 111,
        version: 1,
      },
    },
  ];

  it("updates a retitled row in place instead of creating a duplicate", () => {
    const plan = buildPlan("projects", seedProjects, liveDocs);
    expect(plan.actions).toHaveLength(2);
    expect(plan.actions.every((a) => a.kind === "update")).toBe(true);
    expect(plan.actions.map((a) => a.docId)).toEqual(["8AfVTlAdER73PgfIGb9T", "plus1"]);
  });

  it("preserves createdAt, bumps version and remembers live-only keys", () => {
    const plan = buildPlan("projects", seedProjects, liveDocs);
    const webex = plan.actions[0];
    expect(webex.payload.createdAt).toBe(1501545600000);
    expect(webex.payload.version).toBe(5);
    expect(webex.liveKeys).toContain("staleField");
  });

  it("creates rows that do not exist yet, with seed createdAt and version 1", () => {
    const plan = buildPlan(
      "experiences",
      [{ title: "Hotel ERP Developer — WebEX (OWeb Cloud)", createdAt: 1500000000000 }],
      [],
    );
    expect(plan.actions[0].kind).toBe("create");
    expect(plan.actions[0].payload.createdAt).toBe(1500000000000);
    expect(plan.actions[0].payload.version).toBe(1);
  });

  it("never emits a top-level id in the payload", () => {
    const plan = buildPlan("links", [{ id: "d1", label: "hotech.systems", priority: 10 }], []);
    expect(plan.actions[0].payload).not.toHaveProperty("id");
  });

  it("skips duplicate keys inside the seed itself", () => {
    const plan = buildPlan("skills", [{ name: "React" }, { name: "react" }], []);
    expect(plan.actions).toHaveLength(1);
    expect(plan.skipped).toEqual(["react"]);
  });
});

describe("diffSettings", () => {
  it("reports changed leaves and live-only keys, ignoring updatedAt", () => {
    const diffs = diffSettings(
      { seo: { siteDescription: "old" }, features: { betaFlag: true }, updatedAt: 123 },
      { seo: { siteDescription: "new" }, updatedAt: 0 },
    );
    expect(diffs.some((d) => d.startsWith("seo.siteDescription"))).toBe(true);
    expect(diffs.some((d) => d.includes("features.betaFlag") && d.includes("kept"))).toBe(true);
    expect(diffs.some((d) => d.includes("updatedAt"))).toBe(false);
  });

  it("treats a missing settings document as all-new", () => {
    expect(diffSettings(null, { seo: { siteDescription: "x" }, updatedAt: 0 })).toHaveLength(1);
  });
});

