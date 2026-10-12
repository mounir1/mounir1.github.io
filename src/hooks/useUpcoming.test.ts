import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const h = vi.hoisted(() => ({
  next: undefined as ((snapshot: unknown) => void) | undefined,
  error: undefined as (() => void) | undefined,
  query: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock("@/lib/firebase-config", () => ({ isFirebaseEnabled: true, hasRequiredConfig: true }));
vi.mock("@/lib/firestore-client", () => ({ getDb: async () => ({ __mock: "db" }) }));

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

import { waitFor } from "@testing-library/react";
import { useUpcoming, DEFAULT_UPCOMING } from "@/hooks/useUpcoming";

const snap = (rows: Array<{ id: string; data: Record<string, unknown> }>) => ({
  docs: rows.map((r) => ({ id: r.id, data: () => r.data })),
});

// `h` is hoisted module state, so a listener captured by one test would
// otherwise still look "attached" to the next one.
beforeEach(() => {
  h.next = undefined;
  h.error = undefined;
  h.query.mockClear();
  h.orderBy.mockClear();
});

/** Flushes the pending dynamic import + getDb() resolves. */
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

/** The listener is attached after two awaits (dynamic import + getDb). */
const subscribed = () => waitFor(() => expect(h.next).toBeTypeOf("function"));

describe("useUpcoming (index-free read)", () => {
  it("subscribes to the bare collection — never a query with orderBy", async () => {
    renderHook(() => useUpcoming());

    await subscribed();

    expect(h.query).not.toHaveBeenCalled();
    expect(h.orderBy).not.toHaveBeenCalled();
  });

  it("sorts by priority descending on the client", async () => {
    const { result } = renderHook(() => useUpcoming());

    await subscribed();

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

  it("falls back to DEFAULT_UPCOMING on listener errors (no phantom ids)", async () => {
    const { result } = renderHook(() => useUpcoming());

    await waitFor(() => expect(h.error).toBeTypeOf("function"));

    act(() => {
      h.error!();
    });

    expect(result.current.upcoming.map((u) => u.id)).toEqual(DEFAULT_UPCOMING.map((u) => u.id));
    expect(result.current.loading).toBe(false);
  });

  it("shows a loading state on first render, not seed data", () => {
    // With Firebase enabled the hook must NOT flash DEFAULT_UPCOMING and then
    // swap in live rows — it starts empty and waits for the listener.
    const { result } = renderHook(() => useUpcoming());

    expect(result.current.upcoming).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(h.next).toBeUndefined();
  });

  it("does not leave a dangling listener when unmounted mid-connect", async () => {
    const { unmount } = renderHook(() => useUpcoming());
    unmount();

    await settle();

    expect(h.next).toBeUndefined();
  });
});
