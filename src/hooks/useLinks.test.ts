import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const h = vi.hoisted(() => ({
  next: undefined as ((snapshot: unknown) => void) | undefined,
  error: undefined as (() => void) | undefined,
  query: vi.fn(),
  orderBy: vi.fn(),
}));

// The hook decides synchronously whether to render seed data, so the flag must
// come from the firebase-free config module; the connection itself is opened
// through getDb() only inside the effect.
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
import { useLinks, DEFAULT_LINKS } from "@/hooks/useLinks";

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

describe("useLinks (index-free read)", () => {
  it("subscribes to the bare collection — never a query with orderBy", async () => {
    renderHook(() => useLinks());

    await subscribed();

    expect(h.query).not.toHaveBeenCalled();
    expect(h.orderBy).not.toHaveBeenCalled();
  });

  it("sorts by priority descending on the client", async () => {
    const { result } = renderHook(() => useLinks());

    await subscribed();

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

  it("falls back to DEFAULT_LINKS on listener errors (no phantom ids)", async () => {
    const { result } = renderHook(() => useLinks());

    await waitFor(() => expect(h.error).toBeTypeOf("function"));

    act(() => {
      h.error!();
    });

    expect(result.current.links.map((l) => l.id)).toEqual(DEFAULT_LINKS.map((l) => l.id));
    expect(result.current.loading).toBe(false);
  });

  it("shows a loading state on first render, not seed data", () => {
    // With Firebase enabled the hook must NOT flash DEFAULT_LINKS and then swap
    // in live rows — it starts empty and waits for the listener. Seed data is a
    // fallback for failures, never a preview.
    const { result } = renderHook(() => useLinks());

    expect(result.current.links).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(h.next).toBeUndefined();
  });

  it("does not leave a dangling listener when unmounted mid-connect", async () => {
    const { unmount } = renderHook(() => useLinks());
    unmount();

    await settle();

    // The cancellation guard means the resolve path bails out instead of
    // subscribing to a Firestore listener nothing will ever unsubscribe.
    expect(h.next).toBeUndefined();
  });
});
