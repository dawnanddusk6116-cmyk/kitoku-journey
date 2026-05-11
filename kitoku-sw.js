const KITOKU_CACHE = 'kitoku-pwa-v1';
const KITOKU_CORE = [
  './index.html',
  './kitoku-manifest.json',
  './kitoku-icon-180.png',
  './kitoku-icon-192.png',
  './kitoku-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(KITOKU_CACHE).then(cache => cache.addAll(KITOKU_CORE)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== KITOKU_CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(KITOKU_CACHE).then(cache => cache.put(event.request, copy)).catch(() => null);
      return response;
    }).catch(() => caches.match(event.request))
  );
});
