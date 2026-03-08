const CACHE_NAME = 'mounir-portfolio-v2';
const STATIC_CACHE_NAME = 'mounir-portfolio-static-v2';
const DYNAMIC_CACHE_NAME = 'mounir-portfolio-dynamic-v2';
const PORTFOLIO_CACHE_NAME = 'mounir-portfolio-assets-v2';
const IMAGES_CACHE_NAME = 'mounir-portfolio-images-v2';

// Cache essential resources
const STATIC_FILES = [
  '/',
  '/index.html',
  '/mounir-icon.svg',
  '/favicon.ico',
  '/favicon.svg',
  '/site.webmanifest',
  '/offline.html',
];

// Portfolio-specific assets for aggressive caching
const PORTFOLIO_ASSETS = [
  // Component bundles
  /\/portfolio\//,
  /\/components\//,
  // Style files
  /\.css$/,
  /\.scss$/,
  // Font files
  /\.(woff|woff2|ttf|otf)$/,
  // Vector graphics
  /\.svg$/,
];

// Image patterns for optimized caching
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|webp|avif|gif)$/,
  /\/images\//,
  /\/assets\/.*\.(png|jpg|jpeg|webp|avif|gif)$/,
];

// Cache dynamic resources with these patterns
const CACHE_PATTERNS = [
  /\.(?:js|ts|jsx|tsx)$/,
  /\/assets\//,
  /\/src\//,
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /firebase/,
  /googleapis/,
  /analytics/,
  /gtag/,
];

// Cache configurations
const CACHE_CONFIG = {
  // Static assets: Cache for 1 year
  static: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100
  },
  // Portfolio assets: Cache for 30 days
  portfolio: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200
  },
  // Images: Cache for 7 days
  images: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 150
  },
  // Dynamic content: Cache for 1 day
  dynamic: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 100
  }
};

// Install event - cache static resources and portfolio assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME)
        .then(cache => {
          console.log('[SW] Caching static files');
          return cache.addAll(STATIC_FILES.map(url => new Request(url, {credentials: 'same-origin'})));
        }),
      // Pre-cache critical portfolio assets
      caches.open(PORTFOLIO_CACHE_NAME)
        .then(cache => {
          console.log('[SW] Pre-caching portfolio assets');
          // Pre-cache key portfolio components
          const portfolioAssets = [
            '/src/components/portfolio/HeroSection.tsx',
            '/src/components/portfolio/SkillVisualization.tsx',
            '/src/components/portfolio/ProjectShowcase.tsx',
            '/src/components/portfolio/ContactForm.tsx'
          ];
          return cache.addAll(portfolioAssets.map(url => new Request(url, {credentials: 'same-origin'})));
        })
    ])
      .then(() => {
        console.log('[SW] Static files and portfolio assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache files:', error);
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
                     cacheName !== PORTFOLIO_CACHE_NAME &&
                     cacheName !== IMAGES_CACHE_NAME &&
                     (cacheName.startsWith('mounir-portfolio-') || cacheName.startsWith('workbox-'));
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Initialize cache cleanup for size management
      cleanupExpiredCaches(),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service worker activated');
    })
  );
});

// Fetch event - implement portfolio-optimized caching strategies
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

  // Skip localhost requests when not in development
  if (url.hostname === 'localhost' && url.port === '8080') {
    return;
  }

  try {
    // Handle different types of requests with portfolio-specific strategies
    if (isNetworkFirst(request)) {
      event.respondWith(networkFirst(request));
    } else if (isPortfolioAsset(request)) {
      event.respondWith(portfolioAssetStrategy(request));
    } else if (isImageAsset(request)) {
      event.respondWith(imageAssetStrategy(request));
    } else if (isStaticAsset(request)) {
      event.respondWith(cacheFirst(request));
    } else {
      event.respondWith(staleWhileRevalidate(request));
    }
  } catch (error) {
    console.error('[SW] Fetch event error:', error);
    event.respondWith(new Response('Service unavailable', { status: 503 }));
  }
});

// Check if request should use network-first strategy
function isNetworkFirst(request) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url));
}

// Check if request is for portfolio asset
function isPortfolioAsset(request) {
  return PORTFOLIO_ASSETS.some(pattern => pattern.test(request.url));
}

// Check if request is for image asset
function isImageAsset(request) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Check if request is for static asset
function isStaticAsset(request) {
  return CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Portfolio asset caching strategy (cache-first with long TTL)
async function portfolioAssetStrategy(request) {
  const cache = await caches.open(PORTFOLIO_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Check if cached response is still valid
  if (cachedResponse) {
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const age = now.getTime() - cacheDate.getTime();
    
    if (age < CACHE_CONFIG.portfolio.maxAge) {
      console.log('[SW] Serving portfolio asset from cache:', request.url);
      return cachedResponse;
    }
  }
  
  try {
    console.log('[SW] Fetching portfolio asset from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response and add cache timestamp
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache with size management
      await cacheWithSizeLimit(cache, request, modifiedResponse, CACHE_CONFIG.portfolio.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version even if expired, or fallback
    if (cachedResponse) {
      console.log('[SW] Network failed, serving stale portfolio asset:', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

// Image asset caching strategy with WebP optimization
async function imageAssetStrategy(request) {
  const cache = await caches.open(IMAGES_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Check if cached response is still valid
  if (cachedResponse) {
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const age = now.getTime() - cacheDate.getTime();
    
    if (age < CACHE_CONFIG.images.maxAge) {
      return cachedResponse;
    }
  }
  
  try {
    // Try to fetch optimized version if supported
    const url = new URL(request.url);
    const supportsWebP = request.headers.get('accept')?.includes('image/webp');
    
    if (supportsWebP && !url.pathname.endsWith('.webp')) {
      // Try WebP version first
      const webpUrl = url.pathname.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const webpRequest = new Request(url.origin + webpUrl, {
        headers: request.headers,
        mode: request.mode,
        credentials: request.credentials
      });
      
      try {
        const webpResponse = await fetch(webpRequest);
        if (webpResponse.ok) {
          const headers = new Headers(webpResponse.headers);
          headers.set('sw-cache-date', new Date().toISOString());
          
          const modifiedResponse = new Response(webpResponse.body, {
            status: webpResponse.status,
            statusText: webpResponse.statusText,
            headers: headers
          });
          
          await cacheWithSizeLimit(cache, request, modifiedResponse, CACHE_CONFIG.images.maxEntries);
          return webpResponse;
        }
      } catch (webpError) {
        // Fall back to original format
        console.log('[SW] WebP version not available, using original format');
      }
    }
    
    // Fetch original image
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });
      
      await cacheWithSizeLimit(cache, request, modifiedResponse, CACHE_CONFIG.images.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version even if expired, or fallback
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return placeholder image
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f0f0f0"/><text x="200" y="150" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16" fill="#666">Image unavailable</text></svg>',
      { 
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        } 
      }
    );
  }
}

// Cache with size limit management
async function cacheWithSizeLimit(cache, request, response, maxEntries) {
  await cache.put(request, response);
  
  // Check cache size and cleanup if needed
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    console.log(`[SW] Cache size exceeded ${maxEntries}, cleaning up oldest entries`);
    
    // Get cache entries with timestamps
    const entries = await Promise.all(
      keys.map(async (key) => {
        const cachedResponse = await cache.match(key);
        const cacheDate = new Date(cachedResponse?.headers.get('sw-cache-date') || 0);
        return { key, date: cacheDate };
      })
    );
    
    // Sort by date and remove oldest entries
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const entriesToDelete = entries.slice(0, keys.length - maxEntries + 10); // Remove 10 extra for buffer
    
    await Promise.all(
      entriesToDelete.map(entry => cache.delete(entry.key))
    );
    
    console.log(`[SW] Removed ${entriesToDelete.length} old cache entries`);
  }
}

// Cleanup expired caches
async function cleanupExpiredCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('mounir-portfolio-')) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const cachedResponse = await cache.match(key);
        if (cachedResponse) {
          const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || cachedResponse.headers.get('date') || 0);
          const now = new Date();
          const age = now.getTime() - cacheDate.getTime();
          
          // Determine max age based on cache type
          let maxAge = CACHE_CONFIG.dynamic.maxAge;
          if (cacheName.includes('static')) maxAge = CACHE_CONFIG.static.maxAge;
          else if (cacheName.includes('portfolio')) maxAge = CACHE_CONFIG.portfolio.maxAge;
          else if (cacheName.includes('images')) maxAge = CACHE_CONFIG.images.maxAge;
          
          if (age > maxAge) {
            await cache.delete(key);
            console.log(`[SW] Removed expired cache entry: ${key.url}`);
          }
        }
      }
    }
  }
}

// Enhanced error handling
function handleFetchError(request, error) {
  console.error('[SW] Fetch error for:', request.url, error);
  
  if (request.destination === 'document') {
    return caches.match('/offline.html').then(response => {
      return response || new Response(
        '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 503 
        }
      );
    });
  }
  
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f0f0f0"/><text x="200" y="150" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16" fill="#666">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Service unavailable', { status: 503 });
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
  try {
    // Skip network requests for localhost development to avoid CORS issues
    if (request.url.includes('localhost:8080') || request.url.includes('127.0.0.1:8080')) {
      console.log('[SW] Skipping localhost request:', request.url);
      return new Response('Localhost request skipped', { status: 200 });
    }
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background with better error handling
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone()).catch(err => {
          console.warn('[SW] Failed to cache response:', err);
        });
      }
      return networkResponse;
    }).catch(error => {
      console.log('[SW] Network fetch failed for:', request.url, error.message);
      return null;
    });
    
    // Return cached response immediately if available, otherwise wait for network
    if (cachedResponse) {
      // Update cache in background
      fetchPromise.catch(() => {}); // Ignore errors for background updates
      return cachedResponse;
    } else {
      try {
        const networkResponse = await fetchPromise;
        
        if (networkResponse && networkResponse.ok) {
          return networkResponse;
        }
        
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          const offlineResponse = await caches.match('/offline.html');
          return offlineResponse || new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>', { 
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // For other requests, return a generic error response
        return new Response('Resource unavailable', { 
          status: 503,
          statusText: 'Service Unavailable'
        });
      } catch (fetchError) {
        console.warn('[SW] Fetch promise failed:', fetchError);
        
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>', { 
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        return new Response('Service unavailable', { status: 503 });
      }
    }
  } catch (error) {
    console.error('[SW] staleWhileRevalidate error:', error);
    
    // Fallback response
    if (request.destination === 'document') {
      return new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Service temporarily unavailable.</p></body></html>', { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Service unavailable', { status: 503 });
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
