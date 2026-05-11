import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ui/error-boundary'
import { registerServiceWorker } from './utils/sw-registration'
import { initFirebaseAnalytics } from './lib/firebase'

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

// Lazy-init Firebase Analytics after the page is interactive
// (production only — see initFirebaseAnalytics internals)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Small delay so analytics never blocks TTI
    setTimeout(() => { initFirebaseAnalytics(); }, 3000);
  }, { once: true });
}

// Enhanced error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Report to analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: `Unhandled Promise: ${event.reason}`,
      fatal: false
    });
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Report to analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: event.error?.message || 'Unknown error',
      fatal: false
    });
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
