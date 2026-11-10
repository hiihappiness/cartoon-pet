import { AppConfig } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { soundGameHit, soundGameEnd } from './util.js?v=20261110.7';
import { addExp } from './main-pet.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';
import { beginGame, grantReward, recordBest, gameById, finishToast } from './game-common.js?v=20261110.7';
import { maybeShowGameHelp } from './game-help.js?v=20261110.7';

const GAME = AppConfig.FEED_GAME;
const FOODS = ["🍎", "🍪", "🥛", "🌾", "🍰", "🍓"];

let running = false;
let timerId = null;
let rafId = null;
let remain = GAME.duration;
let caught = 0;
let lastTs = 0;
let spawnAcc = 0;
let foods = [];
let basketX = 0;
let areaW = 0;
let areaH = 0;

function $id(id) { return document.getElementById(id); }

function measureArea() {
  const area = $id("feedArea");
  if (!area) return;
  areaW = area.clientWidth;
  areaH = area.clientHeight;
}

function setBasket(x) {
  const basket = $id("feedBasket");
  if (!basket) return;
  basketX = Math.max(GAME.basketWidth / 2, Math.min(areaW - GAME.basketWidth / 2, x));
  basket.style.left = basketX + "px";
}

function resetView() {
  measureArea();
  remain = GAME.duration;
  caught = 0;
  foods.forEach(f => f.el.remove());
  foods = [];
  const scoreEl = $id("feedScore");
  const timerEl = $id("feedTimerText");
  if (scoreEl) scoreEl.innerText = 0;
  if (timerEl) timerEl.innerText = GAME.duration;
  setBasket(areaW / 2);
}

export function openFeedGame() {
  const modal = $id("feedGameModal");
  if (modal) modal.style.display = "flex";
  stopGame();
  resetView();
  maybeShowGameHelp("feed");
}

export function closeFeedGame() {
  stopGame();
  const modal = $id("feedGameModal");
  if (modal) modal.style.display = "none";
}

function stopGame() {
  running = false;
  clearInterval(timerId);
  timerId = null;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

export function startFeedGame() {
  const game = gameById("feed");
  if (!beginGame(game)) return;
  stopGame();
  resetView();
  running = true;
  const tip = $id("feedTip");
  if (tip) tip.innerText = "接住食物！接得越多奖励越好";
  timerId = setInterval(() => {
    remain -= 1;
    const timerEl = $id("feedTimerText");
    if (timerEl) timerEl.innerText = Math.max(0, remain);
    if (remain <= 0) {
      stopGame();
      gameOver();
    }
  }, 1000);
  lastTs = 0;
  spawnAcc = 0;
  rafId = requestAnimationFrame(loop);
}

function currentSpawnInterval() {
  const progress = 1 - remain / GAME.duration;
  return Math.max(GAME.spawnMin, GAME.spawnBase - progress * (GAME.spawnBase - GAME.spawnMin));
}

function spawnFood() {
  const area = $id("feedArea");
  if (!area) return;
  const size = GAME.foodSize;
  const x = Math.random() * Math.max(0, areaW - size);
  const el = document.createElement("div");
  el.className = "feed-food";
  el.style.left = "0px";
  el.style.top = "0px";
  el.style.transform = `translate(${x}px, -40px)`;
  el.innerText = FOODS[Math.floor(Math.random() * FOODS.length)];
  area.appendChild(el);
  foods.push({
    x,
    y: -40,
    vy: 70 + Math.random() * 45 + (GAME.duration - remain) * 6,
    size,
    el
  });
}

function loop(ts) {
  if (!running) return;
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (dt > 0.06) dt = 0.06;

  spawnAcc += dt;
  if (spawnAcc >= currentSpawnInterval() / 1000) {
    spawnAcc = 0;
    spawnFood();
  }

  const bottomY = areaH - 46;
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    f.y += f.vy * dt;
    f.el.style.transform = `translate(${f.x}px, ${f.y}px)`;

    if (f.y + f.size >= bottomY && f.y + f.size <= bottomY + 24) {
      const foodCenter = f.x + f.size / 2;
      if (Math.abs(foodCenter - basketX) <= GAME.basketWidth / 2 + 6) {
        caught += 1;
        const scoreEl = $id("feedScore");
        if (scoreEl) scoreEl.innerText = caught;
        soundGameHit();
        f.el.remove();
        foods.splice(i, 1);
        continue;
      }
    }
    if (f.y > areaH) {
      f.el.remove();
      foods.splice(i, 1);
    }
  }
  rafId = requestAnimationFrame(loop);
}

function gameOver() {
  soundGameEnd();
  const data = AppStore.data;
  data.totalFeedGame = (data.totalFeedGame || 0) + 1;
  recordBest("bestFeed", caught);
  let reward = {};
  if (caught >= 12) reward = { cake: 1, milk: 1, sweetPotion: 1 };
  else if (caught >= 8) reward = { cookie: 2, fruit: 1 };
  else if (caught >= 4) reward = { grain: 2, cookie: 1 };
  else reward = { grain: 2 };
  const rewardText = grantReward(reward);
  addExp(4 + caught);
  checkAchievements();
  AppStore.save(data, true);
  const tip = $id("feedTip");
  if (tip) tip.innerText = `本局接住 ${caught} 个食物`;
  finishToast("🍎", `接食物结束，接住 ${caught} 个`, `最高 ${data.bestFeed} 个`, rewardText);
}

/* 拖动控制：pointermove 与 touchmove 都会触发，统一交给 setBasket，重复调用无副作用 */
document.addEventListener("pointermove", (e) => {
  if (!running) return;
  const area = $id("feedArea");
  if (!area) return;
  const rect = area.getBoundingClientRect();
  const inside = e.clientX >= rect.left - 20 && e.clientX <= rect.right + 20 &&
                 e.clientY >= rect.top - 20 && e.clientY <= rect.bottom + 20;
  if (!inside) return;
  setBasket(e.clientX - rect.left);
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  if (!running) return;
  const area = $id("feedArea");
  if (!area || !e.touches[0]) return;
  const rect = area.getBoundingClientRect();
  const x = e.touches[0].clientX;
  if (x < rect.left - 20 || x > rect.right + 20) return;
  setBasket(x - rect.left);
  e.preventDefault();
}, { passive: false });

// 旋转屏幕后场地宽高会变，重新量一次避免判定线错位
window.addEventListener("resize", () => {
  if (running) {
    measureArea();
    setBasket(basketX);
  }
});
