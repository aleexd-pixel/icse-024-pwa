var CACHE_NAME = 'icse-v1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
  var urlsToCache = [
    './',
    './index.html',
    './fonts/inter-300.woff2',
    './fonts/inter-400.woff2',
    './fonts/inter-500.woff2',
    './fonts/inter-600.woff2',
    './fonts/inter-700.woff2',
    './fonts/inter-800.woff2',
    './fonts/jetbrains-mono-400.woff2',
    './fonts/jetbrains-mono-500.woff2',
    './fonts/jetbrains-mono-700.woff2',
    './fonts/noto-sans-400.woff2',
    './fonts/noto-sans-700.woff2'
  ];
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(fetchResponse) {
        if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
          var responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});
