/**
 * Service Worker - Offline PWA Support for Antigravity Math Studio
 * Caches core app shell and mathematical engines for 100% offline functionality.
 */

const CACHE_NAME = 'math-studio-v2.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './calc-worker.js',
    './manifest.json',
    './engine/tokens.js',
    './engine/ast.js',
    './engine/parser.js',
    './engine/fractions.js',
    './engine/evaluator.js',
    './engine/explainer.js',
    './engine/units.js',
    './engine/solver.js',
    './engine/matrix.js',
    './engine/stats.js',
    './modules/ui.js',
    './modules/history.js',
    './modules/grapher.js',
    './modules/programmer.js',
    './modules/workspace.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('✅ Caching app shell & math engines for offline use');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Stale-while-revalidate strategy
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fetch fresh copy in background
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
