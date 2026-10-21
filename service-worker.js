const CACHE_NAME = "mushroom-pet-v1.1";
const assetsToCache = [
  "./",
  "./index.html",
  "./normal.png",
  "./happy.png",
  "./hungry.png",
  "./sad.png",
  "./sleep.png",
  "./play.png",
  "./manifest.json"
];

// 安装，预缓存资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// 激活，清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：优先缓存，离线可用
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
