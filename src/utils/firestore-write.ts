/**
 * firestore-write.ts
 * ─────────────────── Shared sanitiser for EVERY Firestore write path.
 * Firestore rejects `undefined` values (including inside arrays), and a stray
 * local `id` in a document payload is either rejected semantics-wise or
 * shadows the real document id — so both are stripped before any addDoc /
 * updateDoc / setDoc call.
 */

/** Deep-remove `undefined` values — Firestore cannot store them. */
export function stripUndefined(value: unknown): unknown {
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((v) => v !== undefined);
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[key] = stripUndefined(v);
    }
    return out;
  }
  return value;
}

/** Prepare a document payload: drop a top-level local `id` and all `undefined`s. */
export function sanitizeDoc(payload: object): Record<string, unknown> {
  const { id: _dropped, ...rest } = payload as Record<string, unknown>;
  return stripUndefined(rest) as Record<string, unknown>;
}
