import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, type Auth, connectAuthEmulator, GithubAuthProvider } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Production Firebase configuration
const productionConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Development fallback configuration (for demo purposes)
const developmentConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX",
};

// Use production config if available, otherwise fallback to development
const firebaseConfig = (() => {
  const hasProductionConfig = Boolean(
    productionConfig.apiKey &&
    productionConfig.authDomain &&
    productionConfig.projectId &&
    productionConfig.apiKey !== 'mock-api-key-for-development' &&
    !productionConfig.apiKey.includes('demo')
  );

  if (hasProductionConfig) {
    return productionConfig;
  }

  // In development, use demo config to prevent errors
  if (import.meta.env.DEV) {
    console.warn('🔥 Using Firebase demo configuration for development');
    return developmentConfig;
  }

  // In production without config, use production config anyway (will show error)
  return productionConfig;
})();

// Validate configuration
const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

// Enable Firebase based on environment and configuration
export const isFirebaseEnabled: boolean = (() => {
  // Always enable in production (even if config is missing, to show proper error)
  if (import.meta.env.PROD) {
    return true;
  }

  // In development, enable if we have config or if explicitly enabled
  if (import.meta.env.DEV) {
    return hasRequiredConfig || import.meta.env.VITE_FIREBASE_ENABLE_DEV === 'true';
  }

  return hasRequiredConfig;
})();

// Debug logging
console.log('🔥 Firebase Debug Info:', {
  hasRequiredConfig,
  isFirebaseEnabled,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  enableDev: import.meta.env.VITE_FIREBASE_ENABLE_DEV,
  apiKey: firebaseConfig.apiKey ? '✅ Present' : '❌ Missing',
  projectId: firebaseConfig.projectId || '❌ Missing'
});

// Log configuration status
if (import.meta.env.DEV) {
  console.log('Firebase Configuration Status:', {
    hasRequiredConfig,
    isEnabled: isFirebaseEnabled,
    environment: import.meta.env.MODE,
    authDomain: firebaseConfig.authDomain
  });
}

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let analytics: Analytics | undefined;
let storage: FirebaseStorage | undefined;

if (isFirebaseEnabled) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    // Initialize Analytics only in production
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      analytics = getAnalytics(app);
    }
    
    // Connect to emulators in development - disabled to avoid connection issues in production
    if (import.meta.env.DEV && typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true') {
      try {
        // Connect to emulators
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8081);
      } catch (error) {
        console.log('Firebase emulators not available, using production');
      }
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Reset Firebase state on initialization failure
    app = undefined;
    db = undefined;
    auth = undefined;
    analytics = undefined;
    storage = undefined;
  }
}

export { app, db, auth, analytics, firebaseConfig, storage, GithubAuthProvider };
