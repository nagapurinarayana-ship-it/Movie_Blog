// Simple service worker for basic offline caching
const CACHE_NAME = 'movie-hub-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/', '/index.html', '/style.css', '/script.js', '/offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache)=> cache.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      // add to cache
      if(!e.request.url.startsWith('http')) return res;
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
      return res;
    }).catch(()=> caches.match(OFFLINE_URL)))
  );
});
