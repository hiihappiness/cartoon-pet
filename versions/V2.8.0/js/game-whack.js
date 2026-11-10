import { AppConfig } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { soundGameHit, soundGameEnd } from './util.js?v=20261110.7';
import { addExp } from './main-pet.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';
import { beginGame, grantReward, recordBest, gameById, finishToast } from './game-common.js?v=20261110.7';
import { maybeShowGameHelp } from './game-help.js?v=20261110.7';

const HOLES = 9;
const GAME_DURATION = 30;
const MOLE_ALIVE = 950;

let running = false;
let timeLeft = GAME_DURATION;
let score = 0;
let hits = 0;
let timerId = null;
let moleTimer = null;
let hideTimer = null;
let currentMole = null;

function $id(id) { return document.getElementById(id); }

function buildHoles() {
  const area = $id("whackArea");
  if (!area || area.children.length) return;
  for (let i = 0; i < HOLES; i++) {
    const hole = document.createElement("div");
    hole.className = "whack-hole";
    hole.dataset.index = String(i);
    hole.innerHTML = `<span class="whack-mole">🍄</span>`;
    hole.addEventListener("click", () => hitHole(hole));
    area.appendChild(hole);
  }
}

export function openWhackGame() {
  const modal = $id("whackModal");
  if (modal) modal.style.display = "flex";
  buildHoles();
  resetView();
  maybeShowGameHelp("whack");
}

export function closeWhackGame() {
  const modal = $id("whackModal");
  if (modal) modal.style.display = "none";
  stopGame();
}

function resetView() {
  stopGame();
  score = 0;
  hits = 0;
  timeLeft = GAME_DURATION;
  const scoreEl = $id("whackScore");
  const timerEl = $id("whackTimerText");
  if (scoreEl) scoreEl.innerText = 0;
  if (timerEl) timerEl.innerText = GAME_DURATION;
  const area = $id("whackArea");
  if (area) area.querySelectorAll(".whack-hole").forEach(h => h.classList.remove("up", "hit"));
}

export function startWhackGame() {
  const game = gameById("whack");
  if (!beginGame(game)) return;
  resetView();
  running = true;
  const tip = $id("whackTip");
  if (tip) tip.innerText = "敲中冒头的小团子！每只 +10 分";

  timerId = setInterval(() => {
    timeLeft -= 1;
    const timerEl = $id("whackTimerText");
    if (timerEl) timerEl.innerText = Math.max(0, timeLeft);
    if (timeLeft <= 0) {
      stopGame();
      gameOver();
    }
  }, 1000);
  scheduleMole();
}

function scheduleMole() {
  if (!running) return;
  const base = 780 - (GAME_DURATION - timeLeft) * 18;
  const delay = Math.max(360, base) + Math.random() * 260;
  moleTimer = setTimeout(() => {
    if (!running) return;
    showMole();
    scheduleMole();
  }, delay);
}

function showMole() {
  const area = $id("whackArea");
  if (!area) return;
  const holes = area.querySelectorAll(".whack-hole");
  if (!holes.length) return;
  if (currentMole) currentMole.el.classList.remove("up");
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  hole.classList.add("up");
  currentMole = { el: hole, index: idx };
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    hole.classList.remove("up");
    if (currentMole && currentMole.el === hole) currentMole = null;
  }, MOLE_ALIVE);
}

function hitHole(hole) {
  if (!running) return;
  if (!hole.classList.contains("up")) return;
  hole.classList.remove("up");
  hole.classList.add("hit");
  setTimeout(() => hole.classList.remove("hit"), 200);
  if (currentMole && currentMole.el === hole) currentMole = null;
  soundGameHit();
  score += 10;
  hits += 1;
  const scoreEl = $id("whackScore");
  if (scoreEl) scoreEl.innerText = score;
}

function stopGame() {
  running = false;
  clearInterval(timerId);
  clearTimeout(moleTimer);
  clearTimeout(hideTimer);
  timerId = null;
  moleTimer = null;
  hideTimer = null;
  currentMole = null;
  const area = $id("whackArea");
  if (area) area.querySelectorAll(".whack-hole").forEach(h => h.classList.remove("up"));
}

function gameOver() {
  soundGameEnd();
  const data = AppStore.data;
  data.totalWhack = (data.totalWhack || 0) + 1;
  recordBest("bestWhack", score);
  let reward = {};
  if (score >= 300) reward = { cake: 1, milk: 1 };
  else if (score >= 180) reward = { cookie: 2, grain: 1 };
  else if (score >= 80) reward = { cookie: 1, grain: 2 };
  else reward = { grain: 2 };
  const rewardText = grantReward(reward);
  addExp(3 + Math.floor(hits / 3));
  checkAchievements();
  AppStore.save(data, true);
  const tip = $id("whackTip");
  if (tip) tip.innerText = `本局敲中 ${hits} 只，得分 ${score}`;
  finishToast("🔨", `打地鼠结束，敲中 ${hits} 只`, `得分 ${score}｜最高 ${data.bestWhack}`, rewardText);
}
