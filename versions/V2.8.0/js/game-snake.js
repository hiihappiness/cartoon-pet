import { AppStore } from './store.js?v=20261110.7';
import { soundGameEnd, soundGameHit } from './util.js?v=20261110.7';
import { addExp } from './main-pet.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';
import { beginGame, grantReward, recordBest, gameById, finishToast } from './game-common.js?v=20261110.7';
import { maybeShowGameHelp } from './game-help.js?v=20261110.7';

const COLS = 20;
const ROWS = 20;
const CELL = 20;
const SIZE = COLS * CELL;

let running = false;
let snake = [];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let stepMs = 140;
let acc = 0;
let lastT = 0;
let raf = null;
let swipeStart = null;
let ctx = null;

function $id(id) { return document.getElementById(id); }

function setStartState(on) {
  const btn = $id("snakeStartBtn");
  if (!btn) return;
  btn.disabled = on;
  btn.innerText = on ? "游戏中…" : "开始游戏";
}

function getCtx() {
  const canvas = $id("snakeCanvas");
  if (!canvas) return null;
  if (!ctx) ctx = canvas.getContext("2d");
  return ctx;
}

function resetBoard() {
  snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  stepMs = 140;
  acc = 0;
  lastT = 0;
  placeFood();
  updateText();
  draw();
}

function placeFood() {
  let tries = 0;
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    tries++;
  } while (tries < 200 && snake.some(s => s.x === food.x && s.y === food.y));
}

function updateText() {
  const scoreEl = $id("snakeScore");
  const lenEl = $id("snakeLen");
  const bestEl = $id("snakeBest");
  if (scoreEl) scoreEl.innerText = score;
  if (lenEl) lenEl.innerText = snake.length;
  if (bestEl) bestEl.innerText = AppStore.data.bestSnake || 0;
}

function draw() {
  const c = getCtx();
  if (!c) return;
  c.clearRect(0, 0, SIZE, SIZE);
  const bg = c.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#effaf0");
  bg.addColorStop(1, "#d7f0df");
  c.fillStyle = bg;
  c.fillRect(0, 0, SIZE, SIZE);

  c.strokeStyle = "rgba(90, 140, 100, 0.18)";
  c.lineWidth = 1;
  for (let i = 1; i < COLS; i++) {
    c.beginPath(); c.moveTo(i * CELL, 0); c.lineTo(i * CELL, SIZE); c.stroke();
    c.beginPath(); c.moveTo(0, i * CELL); c.lineTo(SIZE, i * CELL); c.stroke();
  }

  // 果实
  c.font = "18px system-ui, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("🍎", food.x * CELL + CELL / 2, food.y * CELL + CELL / 2);

  // 蛇身
  snake.forEach((seg, i) => {
    const head = i === 0;
    c.beginPath();
    c.arc(seg.x * CELL + CELL / 2, seg.y * CELL + CELL / 2, head ? 9 : 8, 0, Math.PI * 2);
    c.fillStyle = head ? "#3fae5a" : (i % 2 ? "#7fd48f" : "#66c67a");
    c.fill();
    if (head) {
      const ex = dir.x !== 0 ? dir.x * 3 : 0;
      const ey = dir.y !== 0 ? dir.y * 3 : 0;
      c.fillStyle = "#1c3322";
      c.beginPath(); c.arc(seg.x * CELL + 7 + ex, seg.y * CELL + 8 + ey, 1.8, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(seg.x * CELL + 13 + ex, seg.y * CELL + 8 + ey, 1.8, 0, Math.PI * 2); c.fill();
    }
  });
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
    snake.some((s, i) => i < snake.length - 1 && s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    soundGameHit();
    if (stepMs > 70) stepMs -= 3;
    placeFood();
    updateText();
  } else {
    snake.pop();
  }
  updateText();
}

function loop(t) {
  if (!running) return;
  if (!lastT) lastT = t;
  acc += Math.min(80, t - lastT);
  lastT = t;
  while (acc >= stepMs && running) {
    acc -= stepMs;
    step();
  }
  draw();
  if (running) raf = requestAnimationFrame(loop);
}

export function openSnakeGame() {
  const modal = $id("snakeModal");
  if (modal) modal.style.display = "flex";
  stopSnake();
  resetBoard();
  const tip = $id("snakeTip");
  if (tip) tip.innerText = "滑动屏幕、方向键或方向按钮控制，吃果实变长";
  bindSnakeControls();
  maybeShowGameHelp("snake");
}

export function closeSnakeGame() {
  const modal = $id("snakeModal");
  if (modal) modal.style.display = "none";
  stopSnake();
}

export function stopSnake() {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  lastT = 0;
  setStartState(false);
}

export function startSnakeGame() {
  const game = gameById("snake");
  if (!beginGame(game)) return;
  stopSnake();
  resetBoard();
  running = true;
  lastT = 0;
  acc = 0;
  const tip = $id("snakeTip");
  if (tip) tip.innerText = "开始！吃果实，别撞墙";
  setStartState(true);
  raf = requestAnimationFrame(loop);
}

function gameOver() {
  stopSnake();
  const data = AppStore.data;
  data.totalGame = (data.totalGame || 0) + 1;
  data.totalSnake = (data.totalSnake || 0) + 1;
  recordBest("bestSnake", score);
  let reward = {};
  if (score < 50) reward = { grain: 3 };
  else if (score < 100) reward = { fruit: 2, cookie: 1 };
  else reward = { cake: 1, milk: 2 };
  const rewardText = grantReward(reward);
  addExp(4 + Math.floor(score / 10));
  checkAchievements();
  AppStore.save(data, true);
  const tip = $id("snakeTip");
  if (tip) tip.innerText = `撞到了，本局 ${score} 分`;
  finishToast("🐍", `贪吃蛇结束，得分 ${score}`, `长度 ${snake.length}｜最高 ${data.bestSnake}`, rewardText);
  updateText();
}

function setDir(x, y) {
  if (!running) return;
  if (x === -dir.x && y === -dir.y) return;
  if (x === dir.x && y === dir.y) return;
  nextDir = { x, y };
}

const KEY_DIRS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0]
};
document.addEventListener("keydown", (e) => {
  if (!running) return;
  const d = KEY_DIRS[e.key] || KEY_DIRS[e.key.toLowerCase?.()];
  if (!d) return;
  e.preventDefault();
  setDir(d[0], d[1]);
});

function bindSwipe() {
  const canvas = $id("snakeCanvas");
  if (!canvas || canvas.dataset.swipeBound) return;
  canvas.dataset.swipeBound = "1";
  canvas.addEventListener("pointerdown", (e) => {
    swipeStart = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!swipeStart) return;
    const dx = e.clientX - swipeStart.x;
    const dy = e.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
  });
}

export function bindSnakeControls() {
  bindSwipe();
  document.querySelectorAll("#snakePad [data-dir]").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const d = btn.dataset.dir;
      if (d === "up") setDir(0, -1);
      else if (d === "down") setDir(0, 1);
      else if (d === "left") setDir(-1, 0);
      else setDir(1, 0);
    });
  });
}
