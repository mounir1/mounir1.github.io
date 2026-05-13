import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ui/error-boundary';
import { initFirebaseAnalytics } from './lib/firebase';

// ── Lazy-init Firebase Analytics after the page is fully interactive ──────────
// Production only — see initFirebaseAnalytics() internals for guards
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => { initFirebaseAnalytics(); }, 3000);
  }, { once: true });
}

// ── Mount ─────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
