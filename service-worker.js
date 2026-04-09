/* ============================================================
   FreshTrack — Service Worker (PWA Offline Support)
   service-worker.js
   ============================================================ */

const CACHE_NAME = 'freshtrack-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/pages.css',
  './css/animations.css',
  './js/constants.js',
  './js/state.js',
  './js/utils.js',
  './js/storage.js',
  './js/i18n.js',
  './js/notifications.js',
  './js/render.js',
  './js/actions.js',
  './js/app.js',
  './assets/icon.svg',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap',
];

// ── Install: cache all assets ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clear old caches ─────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first with network fallback ───────────────
self.addEventListener('fetch', event => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// ── Background Sync (optional future use) ─────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'freshtrack-sync') {
    console.log('[SW] Background sync triggered');
  }
});

// ── Push Notifications (optional future use) ──────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || '🌿 FreshTrack', {
      body:  data.body  || 'Check your expiring items!',
      icon:  './assets/icon-192.png',
      badge: './assets/icon-192.png',
      tag:   'freshtrack-push',
    })
  );
});
