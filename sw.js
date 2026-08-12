const CACHE_NAME = 'movieblog-v2-phase1';
const BASE = new URL('./', self.registration.scope).pathname;
const OFFLINE_URL = `${BASE}offline.html`;
const ASSETS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}style.css`,
  `${BASE}script.js`,
  `${BASE}manifest.json`,
  OFFLINE_URL
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(OFFLINE_URL)))
  );
});
