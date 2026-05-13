import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

// Auth, Storage, and Analytics are lazy-loaded on demand to keep the
// synchronous entry-point bundle as small as possible.
// – firebase/auth    → loaded only when Admin page mounts
// – firebase/storage → loaded only when image-upload is triggered
// – firebase/analytics → loaded only in production after page is interactive

// ─── Firebase configuration (from Vite env vars, baked in at build time) ─────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ─── Validate: all three required keys must be non-empty, non-placeholder ─────
const PLACEHOLDER = ['', 'undefined', 'null', 'demo', 'mock', 'test', 'placeholder'];
function isRealValue(v: string | undefined): boolean {
  if (!v) return false;
  const lower = v.toLowerCase().trim();
  return !PLACEHOLDER.some(p => lower === p || lower.startsWith(p + '-'));
}

export const hasRequiredConfig: boolean = (
  isRealValue(firebaseConfig.apiKey) &&
  isRealValue(firebaseConfig.authDomain) &&
  isRealValue(firebaseConfig.projectId)
);

// ─── isFirebaseEnabled ────────────────────────────────────────────────────────
// Enabled ONLY when the three required config values are genuinely present.
// In development: also enabled when VITE_FIREBASE_ENABLE_DEV=true and real keys exist.
// This is the single source of truth — no "PROD always true" bypass.
export const isFirebaseEnabled: boolean = (() => {
  if (!hasRequiredConfig) return false;                           // always gate on real keys
  if (import.meta.env.PROD) return true;                         // production: enable
  if (import.meta.env.VITE_FIREBASE_ENABLE_DEV === 'true') return true; // dev opt-in
  return false;                                                   // dev default: local data
})();

// ─── Core Firebase instances (synchronous — needed on every page load) ────────
let app: FirebaseApp | undefined;
let db:  Firestore   | undefined;

if (hasRequiredConfig) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db  = getFirestore(app);

    // Firestore emulator: dev only, when explicitly requested
    if (
      import.meta.env.DEV &&
      typeof window !== 'undefined' &&
      import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true'
    ) {
      try {
        connectFirestoreEmulator(db, 'localhost', 8081);
      } catch {
        // emulator not running — fall through silently
      }
    }
  } catch (error) {
    // Surface config errors clearly in production
    if (import.meta.env.PROD) {
      console.error('❌ Firebase init failed — check VITE_FIREBASE_* env vars:', error);
    }
    app = db = undefined;
  }
} else if (import.meta.env.PROD) {
  // In production with bad/missing keys, log a clear actionable error
  console.error(
    '❌ Firebase not initialised — missing or invalid environment variables.\n' +
    `   VITE_FIREBASE_API_KEY     = "${firebaseConfig.apiKey ?? '(empty)'}"\n` +
    `   VITE_FIREBASE_AUTH_DOMAIN = "${firebaseConfig.authDomain ?? '(empty)'}"\n` +
    `   VITE_FIREBASE_PROJECT_ID  = "${firebaseConfig.projectId ?? '(empty)'}"\n` +
    '   Fix: ensure these are set in .env.production before building.'
  );
}

export { app, db };

// ─── Lazy auth loader ─────────────────────────────────────────────────────────
export async function getFirebaseAuth() {
  if (!app) return { auth: undefined, GithubAuthProvider: undefined };
  const {
    getAuth,
    connectAuthEmulator,
    GithubAuthProvider,
  } = await import('firebase/auth');
  const auth = getAuth(app);
  if (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true'
  ) {
    try { connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true }); }
    catch { /* emulator not running */ }
  }
  return { auth, GithubAuthProvider };
}

// ─── Lazy storage loader ──────────────────────────────────────────────────────
export async function getFirebaseStorage() {
  if (!app) return undefined;
  const { getStorage } = await import('firebase/storage');
  return getStorage(app);
}

// ─── Lazy analytics loader ────────────────────────────────────────────────────
export async function initFirebaseAnalytics() {
  if (!app || !import.meta.env.PROD || typeof window === 'undefined') return;
  if (!firebaseConfig.measurementId) return;
  try {
    const { getAnalytics } = await import('firebase/analytics');
    getAnalytics(app);
  } catch {
    // analytics failure must never break the app
  }
}
