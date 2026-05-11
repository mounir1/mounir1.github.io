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
// (no static re-exports of firebase/auth|storage|analytics — even type-only
//  re-exports can cause Rollup to trace those modules into the entry chunk)

// ─── Production Firebase configuration (from env vars only) ──────────────────
const productionConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ─── Validate config ──────────────────────────────────────────────────────────
const hasRequiredConfig = Boolean(
  productionConfig.apiKey &&
  productionConfig.authDomain &&
  productionConfig.projectId &&
  !productionConfig.apiKey.startsWith('demo') &&
  !productionConfig.apiKey.startsWith('mock') &&
  productionConfig.apiKey !== 'undefined'
);

// ─── isFirebaseEnabled ────────────────────────────────────────────────────────
// - Production: always attempt (will surface real errors if misconfigured)
// - Development: only enable when real env vars are present OR emulator flag set
export const isFirebaseEnabled: boolean = (() => {
  if (import.meta.env.PROD) return true;
  if (import.meta.env.VITE_FIREBASE_ENABLE_DEV === 'true') return true;
  return hasRequiredConfig;
})();

// ─── Core Firebase instances (synchronous — needed on every page load) ────────
let app: FirebaseApp | undefined;
let db:  Firestore   | undefined;

if (isFirebaseEnabled && hasRequiredConfig) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(productionConfig);
    db  = getFirestore(app);

    // Firestore emulator: dev only, when explicitly enabled
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
    console.error('❌ Firebase initialisation failed:', error);
    app = db = undefined;
  }
} else if (isFirebaseEnabled && !hasRequiredConfig) {
  console.warn(
    '⚠️  Firebase is enabled but environment variables are missing or contain placeholder values.\n' +
    '   Copy .env.example → .env.development and fill in your Firebase project credentials.\n' +
    '   Required vars: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID'
  );
}

export { app, db };

// ─── Lazy auth loader ─────────────────────────────────────────────────────────
// Call this inside the Admin page / auth hook — not at module load time.
// Returns { auth, GithubAuthProvider } after dynamic import resolves.
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
// Call this in image-upload.ts — not at module load time.
export async function getFirebaseStorage() {
  if (!app) return undefined;
  const { getStorage } = await import('firebase/storage');
  return getStorage(app);
}

// ─── Lazy analytics loader ────────────────────────────────────────────────────
// Called once after the page is interactive, production only.
export async function initFirebaseAnalytics() {
  if (!app || !import.meta.env.PROD || typeof window === 'undefined') return;
  if (!productionConfig.measurementId) return;
  try {
    const { getAnalytics } = await import('firebase/analytics');
    getAnalytics(app);
  } catch {
    // analytics failure must never break the app
  }
}
