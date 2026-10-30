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
const CACHE_NAME = `mogu-pet-cache-v${SW_TAG}`;
// 不缓存清单，检测版本用
const NO_CACHE_LIST = ['/version.json'];

self.addEventListener('install', (event) => {
  // 新sw安装完直接跳过等待，激活
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      return cache.addAll([
        './',
        './index.html',
        './pet.js',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  // 接管所有打开的客户端
  event.waitUntil(self.clients.claim());
  // 清理旧缓存
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // version.json 直接走网络，不读缓存！核心
  if (NO_CACHE_LIST.some(p => url.pathname.endsWith(p))) {
    event.respondWith(fetch(event.request));
    return;
  }
  // 普通资源：缓存优先，网络兜底
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request).then(netRes => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, netRes.clone()));
        return netRes;
      });
    })
  );
});


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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
    }).then(()=>{
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
