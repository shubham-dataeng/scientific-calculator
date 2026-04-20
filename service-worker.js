// Service Worker - enables offline mode for the calculator app
// Caches essential resources and serves them when the internet is down

// Cache name - increment version when you want to update cached files
const CACHE_NAME = 'scientific-calculator-v1';

// Resources to cache on first install
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.0/math.min.js'
];

// Install event - cache files on first visit
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete caches that are not the current version
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline, try network when online
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have it in cache, use it immediately
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try to fetch from network
        return fetch(event.request).then(networkResponse => {
          // Don't cache if not a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Clone response so we can use it and cache it
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              // Update cache with fresh response
              cache.put(event.request, responseToCache);
            });
          
          return networkResponse;
        });
      })
      .catch(() => {
        // Return a fallback page if offline
        return new Response('Offline - Calculator data is cached and available');
      })
  );
});
