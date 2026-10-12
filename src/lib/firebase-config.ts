// ─── Firebase configuration flags ────────────────────────────────────────────
//
// These are pure booleans derived from Vite env vars. They live in their own
// module, free of any `firebase/*` import, because every public hook needs them
// synchronously to decide whether to render seed data — and importing them from
// `@/lib/firebase` would drag the entire firebase-vendor chunk (~380 kB) onto
// the landing page's critical path for a boolean.
//
// `@/lib/firebase` re-exports these so existing imports keep working.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const PLACEHOLDER = ["", "undefined", "null", "demo", "mock", "test", "placeholder"];

function isRealValue(v: string | undefined): boolean {
  if (!v) return false;
  const lower = v.toLowerCase().trim();
  return !PLACEHOLDER.some((p) => lower === p || lower.startsWith(p + "-"));
}

/** All three required keys are present and not placeholders. */
export const hasRequiredConfig: boolean =
  isRealValue(firebaseConfig.apiKey) &&
  isRealValue(firebaseConfig.authDomain) &&
  isRealValue(firebaseConfig.projectId);

/**
 * Single source of truth for "should this build talk to Firestore".
 * Enabled ONLY when real keys exist; never a "PROD always true" bypass.
 */
export const isFirebaseEnabled: boolean = (() => {
  if (!hasRequiredConfig) return false;
  if (import.meta.env.PROD) return true;
  if (import.meta.env.VITE_FIREBASE_ENABLE_DEV === "true") return true;
  return false;
})();

export { firebaseConfig };
