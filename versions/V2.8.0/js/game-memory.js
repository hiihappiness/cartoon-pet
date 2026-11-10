import { AppStore } from './store.js?v=20261110.7';
import { soundGameHit, soundGameEnd, soundReward } from './util.js?v=20261110.7';
import { addExp } from './main-pet.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';
import { beginGame, grantReward, recordBest, gameById, finishToast } from './game-common.js?v=20261110.7';
import { maybeShowGameHelp } from './game-help.js?v=20261110.7';

const ICONS = ["🍎", "🍪", "🥛", "🌾", "🍰", "🍓", "🍄", "🔔"];
const GAME_DURATION = 90;
const PAIRS = ICONS.length;

let running = false;
let timeLeft = GAME_DURATION;
let moves = 0;
let found = 0;
let firstCard = null;
let lock = false;
let timerId = null;
let flipBackTimer = null;

function $id(id) { return document.getElementById(id); }

function buildDeck() {
  const cards = [...ICONS, ...ICONS].map((icon, i) => ({ icon, uid: i }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function renderGrid() {
  const grid = $id("memoryGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const deck = buildDeck();
  deck.forEach(card => {
    const el = document.createElement("div");
    el.className = "memory-card";
    el.dataset.icon = card.icon;
    el.innerHTML = `<span class="memory-back">❓</span><span class="memory-face">${card.icon}</span>`;
    el.addEventListener("click", () => flipCard(el));
    grid.appendChild(el);
  });
}

function resetView() {
  running = false;
  clearInterval(timerId);
  clearTimeout(flipBackTimer);
  firstCard = null;
  lock = false;
  moves = 0;
  found = 0;
  timeLeft = GAME_DURATION;
  const timerEl = $id("memoryTimerText");
  const movesEl = $id("memoryMoves");
  const pairEl = $id("memoryPairs");
  if (timerEl) timerEl.innerText = GAME_DURATION;
  if (movesEl) movesEl.innerText = 0;
  if (pairEl) pairEl.innerText = 0;
  renderGrid();
}

export function openMemoryGame() {
  const modal = $id("memoryModal");
  if (modal) modal.style.display = "flex";
  resetView();
  maybeShowGameHelp("memory");
}

export function closeMemoryGame() {
  const modal = $id("memoryModal");
  if (modal) modal.style.display = "none";
  stopGame();
}

export function startMemoryGame() {
  const game = gameById("memory");
  if (!beginGame(game)) return;
  resetView();
  running = true;
  const tip = $id("memoryTip");
  if (tip) tip.innerText = "翻开两张相同的卡片～";
  timerId = setInterval(() => {
    timeLeft -= 1;
    const timerEl = $id("memoryTimerText");
    if (timerEl) timerEl.innerText = Math.max(0, timeLeft);
    if (timeLeft <= 0) {
      stopGame();
      gameOver(false);
    }
  }, 1000);
}

function flipCard(el) {
  if (!running || lock) return;
  if (el.classList.contains("flipped") || el.classList.contains("matched")) return;
  el.classList.add("flipped");
  soundGameHit();

  if (!firstCard) {
    firstCard = el;
    return;
  }
  moves += 1;
  const movesEl = $id("memoryMoves");
  if (movesEl) movesEl.innerText = moves;

  if (firstCard.dataset.icon === el.dataset.icon) {
    firstCard.classList.add("matched");
    el.classList.add("matched");
    firstCard = null;
    found += 1;
    const pairEl = $id("memoryPairs");
    if (pairEl) pairEl.innerText = found;
    soundReward();
    if (found === PAIRS && running) {
      stopGame();
      gameOver(true);
    }
  } else {
    lock = true;
    const prev = firstCard;
    firstCard = null;
    flipBackTimer = setTimeout(() => {
      prev.classList.remove("flipped");
      el.classList.remove("flipped");
      lock = false;
    }, 700);
  }
}

function stopGame() {
  running = false;
  clearInterval(timerId);
  clearTimeout(flipBackTimer);
  timerId = null;
  flipBackTimer = null;
  firstCard = null;
  // 时间到正好卡在翻回动画里时，两张牌会一直亮着，这里统一复位
  const grid = $id("memoryGrid");
  if (grid) {
    grid.querySelectorAll(".memory-card.flipped:not(.matched)").forEach(c => c.classList.remove("flipped"));
  }
  lock = true;
}

function gameOver(won) {
  if (!running && won === false && timeLeft > 0) return;
  soundGameEnd();
  const data = AppStore.data;
  data.totalMemory = (data.totalMemory || 0) + 1;
  if (won) data.memoryWins = (data.memoryWins || 0) + 1;
  recordBest("bestMemory", found);
  let reward = {};
  if (found >= PAIRS) reward = { cake: 1, cookie: 1 };
  else if (found >= 6) reward = { cookie: 2, grain: 1 };
  else if (found >= 3) reward = { grain: 2 };
  else reward = { grain: 1 };
  const rewardText = grantReward(reward);
  addExp(4 + found);
  checkAchievements();
  AppStore.save(data, true);
  const tip = $id("memoryTip");
  if (tip) tip.innerText = won ? `全部配对完成！共用 ${moves} 步` : `时间到，找到 ${found} 对`;
  finishToast("🃏", won ? "翻翻乐通关！" : "翻翻乐结束",
    `配对 ${found}/${PAIRS}｜${moves} 步｜最高 ${data.bestMemory} 对`, rewardText);
}
