import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { firebaseConfig, hasRequiredConfig, isFirebaseEnabled } from './firebase-config';

// Auth, Storage, and Analytics are lazy-loaded on demand to keep the
// synchronous entry-point bundle as small as possible.
// – firebase/auth    → loaded only when Admin page mounts
// – firebase/storage → loaded only when image-upload is triggered
// – firebase/analytics → loaded only in production after page is interactive

// The public hooks import isFirebaseEnabled / hasRequiredConfig from
// ./firebase-config, which carries no firebase/* import, so nothing above the
// fold pulls this ~380 kB module into the entry graph. Firestore is reached
// through getDb() in ./firestore-client instead of a static `db` binding.
export { hasRequiredConfig, isFirebaseEnabled };

// ─── Core Firebase instances (synchronous) ──────────────────────────────────
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
