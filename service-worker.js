// service-worker.js
const cacheName = 'speedometer-app-v1';
const assets = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/alarm.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(assets))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});
