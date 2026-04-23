/**
 * Service Worker for Offline Caching and Performance
 * Optimized for GitHub Pages
 */

const CACHE_NAME = 'mounir-portfolio-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/site.webmanifest',
  '/mounir-icon.svg',
  '/favicon.ico',
  '/favicon.svg',
  '/profile.webp',
  '/robots.txt',
  '/sitemap.xml',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[Service Worker] Failed to cache some assets:', err);
        // Continue even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle Google Fonts
  if (url.origin === 'https://fonts.googleapis.com' || 
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          cache.put(request, response.clone());
          return response;
        }).catch(() => {
          return cache.match(request);
        });
      })
    );
    return;
  }

  // Handle Google Analytics and Clarity
  if (url.origin.includes('google-analytics') || 
      url.origin.includes('googletagmanager') ||
      url.origin.includes('clarity.ms')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return empty response for analytics if offline
        return new Response('', { status: 200 });
      })
    );
    return;
  }

  // Handle same-origin requests
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Fetch from network
        return fetch(request).then((networkResponse) => {
          // Don't cache non-successful responses
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Don't cache HTML pages with query parameters
          if (request.destination === 'document' && url.search) {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          // Cache the response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // If fetch fails, return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }

          // Return a generic offline response for other requests
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Handle third-party assets (images, scripts, etc.)
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Return cached version if available, otherwise return error
          return cache.match(request);
        });
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => caches.delete(key))
        );
      }).then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.navigate(client.url);
          });
        });
      })
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contact-form') {
    event.waitUntil(
      // Process queued form submissions
      Promise.resolve().then(() => {
        console.log('[Service Worker] Syncing contact form submissions');
        // Add your sync logic here
      })
    );
  }
});

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/mounir-icon.svg',
      badge: '/mounir-icon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options)
    );
  }
});
