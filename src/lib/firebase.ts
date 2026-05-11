import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import {
  getAuth,
  type Auth,
  connectAuthEmulator,
  GithubAuthProvider,
} from 'firebase/auth';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

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
  // Guard against placeholder values that are not real credentials
  !productionConfig.apiKey.startsWith('demo') &&
  !productionConfig.apiKey.startsWith('mock') &&
  productionConfig.apiKey !== 'undefined'
);

// ─── isFirebaseEnabled ────────────────────────────────────────────────────────
// - Production: always attempt (will surface real errors if misconfigured)
// - Development: only enable when real env vars are present OR emulator flag set
export const isFirebaseEnabled: boolean = (() => {
  if (import.meta.env.PROD) return true;          // Production: always on
  if (import.meta.env.VITE_FIREBASE_ENABLE_DEV === 'true') return true; // explicit dev flag
  return hasRequiredConfig;                        // Dev: only with real config
})();

// ─── Firebase instances ───────────────────────────────────────────────────────
let app:       FirebaseApp      | undefined;
let db:        Firestore        | undefined;
let auth:      Auth             | undefined;
let analytics: Analytics        | undefined;
let storage:   FirebaseStorage  | undefined;

if (isFirebaseEnabled && hasRequiredConfig) {
  try {
    app     = getApps().length ? getApps()[0] : initializeApp(productionConfig);
    db      = getFirestore(app);
    auth    = getAuth(app);
    storage = getStorage(app);

    // Analytics: production only, browser only
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      analytics = getAnalytics(app);
    }

    // Emulators: dev only, when explicitly enabled
    if (
      import.meta.env.DEV &&
      typeof window !== 'undefined' &&
      import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true'
    ) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8081);
        console.log('🔧 Firebase Emulators connected');
      } catch {
        console.log('Firebase emulators not available — using production services');
      }
    }

    console.log(`🔥 Firebase initialised (project: ${productionConfig.projectId})`);
  } catch (error) {
    console.error('❌ Firebase initialisation failed:', error);
    app = db = auth = analytics = storage = undefined;
  }
} else if (isFirebaseEnabled && !hasRequiredConfig) {
  console.warn(
    '⚠️  Firebase is enabled but environment variables are missing or contain placeholder values.\n' +
    '   Copy .env.example → .env.development and fill in your Firebase project credentials.\n' +
    '   Required vars: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID'
  );
}

export { app, db, auth, analytics, storage, GithubAuthProvider };
