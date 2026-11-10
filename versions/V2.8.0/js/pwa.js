import { AppConfig } from './config.js?v=20261110.7';

let swReg = null;
const hadControllerAtBoot = "serviceWorker" in navigator && !!navigator.serviceWorker.controller;

/** 正式启用 Service Worker：静态资源可离线，代码/版本走 network-first */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return Promise.resolve(null);
  if (location.protocol === "file:") return Promise.resolve(null);
  return navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" })
    .then(reg => {
      swReg = reg;
      listenUpdate(reg);
      return reg;
    })
    .catch(err => {
      console.warn("Service Worker 注册失败：", err);
      return null;
    });
}

function listenUpdate(reg) {
  reg.addEventListener("updatefound", () => {
    const newWorker = reg.installing;
    if (!newWorker) return;
    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        // 有新版本在等待：交给「更新」按钮或下次启动处理，避免打断游戏
        console.log("[pwa] 新版本已就绪");
      }
    });
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // 首次安装时 clients.claim() 也会触发一次，不在这里重载，避免莫名闪屏
    if (!hadControllerAtBoot) return;
    if (!window.__swReloading) {
      window.__swReloading = true;
      window.location.reload();
    }
  });
}

function featureNumber(feature) {
  const parts = String(feature).split(".").map(n => parseInt(n, 10) || 0);
  return parts[0] * 1000 + (parts[1] || 0);
}

/** build 形如 20261110.3，必须按数字逐段比较；直接比字符串会让 .10 被判定成小于 .9 */
export function buildNumber(build) {
  const parts = String(build || "").split(".").map(n => parseInt(n, 10) || 0);
  return parts[0] * 1000 + (parts[1] || 0);
}

export async function checkVersionRemote() {
  try {
    const res = await fetch("./version.json?t=" + Date.now(), { cache: "no-store" });
    const remote = await res.json();
    const local = AppConfig.APP_VERSION;
    if (featureNumber(remote.feature) > featureNumber(local.feature)) return true;
    if (featureNumber(remote.feature) === featureNumber(local.feature)) {
      return buildNumber(remote.build) > buildNumber(local.build);
    }
    return false;
  } catch (e) {
    return false;
  }
}

/** 更新：让等待中的 SW 接管；没有则清缓存后硬刷新 */
export async function hardReloadPage() {
  if (swReg && swReg.waiting) {
    swReg.waiting.postMessage({ type: "SKIP_WAITING" });
    return;
  }
  if ("caches" in window) {
    const names = await caches.keys();
    // 只清本项目缓存，别把同一域名下其他应用的缓存一起删掉
    await Promise.all(names.filter(n => n.indexOf("mushroom-pet-") === 0).map(n => caches.delete(n)));
  }
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) await reg.unregister();
  }
  window.__swReloading = true;
  location.reload();
}
