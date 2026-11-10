import { AppStore } from './store.js?v=20261110.7';
import { AppConfig, fullVersionLabel } from './config.js?v=20261110.7';
import { registerServiceWorker, checkVersionRemote, hardReloadPage } from './pwa.js?v=20261110.7';
import { renderMain, renderBackpack, currentBackpackTab, renderGameHub, showTalk, renderSignPanel } from './render.js?v=20261110.7';
import { petTick, touchPet, restPet, claimAllBox, doSign, renamePet, exportSave, importSave, settleOffline } from './main-pet.js?v=20261110.7';
import { toggleSound, syncSoundLabel, toast, computeRadialCenter } from './util.js?v=20261110.7';
import { bindGameHelpButtons } from './game-help.js?v=20261110.7';

let petAnimLock = false;
let petAnimTimer = null;
let idleTimer = null;
let idleActionTimer = null;
let idleOn = false;
let longPressTimer = null;
let suppressClickUntil = 0;
const LONG_PRESS_DELAY = 500;
const PET_ACTION_CLASSES = ["bounce-anim", "shy-anim", "chew-anim", "wake-anim", "levelup-anim",
  "nod-anim", "squish-anim", "hop-anim", "sleep-anim", "eat-chew", "idle-sway", "idle-look", "idle-hop"];

function getPetImg() {
  return document.getElementById("petImg");
}

function clearPetActionClasses(img) {
  if (!img) return;
  PET_ACTION_CLASSES.forEach(c => img.classList.remove(c));
}

/** 暂停待机呼吸，交给抚摸/进食等一次性动作 */
function stopIdle() {
  idleOn = false;
  clearTimeout(idleTimer);
  clearTimeout(idleActionTimer);
  idleTimer = null;
  idleActionTimer = null;
  const img = getPetImg();
  if (img) {
    img.classList.remove("idle-breath", "idle-sway", "idle-look", "idle-hop");
  }
}

function scheduleIdleAction() {
  clearTimeout(idleTimer);
  if (!idleOn) return;
  const data = AppStore.data || {};
  let delay = 9000 + Math.random() * 7000;
  if ((data.mood || 0) < 25) delay += 4000;
  if ((data.hunger || 0) <= 20) delay += 3000;
  idleTimer = setTimeout(() => {
    if (!idleOn || petAnimLock || document.hidden) {
      scheduleIdleAction();
      return;
    }
    const img = getPetImg();
    if (!img) return;
    const box = document.getElementById("petImgContainer");
    if (box && box.classList.contains("sleeping")) {
      scheduleIdleAction();
      return;
    }
    const moods = ["idle-sway", "idle-look", "idle-hop"];
    const cls = moods[Math.floor(Math.random() * moods.length)];
    const dur = cls === "idle-hop" ? 950 : (cls === "idle-look" ? 1050 : 1150);
    img.classList.remove("idle-breath");
    img.classList.add(cls);
    idleActionTimer = setTimeout(() => {
      img.classList.remove(cls);
      if (idleOn) {
        img.classList.add("idle-breath");
        scheduleIdleAction();
      }
    }, dur);
  }, delay);
}

/** 启动待机呼吸与随机小动作 */
function startIdle() {
  if (petAnimLock || document.hidden) return;
  const img = getPetImg();
  if (!img) return;
  if (idleOn) return;
  idleOn = true;
  img.classList.add("idle-breath");
  scheduleIdleAction();
}

/** 一次性抚摸/升级动作：结束后自动回到待机 */
function playPetAnimation(animClass, duration) {
  if (petAnimLock) return;
  const petImg = getPetImg();
  if (!petImg) return;
  stopIdle();
  petAnimLock = true;
  clearTimeout(petAnimTimer);
  clearPetActionClasses(petImg);
  petImg.classList.remove("idle-breath");
  petImg.classList.add(animClass);
  petAnimTimer = setTimeout(() => {
    petImg.classList.remove(animClass);
    petAnimLock = false;
    startIdle();
  }, duration);
}

/** 吃东西：食物飞到嘴边 → 咀嚼 → 掉碎屑/爱心 → 回待机 */
function playEatAnimation(icon = "🍎") {
  const petImg = getPetImg();
  if (!petImg) return;
  stopIdle();
  clearTimeout(petAnimTimer);
  petAnimLock = true;
  clearPetActionClasses(petImg);
  petImg.classList.remove("idle-breath");
  petImg.classList.add("eat-chew");

  const rect = petImg.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    petAnimTimer = setTimeout(() => {
      petAnimLock = false;
      startIdle();
    }, 900);
    return;
  }
  const mouthX = rect.left + rect.width / 2;
  const mouthY = rect.top + rect.height * 0.55;
  const drop = rect.height * 0.55 + 40;
  const fly = document.createElement("div");
  fly.className = "pet-food-fly";
  fly.textContent = icon;
  fly.style.left = mouthX + "px";
  fly.style.top = mouthY + "px";
  fly.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(fly);
  if (fly.animate) {
    fly.animate([
      { transform: `translate(-50%, -50%) translateY(-${drop}px) scale(0.7) rotate(-8deg)`, opacity: 0.4 },
      { transform: `translate(-50%, -50%) translateY(-${Math.round(drop * 0.32)}px) scale(1) rotate(6deg)`, opacity: 1, offset: 0.5 },
      { transform: "translate(-50%, -50%) translateY(0) scale(0.35)", opacity: 0, offset: 1 }
    ], { duration: 680, easing: "cubic-bezier(.32,0,.67,1)", fill: "forwards" });
  }
  setTimeout(() => {
    fly.remove();
    spawnEatingEffects(mouthX, mouthY);
  }, 680);

  petAnimTimer = setTimeout(() => {
    petImg.classList.remove("eat-chew");
    petAnimLock = false;
    renderMain();
    startIdle();
  }, 1750);
}

function spawnEatingEffects(x, y) {
  for (let i = 0; i < 6; i++) {
    const crumb = document.createElement("div");
    crumb.className = "pet-crumb";
    crumb.style.left = x + (Math.random() * 22 - 11) + "px";
    crumb.style.top = y + (Math.random() * 10 - 5) + "px";
    crumb.style.setProperty("--dx", (Math.random() * 60 - 30) + "px");
    crumb.style.setProperty("--dy", (18 + Math.random() * 34) + "px");
    crumb.style.setProperty("--rot", (Math.random() * 220 - 110) + "deg");
    document.body.appendChild(crumb);
    setTimeout(() => crumb.remove(), 720);
  }
  ["💗", "✨", "💕"].forEach((icon, i) => {
    const heart = document.createElement("div");
    heart.className = "pet-heart";
    heart.textContent = icon;
    heart.style.left = (x + (i - 1) * 26 + Math.random() * 10) + "px";
    heart.style.top = (y - 26) + "px";
    heart.style.setProperty("--dx", ((i - 1) * 18) + "px");
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  });
}

const GAME_OPENERS = {
  feed: () => import("./game-feed.js?v=20261110.7").then(m => m.openFeedGame()),
  bubble: () => import("./game-bubble.js?v=20261110.7").then(m => m.openBubbleGame()),
  whack: () => import("./game-whack.js?v=20261110.7").then(m => m.openWhackGame()),
  memory: () => import("./game-memory.js?v=20261110.7").then(m => m.openMemoryGame()),
  snake: () => import("./game-snake.js?v=20261110.7").then(m => m.openSnakeGame()),
  bubblecat: () => import("./game-bubblecat.js?v=20261110.7").then(m => m.openBubbleCatGame())
};

const GAME_MODALS = {
  feed: "feedGameModal",
  bubble: "gameModal",
  whack: "whackModal",
  memory: "memoryModal",
  snake: "snakeModal",
  bubblecat: "bubbleCatModal"
};

function getTouchZone(e) {
  const petImg = document.getElementById("petImg");
  if (!petImg) return "body";
  const rect = petImg.getBoundingClientRect();
  if (!rect.width || !rect.height) return "body";
  const y = (e.clientY - rect.top) / rect.height;
  if (y < 0.38) return "head";
  if (y > 0.78) return "feet";
  return "body";
}

function showComboTip(combo) {
  if (combo < 3) return;
  const el = document.getElementById("comboTip");
  if (!el) return;
  el.innerText = combo >= 15 ? `🔥 连击 ×${combo}` : `连击 ×${combo}`;
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

/**
 * v2.8 环形菜单定位：以团子中心为圆心，并把圆心钳制到视口内。
 * 菜单盒是 0 尺寸锚点，left/top 直接就是圆心坐标；
 * 展开半径由 renderDynamicRadialMenu 写入 _radius / _half。
 */
function positionRadialMenu(menuEl) {
  const petImg = document.getElementById("petImg");
  if (!petImg) return;
  const rect = petImg.getBoundingClientRect();
  const radius = menuEl._radius || 150;
  const half = menuEl._half || 40;
  const pos = computeRadialCenter(rect, radius, half, window.innerWidth, window.innerHeight, 8);
  menuEl.style.left = `${pos.x}px`;
  menuEl.style.top = `${pos.y}px`;
}

function closeAllRadialMenus() {
  ["petRadialMenu", "dynamicRadialMenu"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("open");
      el.style.display = "none";
    }
  });
}

function closeAllPopups() {
  closeAllRadialMenus();
}

function renderDynamicRadialMenu(menuEl, items, radius = 150, startAngle = -90, clockwise = false, totalSpread = null) {
  menuEl.innerHTML = "";
  const count = items.length;
  if (count === 0) return;

  let btnSize, iconFontSize;
  if (count <= 3) { btnSize = 74; iconFontSize = 31; }
  else if (count <= 5) { btnSize = 64; iconFontSize = 26; }
  else { btnSize = 54; iconFontSize = 21; }
  const half = btnSize / 2;
  menuEl._radius = radius;
  menuEl._half = half;

  if (totalSpread === null) {
    if (count === 1) totalSpread = 0;
    else if (count === 2) totalSpread = 80;
    else if (count === 3) totalSpread = 100;
    else if (count === 4) totalSpread = 170;
    else if (count === 5) totalSpread = 220;
    else totalSpread = 250;
  }
  const stepAngle = count > 1 ? totalSpread / (count - 1) : 0;

  items.forEach((item, idx) => {
    const angleDeg = startAngle + (clockwise ? 1 : -1) * stepAngle * idx;
    const angleRad = angleDeg * Math.PI / 180;
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);

    const wrap = document.createElement("div");
    wrap.className = "radial-item-wrap";
    wrap.style.width = btnSize + "px";
    wrap.style.height = btnSize + "px";
    wrap.style.marginLeft = -half + "px";
    wrap.style.marginTop = -half + "px";
    wrap.style.transform = `translate(${x}px, ${y}px)`;

    const btn = document.createElement("button");
    btn.className = "radial-item";
    btn.dataset.action = item.id;
    if (item.disabled) btn.disabled = true;
    btn.innerHTML = item.icon;
    btn.style.width = btnSize + "px";
    btn.style.height = btnSize + "px";
    btn.style.fontSize = iconFontSize + "px";

    const label = document.createElement("span");
    label.className = "radial-item-label";
    label.textContent = item.label || "";

    wrap.appendChild(btn);
    wrap.appendChild(label);

    if (typeof item.count === "number" && item.count > 0) {
      const badge = document.createElement("span");
      badge.className = "radial-item-badge";
      badge.textContent = item.count;
      wrap.appendChild(badge);
    }
    btn.style.transform = "scale(0.2)";
    menuEl.appendChild(wrap);
  });

  menuEl.style.display = "block";
  menuEl.classList.remove("open");
  requestAnimationFrame(() => {
    positionRadialMenu(menuEl);
    setTimeout(() => {
      menuEl.querySelectorAll(".radial-item").forEach(b => { b.style.transform = "scale(1)"; });
      menuEl.classList.add("open");
    }, 30);
  });
}

function openRadialMenu() {
  closeAllRadialMenus();
  const radialMenuEl = document.getElementById("petRadialMenu");
  if (!radialMenuEl) return;
  const data = AppStore.data;
  let foodTotal = 0;
  let toyTotal = 0;
  AppConfig.ITEM_CONFIG.forEach(item => {
    if (item.type === "food") foodTotal += data.bag[item.id] || 0;
    if (item.type === "toy") toyTotal += data.bag[item.id] || 0;
  });
  const mainMenuItems = [
    { id: "feed", icon: "🍞", label: "喂食", disabled: foodTotal <= 0 },
    { id: "rest", icon: "💤", label: "休息", disabled: false },
    { id: "play", icon: "🧸", label: "玩耍", disabled: toyTotal <= 0 }
  ];
  renderDynamicRadialMenu(radialMenuEl, mainMenuItems, 150, 180, false, 180);
}

function openBackpackTab(tabKey) {
  const backpackModal = document.getElementById("backpackModal");
  if (!backpackModal) return;
  backpackModal.style.display = "flex";
  renderBackpack(tabKey);
}

function openGameHub() {
  const modal = document.getElementById("gameHubModal");
  if (!modal) return;
  renderGameHub();
  modal.style.display = "flex";
}

async function debugClearAllCache() {
  const ok = confirm("⚠️ 会清除本应用的本地存档、进度与 PWA 缓存，确认继续？");
  if (!ok) return;
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) await reg.unregister();
  }
  if ("caches" in window) {
    const names = await caches.keys();
    for (const name of names) {
      if (name.indexOf("mushroom-pet-") === 0) await caches.delete(name);
    }
  }
  // 只删本应用的键，别把同域名下别的页面的数据一起清掉
  ["mushroomPetData", "mushroomPetData_corrupt", "mushroomPetSound", "guideDone"].forEach(k => {
    try { localStorage.removeItem(k); } catch (e) { /* 忽略 */ }
  });
  toast("✅ 缓存与本地数据已清除，即将重载", 2400);
  setTimeout(() => location.reload(), 800);
}

window.playPetAnimation = playPetAnimation;
window.playEatAnimation = playEatAnimation;

async function bootstrap() {
  const dom = {
    petImg: document.getElementById("petImg"),
    petImgContainer: document.getElementById("petImgContainer"),
    petRadialMenu: document.getElementById("petRadialMenu"),
    dynamicRadialMenu: document.getElementById("dynamicRadialMenu"),
    btnMore: document.getElementById("btnMore"),
    btnCloseMore: document.getElementById("btnCloseMore"),
    btnBackpack: document.getElementById("btnBackpack"),
    btnRename: document.getElementById("btnRename"),
    btnSign: document.getElementById("btnSign"),
    signModal: document.getElementById("signModal"),
    btnDoSign: document.getElementById("btnDoSign"),
    btnCloseSign: document.getElementById("btnCloseSign"),
    btnClaimBox: document.getElementById("btnClaimBox"),
    btnCheckUpdate: document.getElementById("btnCheckUpdate"),
    btnSound: document.getElementById("btnSound"),
    btnSaveMgr: document.getElementById("btnSaveMgr"),
    btnGameHub: document.getElementById("btnGameHub"),
    gameHubModal: document.getElementById("gameHubModal"),
    btnCloseGameHub: document.getElementById("btnCloseGameHub"),
    btnCloseFeedGame: document.getElementById("feedCloseBtn"),
    btnStartFeed: document.getElementById("feedStartBtn"),
    btnCloseBubble: document.getElementById("btnCloseGame"),
    btnStartBubble: document.getElementById("btnStartGame"),
    btnCloseWhack: document.getElementById("whackCloseBtn"),
    btnStartWhack: document.getElementById("whackStartBtn"),
    btnCloseMemory: document.getElementById("memoryCloseBtn"),
    btnStartMemory: document.getElementById("memoryStartBtn"),
    btnCloseSnake: document.getElementById("snakeCloseBtn"),
    btnStartSnake: document.getElementById("snakeStartBtn"),
    btnCloseBubbleCat: document.getElementById("bcCloseBtn"),
    btnStartBubbleCat: document.getElementById("bcStartBtn"),
    saveModal: document.getElementById("saveModal"),
    btnExportSave: document.getElementById("btnExportSave"),
    fileInput: document.getElementById("fileInput"),
    btnCloseSave: document.getElementById("btnCloseSave"),
    btnCloseBackpack: document.getElementById("btnCloseBackpack"),
    backpackModal: document.getElementById("backpackModal"),
    backpackList: document.getElementById("backpackList"),
    guideModal: document.getElementById("guideModal"),
    btnCloseGuide: document.getElementById("btnCloseGuide"),
    noMoreGuide: document.getElementById("noMoreGuide"),
    btnDebug: document.getElementById("btnDebug"),
    btnQuickFeed: document.getElementById("btnQuickFeed"),
    btnBag: document.getElementById("btnBag"),
    buildShow: document.getElementById("buildShow")
  };

  /** 直接弹出食物选择环（主按钮「喂食」与长按菜单共用） */
  const showFoodMenu = () => {
    closeAllRadialMenus();
    const data = AppStore.data;
    const foodItems = AppConfig.ITEM_CONFIG
      .filter(i => i.type === "food")
      .map(i => ({ id: i.id, icon: i.icon || "🍞", count: data.bag[i.id] || 0, disabled: (data.bag[i.id] || 0) <= 0 }));
    foodItems.push({ id: "back", icon: "⬅️", count: 0, disabled: false });
    renderDynamicRadialMenu(dom.dynamicRadialMenu, foodItems, 150, -135, false, null);
  };

  AppStore.data = AppStore.load();
  settleOffline();
  registerServiceWorker();
  renderMain();
  syncSoundLabel();
  if (dom.buildShow) dom.buildShow.innerText = fullVersionLabel();
  let guideDone = false;
  try {
    guideDone = localStorage.getItem("guideDone") === "1";
  } catch (e) {
    // 存储不可用时每次启动都显示引导，但仍然把按钮绑定好
  }
  if (!guideDone && dom.guideModal) {
    dom.guideModal.style.display = "flex";
  }
  setInterval(petTick, 2000);

  // 图片加载失败：不再回退 7MB 的 PNG 原图，直接显示 emoji 兜底（CSS .pet-fallback）

  // 背包
  if (dom.backpackList) {
    dom.backpackList.addEventListener("click", (e) => {
      const card = e.target.closest(".item-card");
      if (!card || card.classList.contains("disabled")) return;
      const itemId = card.dataset.id;
      if (!itemId) return;
      const activeTab = currentBackpackTab || "all";
      import("./main-pet.js?v=20261110.7").then(m => {
        m.useItem(itemId);
        renderBackpack(activeTab);
      });
    });
  }
  if (dom.btnBackpack) {
    dom.btnBackpack.addEventListener("click", () => {
      if (dom.backpackModal) dom.backpackModal.style.display = "flex";
      renderBackpack(currentBackpackTab);
    });
  }
  if (dom.btnCloseBackpack) {
    dom.btnCloseBackpack.addEventListener("click", () => {
      if (dom.backpackModal) dom.backpackModal.style.display = "none";
    });
  }

  // ============ 长按 ============
  const pressTarget = dom.petImgContainer;
  if (pressTarget) {
    const startLongPress = () => {
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        suppressClickUntil = Date.now() + 800;
        openRadialMenu();
      }, LONG_PRESS_DELAY);
    };
    const cancelLongPress = () => clearTimeout(longPressTimer);

    pressTarget.addEventListener("mousedown", startLongPress);
    pressTarget.addEventListener("touchstart", startLongPress, { passive: true });
    pressTarget.addEventListener("mouseup", cancelLongPress);
    pressTarget.addEventListener("mouseleave", cancelLongPress);
    pressTarget.addEventListener("touchend", cancelLongPress);
    pressTarget.addEventListener("touchcancel", cancelLongPress);
    pressTarget.addEventListener("touchmove", cancelLongPress, { passive: true });
    pressTarget.addEventListener("contextmenu", e => e.preventDefault());

    pressTarget.addEventListener("click", (e) => {
      // 长按打开菜单后，松手产生的 click 不再当作抚摸
      if (Date.now() < suppressClickUntil) return;
      const isOpen = dom.petRadialMenu.classList.contains("open") ||
        dom.dynamicRadialMenu.classList.contains("open");
      if (isOpen) {
        closeAllPopups();
        return;
      }
      const zone = getTouchZone(e);
      const res = touchPet(zone);
      if (!res || res.skipped) return;
      if (res.combo >= 3) showComboTip(res.combo);
      if (zone === "head") playPetAnimation("nod-anim", 450);
      else if (zone === "feet") playPetAnimation("hop-anim", 500);
      else playPetAnimation("squish-anim", 450);
      if (res.dropped) {
        const item = AppConfig.ITEM_CONFIG.find(i => i.id === res.dropped.id);
        setTimeout(() => showTalk(`✨掉落了${item.icon}${item.name}×${res.dropped.count}`), 900);
      }
      if (navigator.vibrate && res.combo >= 5) navigator.vibrate(12);
    });

    // 一级菜单
    dom.petRadialMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.target.closest(".radial-item");
      if (!btn) return;
      const act = btn.dataset.action;
      const data = AppStore.data;
      if (act === "feed") {
        showFoodMenu();
        return;
      }
      if (act === "play") {
        closeAllRadialMenus();
        const toyItems = AppConfig.ITEM_CONFIG
          .filter(i => i.type === "toy")
          .map(i => ({ id: i.id, icon: i.icon || "🧸", count: data.bag[i.id] || 0, disabled: (data.bag[i.id] || 0) <= 0 }));
        toyItems.push({ id: "back", icon: "⬅️", count: 0, disabled: false });
        renderDynamicRadialMenu(dom.dynamicRadialMenu, toyItems, 150, -135, false, null);
        return;
      }
      if (act === "rest") {
        closeAllPopups();
        restPet();
      }
    });

    // 二级菜单
    dom.dynamicRadialMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.target.closest(".radial-item");
      if (!btn) return;
      const itemId = btn.dataset.action;
      if (itemId === "back") {
        closeAllRadialMenus();
        openRadialMenu();
        return;
      }
      if (btn.disabled) return;
      import("./main-pet.js?v=20261110.7").then(m => m.useItem(itemId));
      closeAllRadialMenus();
    });
  }

  // 旋转屏幕/窗口尺寸变化时，环形菜单要重新对圆心
  window.addEventListener("resize", () => {
    ["petRadialMenu", "dynamicRadialMenu"].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.classList.contains("open")) positionRadialMenu(el);
    });
  });

  // 空白处关闭菜单
  document.addEventListener("click", (e) => {    const clickOnMenu = e.target.closest("#petRadialMenu") || e.target.closest("#dynamicRadialMenu");
    const clickOnPet = e.target.closest("#petImgContainer");
    if (clickOnMenu || clickOnPet) return;
    const isAnyOpen = dom.petRadialMenu.classList.contains("open") ||
      dom.dynamicRadialMenu.classList.contains("open");
    if (isAnyOpen) closeAllPopups();
  });

  // ============ 按钮 ============
  if (dom.btnRename) dom.btnRename.addEventListener("click", renamePet);
  if (dom.btnSound) dom.btnSound.addEventListener("click", () => {
    const on = toggleSound();
    syncSoundLabel();
    toast(on ? "🔊 音效已开启" : "🔇 音效已关闭", 1600);
  });
  if (dom.btnClaimBox) dom.btnClaimBox.addEventListener("click", claimAllBox);
  // 签到：先打开 7 天连签面板，再由面板里的按钮真正签到
  if (dom.btnSign) {
    dom.btnSign.addEventListener("click", () => {
      const more = document.getElementById("moreModal");
      if (more) more.style.display = "none";
      if (dom.signModal) dom.signModal.style.display = "flex";
      renderSignPanel();
    });
  }
  if (dom.btnDoSign) dom.btnDoSign.addEventListener("click", () => { doSign(); renderSignPanel(); });
  if (dom.btnCloseSign) {
    dom.btnCloseSign.addEventListener("click", () => {
      if (dom.signModal) dom.signModal.style.display = "none";
    });
  }

  // 主按钮「喂食」：没有食物时直接引导去背包食物页
  if (dom.btnQuickFeed) {
    dom.btnQuickFeed.addEventListener("click", () => {
      const data = AppStore.data;
      const foodTotal = AppConfig.ITEM_CONFIG
        .filter(i => i.type === "food")
        .reduce((s, i) => s + (data.bag[i.id] || 0), 0);
      if (foodTotal <= 0) {
        toast("背包里没有食物啦，去玩小游戏赢一点吧", 2200);
        openBackpackTab("food");
        return;
      }
      showFoodMenu();
    });
  }
  // 主按钮「背包」：打开上次停留的标签页
  if (dom.btnBag) dom.btnBag.addEventListener("click", () => openBackpackTab(currentBackpackTab));

  if (dom.btnCheckUpdate) {
    dom.btnCheckUpdate.addEventListener("click", async () => {
      const hasNew = await checkVersionRemote();
      if (hasNew) {
        const ok = confirm("检测到新版本，现在更新？");
        if (ok) hardReloadPage();
      } else {
        toast("当前已经是最新版本", 2000);
      }
    });
  }

  if (dom.btnSaveMgr) {
    dom.btnSaveMgr.addEventListener("click", () => {
      if (dom.saveModal) dom.saveModal.style.display = "flex";
    });
  }
  if (dom.btnCloseSave) {
    dom.btnCloseSave.addEventListener("click", () => {
      if (dom.saveModal) dom.saveModal.style.display = "none";
    });
  }
  if (dom.btnExportSave) dom.btnExportSave.addEventListener("click", exportSave);
  if (dom.fileInput) {
    dom.fileInput.onchange = e => {
      const f = e.target.files[0];
      // 清空 value：否则选同一个文件第二次不会触发 change
      e.target.value = "";
      if (f) importSave(f);
    };
  }
  if (dom.btnCloseGuide) {
    dom.btnCloseGuide.addEventListener("click", () => {
      if (dom.guideModal) dom.guideModal.style.display = "none";
      if (dom.noMoreGuide?.checked) {
        try { localStorage.setItem("guideDone", "1"); } catch (e) { /* 存储不可用忽略 */ }
      }
    });
  }
  // 点引导遮罩也能关闭，避免首次启动时误以为按钮全都失效
  if (dom.guideModal) {
    dom.guideModal.addEventListener("click", (e) => {
      if (e.target === dom.guideModal) dom.guideModal.style.display = "none";
    });
  }
  if (dom.btnDebug) dom.btnDebug.addEventListener("click", debugClearAllCache);

  // 更多
  if (dom.btnMore) {
    dom.btnMore.addEventListener("click", () => {
      const modal = document.getElementById("moreModal");
      if (modal) modal.style.display = "flex";
      if (dom.buildShow) dom.buildShow.innerText = fullVersionLabel();
    });
  }
  if (dom.btnCloseMore) {
    dom.btnCloseMore.addEventListener("click", () => {
      const modal = document.getElementById("moreModal");
      if (modal) modal.style.display = "none";
    });
  }

  // 小游戏中心
  if (dom.btnGameHub) dom.btnGameHub.addEventListener("click", openGameHub);
  if (dom.btnCloseGameHub) {
    dom.btnCloseGameHub.addEventListener("click", () => {
      if (dom.gameHubModal) dom.gameHubModal.style.display = "none";
    });
  }
  /** 小游戏进行中标记：让团子切到「陪玩」状态，关闭后复原 */
  const setPlaying = (on) => {
    const data = AppStore.data;
    if (data.isPlaying === on) return;
    data.isPlaying = on;
    AppStore.save(data);
    renderMain();
  };

  window.addEventListener("open-game", (e) => {
    const id = e.detail.id;
    if (dom.gameHubModal) dom.gameHubModal.style.display = "none";
    setPlaying(true);
    const opener = GAME_OPENERS[id];
    if (opener) opener();
  });

  const startMap = {
    btnStartFeed: ["game-feed", "startFeedGame"],
    btnStartBubble: ["game-bubble", "startBubbleGame"],
    btnStartWhack: ["game-whack", "startWhackGame"],
    btnStartMemory: ["game-memory", "startMemoryGame"],
    btnStartSnake: ["game-snake", "startSnakeGame"],
    btnStartBubbleCat: ["game-bubblecat", "startBubbleCatGame"]
  };
  Object.entries(startMap).forEach(([btnKey, [mod, fn]]) => {
    const btn = dom[btnKey];
    if (!btn) return;
    btn.addEventListener("click", () => import(`./${mod}.js?v=20261110.7`).then(m => m[fn] && m[fn]()));
  });

  const closeMap = {
    btnCloseFeedGame: ["feedGameModal", "game-feed", "closeFeedGame"],
    btnCloseBubble: ["gameModal", "game-bubble", "closeBubbleGame"],
    btnCloseWhack: ["whackModal", "game-whack", "closeWhackGame"],
    btnCloseMemory: ["memoryModal", "game-memory", "closeMemoryGame"],
    btnCloseSnake: ["snakeModal", "game-snake", "closeSnakeGame"],
    btnCloseBubbleCat: ["bubbleCatModal", "game-bubblecat", "closeBubbleCatGame"]
  };
  Object.entries(closeMap).forEach(([btnKey, [modalId, mod, fn]]) => {
    const btn = dom[btnKey];
    if (!btn) return;
    btn.addEventListener("click", () => {
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = "none";
      setPlaying(false);
      import(`./${mod}.js?v=20261110.7`).then(m => m[fn] && m[fn]());
    });
  });

  // 弹窗遮罩关闭后也停止游戏
  window.addEventListener("modal-closed", (e) => {
    const map = { feedGameModal: "feed", gameModal: "bubble", whackModal: "whack", memoryModal: "memory", snakeModal: "snake", bubbleCatModal: "bubblecat" };
    const game = map[e.detail.id];
    if (!game) return;
    setPlaying(false);
    const closeFns = {
      feed: ["game-feed", "closeFeedGame"],
      bubble: ["game-bubble", "closeBubbleGame"],
      whack: ["game-whack", "closeWhackGame"],
      memory: ["game-memory", "closeMemoryGame"],
      snake: ["game-snake", "closeSnakeGame"],
      bubblecat: ["game-bubblecat", "closeBubbleCatGame"]
    };
    const [mod, fn] = closeFns[game];
    import(`./${mod}.js?v=20261110.7`).then(m => m[fn] && m[fn]());
  });

  // 页面隐藏/关闭时强制落盘，避免节流丢数据
  window.addEventListener("pagehide", () => AppStore.flush());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      AppStore.flush();
      stopIdle();
    } else {
      settleOffline();
      renderMain();
      startIdle();
    }
  });

  // 启动待机呼吸和随机小动作
  startIdle();

  // 游戏内“?”帮助按钮与统一玩法说明
  bindGameHelpButtons();

  // 告诉 index.html 的启动自检：脚本已经完整执行并完成绑定
  window.__petReady = true;
}

document.addEventListener("DOMContentLoaded", () => bootstrap());
