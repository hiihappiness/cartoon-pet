import { AppConfig } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { soundGameHit, soundGameEnd } from './util.js?v=20261110.7';
import { addExp } from './main-pet.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';
import { beginGame, grantReward, recordBest, gameById, finishToast } from './game-common.js?v=20261110.7';
import { maybeShowGameHelp } from './game-help.js?v=20261110.7';

let running = false;
let gameTimer = null;
let spawnTimer = null;
let score = 0;
let remainTime = 30;

function $id(id) { return document.getElementById(id); }

export function openBubbleGame() {
  const modal = $id("gameModal");
  if (modal) modal.style.display = "flex";
  stopGame();
  resetView();
  maybeShowGameHelp("bubble");
}

export function closeBubbleGame() {
  const modal = $id("gameModal");
  if (modal) modal.style.display = "none";
  stopGame();
}

function resetView() {
  score = 0;
  remainTime = AppConfig.GAMES.find(g => g.id === "bubble").duration;
  const scoreEl = $id("gameScore");
  const timerEl = $id("gameTimerText");
  if (scoreEl) scoreEl.innerText = score;
  if (timerEl) timerEl.innerText = remainTime;
  const area = $id("gameArea");
  if (area) area.innerHTML = "";
  const tip = $id("gameTip");
  if (tip) tip.innerText = "点击泡泡，30 秒内尽量多得分";
}

export function startBubbleGame() {
  const game = gameById("bubble");
  if (!beginGame(game)) return;
  stopGame();
  resetView();
  running = true;
  const tip = $id("gameTip");
  if (tip) tip.innerText = "点击泡泡！";

  gameTimer = setInterval(() => {
    remainTime -= 1;
    const timerEl = $id("gameTimerText");
    if (timerEl) timerEl.innerText = Math.max(0, remainTime);
    if (remainTime <= 0) {
      stopGame();
      gameOver();
    }
  }, 1000);
  spawnBubbleLoop();
}

function spawnBubbleLoop() {
  if (!running) return;
  createBubble();
  spawnTimer = setTimeout(spawnBubbleLoop, 600);
}

function createBubble() {
  const area = $id("gameArea");
  if (!area) return;
  const b = document.createElement("div");
  b.className = "bubble";
  const maxX = Math.max(0, area.clientWidth - 44);
  const maxY = Math.max(0, area.clientHeight - 44);
  b.style.left = Math.floor(Math.random() * maxX) + "px";
  b.style.top = Math.floor(Math.random() * maxY) + "px";
  b.innerText = "+10";
  b.onclick = (e) => {
    e.stopPropagation();
    soundGameHit();
    score += 10;
    const scoreEl = $id("gameScore");
    if (scoreEl) scoreEl.innerText = score;
    b.remove();
  };
  area.appendChild(b);
  setTimeout(() => b.remove(), 1400);
}

function stopGame() {
  running = false;
  clearInterval(gameTimer);
  clearTimeout(spawnTimer);
  gameTimer = null;
  spawnTimer = null;
  // 结算后残留的泡泡仍可点击会继续加分，和最终奖励对不上，这里一并清掉
  const area = $id("gameArea");
  if (area) area.innerHTML = "";
}

function gameOver() {
  soundGameEnd();
  const data = AppStore.data;
  data.totalGame = (data.totalGame || 0) + 1;
  recordBest("bestBubble", score);
  let reward = {};
  if (score < 60) reward = { grain: 3 };
  else if (score < 120) reward = { fruit: 2, cookie: 1 };
  else reward = { cake: 1, milk: 2 };
  const rewardText = grantReward(reward);
  addExp(3 + Math.floor(score / 30));
  checkAchievements();
  AppStore.save(data, true);
  const tip = $id("gameTip");
  if (tip) tip.innerText = `本局得分 ${score}`;
  finishToast("🫧", `泡泡游戏结束，得分 ${score}`, `最高分 ${data.bestBubble}`, rewardText);
}
