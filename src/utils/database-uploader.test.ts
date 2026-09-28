import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  batchDelete: vi.fn(),
  batchCommit: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: { __mock: "db" }, isFirebaseEnabled: true }));

vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, name: string) => ({ path: name }),
  doc: (_db: unknown, name: string, id: string) => ({ path: `${name}/${id}` }),
  query: (ref: unknown) => ref,
  orderBy: vi.fn(),
  deleteDoc: vi.fn(async () => undefined),
  getDocs: mocks.getDocs,
  addDoc: mocks.addDoc,
  updateDoc: mocks.updateDoc,
  setDoc: mocks.setDoc,
  writeBatch: () => ({ delete: mocks.batchDelete, commit: mocks.batchCommit }),
}));

import {
  COLLECTIONS,
  DatabaseUploader,
  getCollectionCount,
  syncCollection,
} from "@/utils/database-uploader";
import { initialProjects } from "@/data/initial-projects";

type Row = { id: string; data: Record<string, unknown> };

const snapshot = (rows: Row[]) => ({
  docs: rows.map((r) => ({ id: r.id, ref: { path: `mock/${r.id}` }, data: () => r.data })),
  size: rows.length,
  empty: rows.length === 0,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getDocs.mockResolvedValue(snapshot([]));
  mocks.addDoc.mockResolvedValue({ id: "new-doc" });
  mocks.updateDoc.mockResolvedValue(undefined);
  mocks.setDoc.mockResolvedValue(undefined);
  mocks.batchCommit.mockResolvedValue(undefined);
});

describe("DatabaseUploader.uploadCollection — Sync (update existing)", () => {
  it("updates matching rows in place, keeping createdAt and bumping version", async () => {
    mocks.getDocs.mockResolvedValue(
      snapshot([{ id: "p1", data: { title: "Alpha", createdAt: 111, version: 3 } }]),
    );

    const res = await new DatabaseUploader().uploadCollection(
      COLLECTIONS.projects,
      [{ id: "local-0", title: "Alpha", description: "new copy" }],
      { updateExisting: true, skipDuplicates: false },
    );

    expect(res.updated).toBe(1);
    expect(res.success).toBe(0);
    expect(mocks.addDoc).not.toHaveBeenCalled();

    const [ref, payload] = mocks.updateDoc.mock.calls[0];
    expect(ref.path).toBe("projects/p1");
    expect(payload.createdAt).toBe(111);
    expect(payload.version).toBe(4);
    expect(payload.description).toBe("new copy");
    expect(payload).not.toHaveProperty("id");
    expect(Object.values(payload)).not.toContain(undefined);
  });

  it("inserts unmatched rows with the seed createdAt and version 1", async () => {
    const res = await new DatabaseUploader().uploadCollection(
      COLLECTIONS.projects,
      [{ title: "Brand New", createdAt: 999 }],
      { skipDuplicates: true },
    );

    expect(res.success).toBe(1);
    expect(mocks.updateDoc).not.toHaveBeenCalled();
    const [, payload] = mocks.addDoc.mock.calls[0];
    expect(payload.createdAt).toBe(999);
    expect(payload.version).toBe(1);
  });

  it("skips duplicates when updateExisting is off", async () => {
    mocks.getDocs.mockResolvedValue(snapshot([{ id: "p1", data: { title: "Alpha" } }]));

    const res = await new DatabaseUploader().uploadCollection(
      COLLECTIONS.projects,
      [{ title: "Alpha" }],
      { skipDuplicates: true },
    );

    expect(res.skipped).toBe(1);
    expect(res.updated).toBe(0);
    expect(mocks.addDoc).not.toHaveBeenCalled();
    expect(mocks.updateDoc).not.toHaveBeenCalled();
  });
});

describe("DatabaseUploader.clearCollection / clearFirst", () => {
  it("clears the collection first (batched) and then re-inserts everything", async () => {
    mocks.getDocs.mockResolvedValue(
      snapshot([
        { id: "a", data: { title: "Alpha" } },
        { id: "b", data: { title: "Beta" } },
      ]),
    );

    const res = await new DatabaseUploader().uploadCollection(
      COLLECTIONS.projects,
      [{ title: "Alpha" }],
      { clearFirst: true, skipDuplicates: true },
    );

    expect(mocks.batchDelete).toHaveBeenCalledTimes(2);
    expect(mocks.batchCommit).toHaveBeenCalledTimes(1);
    expect(res.details[0]).toContain("Cleared 2");
    expect(res.success).toBe(1);
    expect(mocks.updateDoc).not.toHaveBeenCalled();
  });

  it("deletes in batches of 400 documents", async () => {
    const rows: Row[] = Array.from({ length: 450 }, (_, i) => ({
      id: `d${i}`,
      data: { title: `T${i}` },
    }));
    mocks.getDocs.mockResolvedValue(snapshot(rows));

    const cleared = await new DatabaseUploader().clearCollection(COLLECTIONS.projects);

    expect(cleared).toBe(450);
    expect(mocks.batchCommit).toHaveBeenCalledTimes(2);
    expect(mocks.batchDelete).toHaveBeenCalledTimes(450);
  });
});

describe("DatabaseUploader.uploadAllData", () => {
  it("uploads every seed collection and merges settings/site", async () => {
    const results = await new DatabaseUploader().uploadAllData({ skipDuplicates: true });

    expect(results).toHaveLength(7);
    const projects = results.find((r) => r.collection === COLLECTIONS.projects);
    expect(projects?.success).toBe(initialProjects.length);

    const [ref, payload, opts] = mocks.setDoc.mock.calls[0];
    expect(ref.path).toBe("settings/site");
    expect(opts).toEqual({ merge: true });
    expect(payload).toHaveProperty("personalInfo");
    expect(results.map((r) => r.collection)).toContain("settings/site");
  });
});

describe("syncCollection / getCollectionCount", () => {
  it("syncs one named collection with updateExisting semantics", async () => {
    mocks.getDocs.mockResolvedValue(
      snapshot([{ id: "l1", data: { label: "hotech.systems", version: 2 } }]),
    );

    const res = await syncCollection(COLLECTIONS.links);

    expect(res.updated).toBe(1);
    expect(mocks.updateDoc).toHaveBeenCalled();
    expect(mocks.updateDoc.mock.calls[0][0].path).toBe("links/l1");
  });

  it("throws for an unknown collection name", async () => {
    await expect(syncCollection("not_a_collection")).rejects.toThrow(/Unknown collection/);
  });

  it("reports the doc count and degrades to 0 on read errors", async () => {
    mocks.getDocs.mockResolvedValue(snapshot([{ id: "x", data: {} }, { id: "y", data: {} }]));
    expect(await getCollectionCount("projects")).toBe(2);

    mocks.getDocs.mockRejectedValueOnce(new Error("permission-denied"));
    expect(await getCollectionCount("projects")).toBe(0);
  });
});

