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

import { useUpcoming, DEFAULT_UPCOMING } from "@/hooks/useUpcoming";

const snap = (rows: Array<{ id: string; data: Record<string, unknown> }>) => ({
  docs: rows.map((r) => ({ id: r.id, data: () => r.data })),
});

describe("useUpcoming (index-free read)", () => {
  it("subscribes to the bare collection — never a query with orderBy", () => {
    renderHook(() => useUpcoming());

    expect(h.next).toBeTypeOf("function");
    expect(h.query).not.toHaveBeenCalled();
    expect(h.orderBy).not.toHaveBeenCalled();
  });

  it("sorts by priority descending on the client", () => {
    const { result } = renderHook(() => useUpcoming());

    act(() => {
      h.next!(
        snap([
          { id: "u-low", data: { title: "Low", priority: 1, publicVisible: true } },
          { id: "u-high", data: { title: "High", priority: 90, publicVisible: true } },
        ]),
      );
    });

    expect(result.current.upcoming.map((u) => u.id)).toEqual(["u-high", "u-low"]);
    expect(result.current.loading).toBe(false);
  });

  it("falls back to DEFAULT_UPCOMING on listener errors (no phantom ids)", () => {
    const { result } = renderHook(() => useUpcoming());

    act(() => {
      h.error!();
    });

    expect(result.current.upcoming.map((u) => u.id)).toEqual(DEFAULT_UPCOMING.map((u) => u.id));
    expect(result.current.loading).toBe(false);
  });
});
