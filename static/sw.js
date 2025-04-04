self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('leafscan-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/static/style.css',
                '/static/script.js',
                '/static/manifest.json',
                '/static/icons/icon-192x192.png',
                '/static/icons/icon-512x512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
