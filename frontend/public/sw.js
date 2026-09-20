/* Kwara L-PRES Progressive Web App (PWA) Service Worker */

const CACHE_NAME = 'lpres-pwa-cache-v1';
const API_CACHE_NAME = 'lpres-api-cache-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.png',
    '/lpres-logo.png',
    '/lpres-logo-alt.png'
];

// 1. Install Event: Pre-cache App Shell
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Kwara L-PRES Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching app shell assets');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// 2. Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME && cache !== API_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch Event: Cache Strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests for SW caching (POST/PUT/DELETE handled by Offline Sync Queue)
    if (request.method !== 'GET') {
        return;
    }

    // Strategy A: API Marketplace requests (Network First, fallback to API Cache)
    if (url.pathname.includes('/api/marketplace/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    console.log('[SW] Network offline. Serving cached API data for:', url.pathname);
                    return caches.match(request);
                })
        );
        return;
    }

    // Strategy B: App Shell & Static Assets (Stale-While-Revalidate / Cache First)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback for navigation requests when offline
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });

            return cachedResponse || fetchPromise;
        })
    );
});

// 4. Background Sync Event (When Connection is Restored)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background Sync event triggered:', event.tag);
    if (event.tag === 'lpres-offline-sync') {
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
                });
            })
        );
    }
});
