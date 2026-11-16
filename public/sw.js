// DALAIL FAMILY ERP - Progressive Web App Service Worker
const CACHE_NAME = 'dalail-family-erp-v5-sig';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable.png',
  '/icons/app-icon.png',
  '/assets/official-logo.jpg',
  '/assets/office-signature.png',
  '/assets/official_receipt_template.jpg',
  '/assets/whatsapp_receipt_banner.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Fallback gracefully if any single asset fails
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through with network-first or cache-fallback
  if (event.request.method !== 'GET') return;

  // For HTML documents and dynamic API routes, always use Network First
  const isDoc = event.request.mode === 'navigate';
  if (isDoc) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
