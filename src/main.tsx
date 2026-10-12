import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ui/error-boundary';
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
// The import is dynamic on purpose: `./lib/firebase` statically pulls in
// firebase/app + firebase/firestore (~380 kB), and a static import here would
// put that whole chunk on the landing page's critical path to ship a single
// analytics beacon that fires 3 seconds after `load` anyway.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      void import('./lib/firebase').then(({ initFirebaseAnalytics }) => {
        initFirebaseAnalytics();
      });
    }, 3000);
  }, { once: true });
}

// ── Mount ─────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
