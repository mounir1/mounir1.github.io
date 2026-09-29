// ─────────────────────────────────────────────────────────────────────────────
// CACHE VERSIONING
//
// The version below is part of every cache name and MUST be bumped whenever
// the caching strategy changes. It is also the single most important number in
// this file.
//
// Why it matters: this is a content-hashed SPA. Every build emits NEW filenames
// (index-<hash>.js) and peaceiris replaces the old ones, so a cached index.html
// from an older build points at assets that no longer exist — the browser gets
// 404s for every chunk and the app cannot boot at all. Until the cache name
// changes, those old caches are never evicted, so *every* returning visitor
// stays broken across *every* deploy. Bumping this is the fix.
//
// v2: index.html / navigations are no longer precached or served from cache.
//      They are always fetched from the network, falling back to the cache only
//      when offline. That removes the stale-HTML failure mode at the source
//      rather than relying on a version bump alone.
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_VERSION = 'v2';
const CACHE_NAME = `mounir-portfolio-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `mounir-portfolio-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `mounir-portfolio-dynamic-${CACHE_VERSION}`;

// Cache essential resources.
// NOTE: index.html and '/' are deliberately NOT here. They are precaching the
// exact document that references content-hashed assets, which is what causes a
// cached HTML page to outlive its own chunks. Navigations go to the network.
const STATIC_FILES = [
  '/mounir-icon.svg',
  '/favicon.ico',
  '/favicon.svg',
  '/site.webmanifest',
  '/offline.html',
];

// Cache dynamic resources with these patterns
const CACHE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:js|css)$/,
  /\/assets\//,
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /firebase/,
  /googleapis/,
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, {credentials: 'same-origin'})));
      })
      .then(() => {
        console.log('[SW] Static files cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME &&
                     (cacheName.startsWith('mounir-portfolio-') || cacheName.startsWith('workbox-'));
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service worker activated');
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isNetworkFirst(request)) {
    event.respondWith(networkFirst(request));
  } else if (isNavigation(request)) {
    // HTML documents are NEVER served from cache while online. A cached
    // index.html references content-hashed assets that the next deploy deletes,
    // so serving it from cache is precisely what leaves returning visitors
    // staring at a blank page. Network first, cache only as an offline fallback.
    event.respondWith(navigationHandler(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Navigation requests (the HTML document itself)
function isNavigation(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

// Check if request should use network-first strategy
function isNetworkFirst(request) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url));
}

// Network-first for HTML, with the cache and offline.html as fallbacks.
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    if (offline) return offline;
    return new Response('Offline', { status: 503 });
  }
}

// Check if request is for static asset
function isStaticAsset(request) {
  return CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Network-first strategy (for API calls, Firebase, etc.)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      return offlineResponse || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache-first strategy (for static assets)
//
// Safe *only* because Vite gives every asset a content hash in its filename: a
// new build produces new URLs, so a cache hit can never be a stale copy of
// changed content. Anything without a content hash in its name must NOT use
// this strategy.
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch:', request.url, error);
    
    // Return a placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14" fill="#666">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy (for HTML pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.error('[SW] Network fetch failed:', request.url, error);
    return null;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  if (cachedResponse) {
    // Update cache in background
    fetchPromise.catch(() => {}); // Ignore errors for background updates
    return cachedResponse;
  } else {
    const networkResponse = await fetchPromise;
    
    if (networkResponse) {
      return networkResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      return offlineResponse || new Response('Offline', { status: 503 });
    }
    
    throw new Error('Network unavailable and no cache available');
  }
}

// Message handling for manual cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    updateCache();
  }
});

// Update cache manually
async function updateCache() {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.addAll(STATIC_FILES);
    console.log('[SW] Cache updated successfully');
  } catch (error) {
    console.error('[SW] Failed to update cache:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('[SW] Performing background sync');
  // Implement background sync logic here
  // For example, sync offline form submissions, analytics, etc.
}

// Push notifications (if needed in future)
self.addEventListener('push', event => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/mounir-icon.svg',
    badge: '/mounir-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/mounir-icon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/mounir-icon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Mounir Portfolio', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
