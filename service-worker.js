const CACHE_NAME = 'pet-cache-v1';
const urlsToCache = [
  './index.html',
  './manifest.json'
];

// 安装，缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 请求拦截，优先读缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
