// 缓存名带上 build：每次发版自动启用一份全新缓存，activate 清掉旧版本，
// 避免旧 index/app.js 与新模块混用导致“界面在但按钮全失效”。
const BUILD = "20261110.7";
const CACHE_NAME = "mushroom-pet-shell-" + BUILD;
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./js/config.js",
  "./js/store.js",
  "./js/util.js",
  "./js/render.js",
  "./js/pwa.js",
  "./js/main-pet.js",
  "./js/achievements.js",
  "./js/game-common.js",
  "./js/game-bubble.js",
  "./js/game-feed.js",
  "./js/game-whack.js",
  "./js/game-memory.js",
  "./js/game-snake.js",
  "./js/game-bubblecat.js",
  "./js/game-help.js",
  "./js/app.js",
  "./img/normal.webp",
  "./img/happy.webp",
  "./img/sleep.webp",
  "./img/sad.webp",
  "./img/hungry.webp",
  "./img/shy.webp",
  "./img/play.webp",
  "./img/bored.webp",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/icon-maskable-512.png"
];

self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      // 逐个预缓存：单个文件 404 不会让整轮安装全部失败
      .then(cache => Promise.all(PRECACHE.map(url =>
        cache.add(url).catch(() => console.warn("[sw] 预缓存跳过：", url))
      )))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn("[sw] 预缓存失败：", err);
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n.indexOf("mushroom-pet-") === 0 && n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

function isNetworkFirst(url) {
  const path = url.pathname;
  return url.origin === self.location.origin &&
    (path.endsWith("/") || path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".json"));
}

self.addEventListener("fetch", evt => {
  const req = evt.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isNetworkFirst(url)) {
    // 代码/页面始终优先取网络，断网时回退缓存
    evt.respondWith(
      fetch(req)
        .then(res => {
          // 只缓存成功响应，避免把 404/500 存下来导致离线打开是错误页
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then(hit => {
          if (hit) return hit;
          // 只有页面导航才回退首页；缺的 js/json 不要拿 HTML 冒充，否则报语法错误
          if (req.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        }))
    );
    return;
  }

  // 图片等静态资源：缓存优先，命中即返回
  evt.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});

self.addEventListener("message", evt => {
  if (evt.data && evt.data.type === "SKIP_WAITING") self.skipWaiting();
});
