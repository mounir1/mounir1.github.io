import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} as const;

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "mock-api-key-for-development"
);

/**
 * Firebase is enabled in production with valid config,
 * or in development when VITE_FIREBASE_ENABLE_DEV=true.
 */
export const isFirebaseEnabled: boolean =
  hasRequiredConfig &&
  (import.meta.env.PROD ||
    (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_ENABLE_DEV === "true"));

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let analytics: Analytics | undefined;

if (isFirebaseEnabled) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  if (typeof window !== "undefined" && import.meta.env.PROD) {
    try {
      analytics = getAnalytics(app);
    } catch {
      // Analytics may be blocked by adblockers – silently ignore
    }
  }
}

export { app, db, auth, analytics, firebaseConfig };
