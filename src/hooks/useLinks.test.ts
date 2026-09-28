import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const h = vi.hoisted(() => ({
  next: undefined as ((snapshot: unknown) => void) | undefined,
  error: undefined as (() => void) | undefined,
  query: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: { __mock: "db" }, isFirebaseEnabled: true }));

vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, name: string) => ({ name }),
  onSnapshot: (_q: unknown, next: (s: unknown) => void, error: () => void) => {
    h.next = next;
    h.error = error;
    return () => {};
  },
  query: h.query,
  orderBy: h.orderBy,
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(async () => ({ empty: false, docs: [], size: 0 })),
}));

import { useLinks, DEFAULT_LINKS } from "@/hooks/useLinks";

const snap = (rows: Array<{ id: string; data: Record<string, unknown> }>) => ({
  docs: rows.map((r) => ({ id: r.id, data: () => r.data })),
});

describe("useLinks (index-free read)", () => {
  it("subscribes to the bare collection — never a query with orderBy", () => {
    renderHook(() => useLinks());

    expect(h.next).toBeTypeOf("function");
    expect(h.query).not.toHaveBeenCalled();
    expect(h.orderBy).not.toHaveBeenCalled();
  });

  it("sorts by priority descending on the client", () => {
    const { result } = renderHook(() => useLinks());

    act(() => {
      h.next!(
        snap([
          { id: "low", data: { label: "Low", priority: 1, active: true } },
          { id: "high", data: { label: "High", priority: 99, active: true } },
          { id: "mid", data: { label: "Mid", priority: 50, active: true } },
        ]),
      );
    });

    expect(result.current.links.map((l) => l.id)).toEqual(["high", "mid", "low"]);
    expect(result.current.loading).toBe(false);
  });

  it("falls back to DEFAULT_LINKS on listener errors (no phantom ids)", () => {
    const { result } = renderHook(() => useLinks());

    act(() => {
      h.error!();
    });

    expect(result.current.links.map((l) => l.id)).toEqual(DEFAULT_LINKS.map((l) => l.id));
    expect(result.current.loading).toBe(false);
  });
});
