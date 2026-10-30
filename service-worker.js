// 【重要】每次发布新版本，手动修改此处版本字符串！SW无法读取pet.js的SW_TAG
const CACHE_NAME = "mushroom-pet-v2.4";

// 需要离线缓存全部静态资源
const assetsToCache = [
  "./",
  "./index.html",
  "./pet.js",
  "./normal.png",
  "./happy.png",
  "./hungry.png",
  "./sad.png",
  "./sleep.png",
  "./play.png",
  "./manifest.json"
];

// 不缓存的文件：version.json永远直接请求网络
const NO_CACHE_PATH = ["/version.json"];

self.addEventListener('install', (event) => {
  // 安装完成直接跳过等待
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 预缓存全部清单资源
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          // 删除所有不等于当前缓存名的旧缓存
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // 新SW立刻接管全部已打开页面
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // version.json：强制走网络，不读取缓存，用于版本检测
  if (NO_CACHE_PATH.some(p => url.pathname.endsWith(p))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 缓存优先策略：有缓存就返回缓存；网络请求成功后存入缓存
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      if (cachedRes) {
        return cachedRes;
      }
      // 无缓存，请求网络，并把响应存入缓存
      return fetch(event.request).then((netRes) => {
        const clone = netRes.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return netRes;
      });
    })
  );
});

// 接收主线程发送的SKIP_WAITING消息
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
