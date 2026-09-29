import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ui/error-boundary';
import { initFirebaseAnalytics } from './lib/firebase';
import { isServiceWorkerDisableRequested, purgeServiceWorker } from './utils/sw-registration';

// ── Service worker escape hatch ─────────────────────────────────────────────
// Runs before anything else mounts: `/?sw=off` must work even when the app is
// too broken to render, which is exactly the case it exists for.
if (typeof window !== 'undefined' && isServiceWorkerDisableRequested(window.location.href)) {
  void purgeServiceWorker().finally(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('sw');
    window.location.replace(url.toString());
  });
}

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
