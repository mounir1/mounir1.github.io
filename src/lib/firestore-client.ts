import type { Firestore } from "firebase/firestore";

/**
 * Lazily-initialised Firestore handle.
 *
 * `@/lib/firebase` statically imports `firebase/app` + `firebase/firestore`, so
 * every module that touched it — including the public hooks used above the fold —
 * pulled the whole 380 kB firebase-vendor chunk into the entry graph. Nothing on
 * the landing page needs a database connection to render: the hooks ship seed
 * data and only *subscribe* inside an effect, so the connection can wait until
 * after first paint.
 *
 * The config flags (`isFirebaseEnabled`, `hasRequiredConfig`) are still imported
 * eagerly, because they are cheap pure booleans and the hooks must decide
 * synchronously whether to render seed data or a loading state.
 */
let dbPromise: Promise<Firestore> | null = null;

export function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = import("@/lib/firebase").then(({ db }) => {
      if (!db) throw new Error("Firestore is not available (Firebase disabled or misconfigured)");
      return db;
    });
  }
  return dbPromise;
}

/** Test seam — drops the memoised promise so a fresh import is attempted. */
export function resetDbForTests(): void {
  dbPromise = null;
}
