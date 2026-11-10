import { AppStore } from './store.js?v=20261110.7';
import { toast, soundGameHit, soundGameEnd } from './util.js?v=20261110.7';
import { addExp } from './main-pet.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';
import { beginGame, grantReward, recordBest, gameById, finishToast } from './game-common.js?v=20261110.7';
import { maybeShowGameHelp } from './game-help.js?v=20261110.7';

const W = 360;
const H = 560;
const R = 18;
const D = R * 2;
const ROW_H = D * Math.sqrt(3) / 2;
const TOP = 8;
const LEFT = 18;
const COLS = 9;
const ROWS = 13;
const CANNON = { x: W / 2, y: 512 };
const MAX_LEVEL = 999;
const COLORS = ["#ff8fab", "#7cc7ff", "#ffd166", "#9be08a", "#c9a7ff", "#ff9f6e"];

let canvas = null;
let ctx = null;
let grid = [];
let rowOffset = 0;
let level = 1;
let score = 0;
let target = 51;
let remain = 60;
let running = false;
let busy = false;
let timer = null;
let raf = null;
let lastT = 0;
let shot = null;
let nextColor = 0;
let aim = -Math.PI / 2;
let aiming = false;
let shotsSinceDrop = 0;
let effects = [];
let floats = [];

function $id(id) { return document.getElementById(id); }

function setStartState(on) {
  const btn = $id("bcStartBtn");
  if (!btn) return;
  btn.disabled = on;
  btn.innerText = on ? "闯关中…" : "开始闯关";
}

function targetOf(lv) {
  return 45 + Math.min(lv, 90) * 6;
}

function colorCount(lv) {
  return Math.min(COLORS.length, 3 + Math.floor((lv - 1) / 15));
}

function dropEvery() {
  return Math.max(4, 7 - Math.floor(level / 30));
}

function cellX(r, c) {
  return LEFT + R + c * D + ((r + rowOffset) % 2 ? R : 0);
}

function cellY(r) {
  return TOP + R + r * ROW_H;
}

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function buildBoard(lv) {
  const n = colorCount(lv);
  const startRows = 4 + Math.min(2, Math.floor((lv - 1) / 40));
  grid = emptyGrid();
  rowOffset = 0;
  for (let r = 0; r < startRows; r++) {
    for (let c = 0; c < COLS; c++) grid[r][c] = Math.floor(Math.random() * n);
  }
  // 保证开局至少有一组能消的同色泡泡
  for (let tries = 0; tries < 12 && !hasAnyMatch(); tries++) {
    for (let r = 0; r < startRows; r++) {
      for (let c = 0; c < COLS; c++) grid[r][c] = Math.floor(Math.random() * n);
    }
  }
  shotsSinceDrop = 0;
}

function hasAnyMatch() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== null && findGroup(r, c).length >= 3) return true;
    }
  }
  return false;
}

function neighbors(r, c) {
  const odd = (r + rowOffset) % 2 === 1;
  const out = [[r, c - 1], [r, c + 1]];
  if (odd) out.push([r - 1, c], [r - 1, c + 1], [r + 1, c], [r + 1, c + 1]);
  else out.push([r - 1, c - 1], [r - 1, c], [r + 1, c - 1], [r + 1, c]);
  return out;
}

function findGroup(r0, c0) {
  const color = grid[r0]?.[c0];
  if (color === null || color === undefined) return [];
  const seen = new Set();
  const out = [];
  const stack = [[r0, c0]];
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = r + ":" + c;
    if (seen.has(key)) continue;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (grid[r][c] !== color) continue;
    seen.add(key);
    out.push([r, c]);
    neighbors(r, c).forEach(([y, x]) => stack.push([y, x]));
  }
  return out;
}

function findFloating() {
  const seen = new Set();
  const stack = [];
  for (let c = 0; c < COLS; c++) {
    if (grid[0][c] !== null) stack.push([0, c]);
  }
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = r + ":" + c;
    if (seen.has(key)) continue;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (grid[r][c] === null) continue;
    seen.add(key);
    neighbors(r, c).forEach(([y, x]) => stack.push([y, x]));
  }
  const floating = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== null && !seen.has(r + ":" + c)) floating.push([r, c]);
    }
  }
  return floating;
}

function hasOccupiedNeighbor(r, c) {
  return neighbors(r, c).some(([y, x]) => y >= 0 && y < ROWS && x >= 0 && x < COLS && grid[y][x] !== null);
}

function randomColor() {
  return Math.floor(Math.random() * colorCount(level));
}

function updateText() {
  const lv = $id("bcLevel");
  const sc = $id("bcScore");
  const tg = $id("bcTarget");
  const tm = $id("bcTimer");
  const best = $id("bcBest");
  if (lv) lv.innerText = level;
  if (sc) sc.innerText = score;
  if (tg) tg.innerText = target;
  if (tm) tm.innerText = remain;
  if (best) best.innerText = Math.max(AppStore.data.bestBubbleCat || 0, level);
}

function getCtx() {
  if (ctx) return ctx;
  canvas = $id("bcCanvas");
  if (!canvas) return null;
  ctx = canvas.getContext("2d");
  return ctx;
}

function shade(hex, amt) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawBubble(x, y, color, scale = 1, alpha = 1) {
  if (!ctx) return;
  const r = R * scale;
  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.18, "#ffffff");
  grad.addColorStop(0.3, color);
  grad.addColorStop(1, shade(color, -30));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.38, r * 0.17, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
  ctx.restore();
}

function draw() {
  const c = getCtx();
  if (!c) return;
  c.clearRect(0, 0, W, H);

  // 顶部危险线
  const dangerY = 440;
  c.save();
  c.strokeStyle = "rgba(255,77,109,0.35)";
  c.setLineDash([6, 8]);
  c.beginPath();
  c.moveTo(8, dangerY);
  c.lineTo(W - 8, dangerY);
  c.stroke();
  c.restore();

  // 盘面泡泡
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const v = grid[r]?.[col];
      if (v === null || v === undefined) continue;
      drawBubble(cellX(r, col), cellY(r), COLORS[v]);
    }
  }

  // 瞄准虚线
  if (running && !shot) {
    c.save();
    c.strokeStyle = "rgba(60,90,120,0.35)";
    c.lineWidth = 2;
    c.setLineDash([5, 9]);
    c.beginPath();
    c.moveTo(CANNON.x + Math.cos(aim) * 30, CANNON.y + Math.sin(aim) * 30);
    c.lineTo(CANNON.x + Math.cos(aim) * 280, CANNON.y + Math.sin(aim) * 280);
    c.stroke();
    c.restore();
  }

  // 底部大炮
  c.save();
  c.translate(CANNON.x, CANNON.y);
  c.rotate(aim);
  c.fillStyle = "#46617d";
  c.beginPath();
  c.roundRect(10, -8, 34, 16, 8);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.beginPath();
  c.roundRect(14, -5, 22, 5, 3);
  c.fill();
  c.restore();
  c.beginPath();
  c.arc(CANNON.x, CANNON.y, 22, 0, Math.PI * 2);
  c.fillStyle = "#5c7896";
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.5)";
  c.lineWidth = 2;
  c.stroke();

  // 下一颗泡泡
  drawBubble(W - 46, CANNON.y + 2, COLORS[nextColor], 0.9);
  c.save();
  c.fillStyle = "rgba(60,80,100,0.75)";
  c.font = "11px sans-serif";
  c.textAlign = "center";
  c.fillText("下一颗", W - 46, CANNON.y + 27);
  c.restore();

  // 飞行中的泡泡
  if (shot) drawBubble(shot.x, shot.y, COLORS[shot.color]);

  // 爆炸粒子
  effects.forEach(p => {
    c.save();
    c.globalAlpha = Math.max(0, p.life / p.maxLife);
    c.beginPath();
    c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    c.fillStyle = p.color;
    c.fill();
    c.restore();
  });

  // 飘分
  floats.forEach(f => {
    c.save();
    c.globalAlpha = Math.max(0, f.life / f.maxLife);
    c.fillStyle = "#3b8b55";
    c.font = "bold 15px sans-serif";
    c.textAlign = "center";
    c.fillText(f.text, f.x, f.y);
    c.restore();
  });
}

function spawnPop(x, y, color) {
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 20 + Math.random() * 80;
    effects.push({
      x, y, color,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: 2 + Math.random() * 3,
      life: 0.45 + Math.random() * 0.2,
      maxLife: 0.65,
    });
  }
}

function addFloat(text, x, y) {
  floats.push({ text, x, y, life: 0.9, maxLife: 0.9 });
}

function updateEffects(dt) {
  effects = effects.filter(p => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 40 * dt;
    return p.life > 0;
  });
  floats = floats.filter(f => {
    f.life -= dt;
    f.y -= 22 * dt;
    return f.life > 0;
  });
}

function updateShot(dt) {
  if (!shot) return;
  let nx = shot.x + shot.vx * dt;
  let ny = shot.y + shot.vy * dt;
  if (nx - R < 0) { nx = R; shot.vx = Math.abs(shot.vx); }
  if (nx + R > W) { nx = W - R; shot.vx = -Math.abs(shot.vx); }
  if (ny - R <= TOP) {
    shot.x = nx;
    shot.y = ny;
    placeShot(nx, TOP + R);
    return;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) continue;
      const bx = cellX(r, c);
      const by = cellY(r);
      if ((nx - bx) ** 2 + (ny - by) ** 2 < (D * 0.92) ** 2) {
        shot.x = nx;
        shot.y = ny;
        placeShot(nx, ny);
        return;
      }
    }
  }
  shot.x = nx;
  shot.y = ny;
}

function placeShot(x, y) {
  const color = shot.color;
  const baseR = Math.max(0, Math.min(ROWS - 1, Math.round((y - TOP - R) / ROW_H)));
  const baseC = Math.max(0, Math.min(COLS - 1, Math.round((x - LEFT - R) / D)));
  let best = null;
  let bestDist = Infinity;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = baseR + dr;
      const col = baseC + dc;
      if (r < 0 || r >= ROWS || col < 0 || col >= COLS) continue;
      if (grid[r][col] !== null) continue;
      if (r > 0 && !hasOccupiedNeighbor(r, col)) continue;
      const d = (cellX(r, col) - x) ** 2 + (cellY(r) - y) ** 2;
      if (d < bestDist) { bestDist = d; best = [r, col]; }
    }
  }
  if (!best) {
    for (let r = 0; r < ROWS && !best; r++) {
      for (let col = 0; col < COLS; col++) {
        if (grid[r][col] !== null) continue;
        const d = (cellX(r, col) - x) ** 2 + (cellY(r) - y) ** 2;
        if (d < bestDist) { bestDist = d; best = [r, col]; }
      }
    }
  }
  shot = null;
  if (!best) {
    gameOver("泡泡堆满了，本局结束");
    return;
  }
  const [r, col] = best;
  grid[r][col] = color;
  soundGameHit();
  resolveAt(r, col);
}

function resolveAt(r, col) {
  const group = findGroup(r, col);
  if (group.length >= 3) {
    busy = true;
    const gained = group.length * 10;
    group.forEach(([y, x]) => {
      spawnPop(cellX(y, x), cellY(y), COLORS[grid[y][x]]);
      grid[y][x] = null;
    });
    score += gained;
    addFloat(`+${gained}`, cellX(r, col), cellY(r) - 14);
    updateText();
    setTimeout(() => {
      if (!running) return;
      const floating = findFloating();
      if (floating.length) {
        floating.forEach(([y, x]) => {
          spawnPop(cellX(y, x), cellY(y), COLORS[grid[y][x]]);
          grid[y][x] = null;
        });
        const extra = floating.length * 15;
        score += extra;
        addFloat(`+${extra}`, W / 2, 330);
        updateText();
      }
      busy = false;
      afterShot();
    }, 280);
  } else {
    afterShot();
  }
}

function afterShot() {
  if (!running) return;
  if (score >= target) {
    levelClear();
    return;
  }
  shotsSinceDrop += 1;
  if (shotsSinceDrop >= dropEvery()) {
    shotsSinceDrop = 0;
    if (addRow()) return;
  }
}

/** 顶部落下一排新泡泡；返回 true 表示碰到危险线结束 */
function addRow() {
  for (let c = 0; c < COLS; c++) {
    if (grid[ROWS - 1][c] !== null) {
      gameOver("泡泡碰到危险线，本局结束");
      return true;
    }
  }
  const n = colorCount(level);
  const row = Array.from({ length: COLS }, () => Math.floor(Math.random() * n));
  grid.unshift(row);
  grid.pop();
  rowOffset = (rowOffset + 1) % 2;
  return false;
}

function levelClear() {
  if (level >= MAX_LEVEL) {
    finishToast("🫧", "恭喜闯过 999 关！", `最终得分 ${score}`, "关卡已达上限");
    recordBest("bestBubbleCat", MAX_LEVEL);
    AppStore.data.bubbleLevel = MAX_LEVEL;
    AppStore.save(AppStore.data, true);
    stopBubbleCat();
    return;
  }
  level += 1;
  target = targetOf(level);
  score = 0;
  remain = Math.min(90, remain + 8);
  AppStore.data.bubbleLevel = level;
  recordBest("bestBubbleCat", level);
  AppStore.save(AppStore.data, true);
  buildBoard(level);
  nextColor = randomColor();
  shotsSinceDrop = 0;
  updateText();
  draw();
  const tip = $id("bcTip");
  if (tip) tip.innerText = `第 ${level} 关，目标 ${target} 分，瞄准再发射`;
  toast(`🫧 进入第 ${level} 关，目标 ${target} 分`, 1800);
}

function gameOver(message) {
  if (!running) return;
  stopBubbleCat();
  const data = AppStore.data;
  data.totalGame = (data.totalGame || 0) + 1;
  data.totalBubbleCat = (data.totalBubbleCat || 0) + 1;
  recordBest("bestBubbleCat", level);
  data.bubbleLevel = Math.max(1, level);
  let reward = {};
  if (level < 10) reward = { grain: 3 };
  else if (level < 30) reward = { fruit: 2, cookie: 1 };
  else if (level < 60) reward = { cake: 1, milk: 1 };
  else reward = { cake: 1, milk: 2 };
  const rewardText = grantReward(reward);
  addExp(4 + level * 2);
  checkAchievements();
  AppStore.save(data, true);
  const tip = $id("bcTip");
  if (tip) tip.innerText = message || `时间到，本次到达第 ${level} 关`;
  soundGameEnd();
  finishToast("🫧", `泡泡闯关结束，到达第 ${level} 关`, `最高第 ${data.bestBubbleCat} 关`, rewardText);
  updateText();
  draw();
}

function resetLevel(lv) {
  level = Math.min(MAX_LEVEL, Math.max(1, lv));
  target = targetOf(level);
  score = 0;
  remain = 60;
  buildBoard(level);
  nextColor = randomColor();
  aim = -Math.PI / 2;
  shot = null;
  busy = false;
  shotsSinceDrop = 0;
  effects = [];
  floats = [];
  updateText();
  draw();
}

function startLoop() {
  if (raf) return;
  lastT = 0;
  raf = requestAnimationFrame(loop);
}

function loop(t) {
  if (!running) { raf = null; return; }
  const dt = Math.min(0.032, (lastT ? t - lastT : 16) / 1000);
  lastT = t;
  if (shot) updateShot(dt);
  updateEffects(dt);
  draw();
  raf = requestAnimationFrame(loop);
}

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * W / rect.width,
    y: (e.clientY - rect.top) * H / rect.height,
  };
}

function setAimTo(x, y) {
  const dx = x - CANNON.x;
  const dy = y - CANNON.y;
  let a = Math.atan2(dy, dx);
  const low = -Math.PI + 0.42;
  const high = -0.42;
  if (a > high) a = dx >= 0 ? high : low;
  if (a < low) a = low;
  aim = a;
  draw();
}

function shoot() {
  if (!running || shot || busy) return;
  shot = {
    x: CANNON.x + Math.cos(aim) * 32,
    y: CANNON.y + Math.sin(aim) * 32,
    vx: Math.cos(aim) * 520,
    vy: Math.sin(aim) * 520,
    color: nextColor,
  };
  nextColor = randomColor();
  soundGameHit();
}

export function openBubbleCatGame() {
  const modal = $id("bubbleCatModal");
  if (modal) modal.style.display = "flex";
  stopBubbleCat();
  resetLevel(AppStore.data.bubbleLevel || 1);
  const tip = $id("bcTip");
  if (tip) tip.innerText = "拖动瞄准，松手发射；3 个同色相连消除，达到目标过关";
  bindBubbleCatBoard();
  maybeShowGameHelp("bubblecat");
}

export function closeBubbleCatGame() {
  const modal = $id("bubbleCatModal");
  if (modal) modal.style.display = "none";
  stopBubbleCat();
}

export function stopBubbleCat() {
  running = false;
  busy = false;
  shot = null;
  aiming = false;
  if (timer) clearInterval(timer);
  timer = null;
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  setStartState(false);
  draw();
}

export function startBubbleCatGame() {
  const game = gameById("bubblecat");
  if (!beginGame(game)) return;
  stopBubbleCat();
  resetLevel(AppStore.data.bubbleLevel || 1);
  running = true;
  busy = false;
  nextColor = randomColor();
  const tip = $id("bcTip");
  if (tip) tip.innerText = "按住拖动瞄准，松手发射，3 个同色相连就能消除";
  setStartState(true);
  startLoop();
  timer = setInterval(() => {
    if (!running) return;
    remain -= 1;
    if (remain <= 0) {
      remain = 0;
      updateText();
      gameOver("时间到，本局结束");
      return;
    }
    updateText();
  }, 1000);
}

export function bindBubbleCatBoard() {
  canvas = $id("bcCanvas");
  if (!canvas) return;
  getCtx();
  if (!canvas.dataset.bound) {
    canvas.dataset.bound = "1";
    canvas.addEventListener("pointerdown", e => {
      if (!running) return;
      e.preventDefault();
      aiming = true;
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件没有真实指针 */ }
      }
      const p = pointerPos(e);
      setAimTo(p.x, p.y);
    });
    canvas.addEventListener("pointermove", e => {
      if (!aiming) return;
      e.preventDefault();
      const p = pointerPos(e);
      setAimTo(p.x, p.y);
    });
    const release = e => {
      if (!aiming) return;
      aiming = false;
      if (e.cancelable) e.preventDefault();
      shoot();
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", () => { aiming = false; });
  }
  if (!document.body.dataset.bcKeys) {
    document.body.dataset.bcKeys = "1";
    document.addEventListener("keydown", e => {
      const modal = $id("bubbleCatModal");
      if (!modal || modal.style.display !== "flex" || !running) return;
      if (e.key === "ArrowLeft") { aim = Math.max(-Math.PI + 0.42, aim - 0.08); draw(); e.preventDefault(); }
      if (e.key === "ArrowRight") { aim = Math.min(-0.42, aim + 0.08); draw(); e.preventDefault(); }
      if (e.key === " " || e.key === "ArrowUp") { shoot(); e.preventDefault(); }
    });
  }
}
