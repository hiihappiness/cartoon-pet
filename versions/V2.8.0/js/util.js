import { AppConfig } from './config.js?v=20261110.7';

let audioCtx = null;
let soundEnable = true;
try {
  soundEnable = localStorage.getItem("mushroomPetSound") !== "0";
} catch (e) {
  // 隐私模式禁用存储时保持默认开启，不影响启动
}

export function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    audioCtx = null;
  }
}

export function playTone(freq, dur, type = "sine", vol = 0.2) {
  if (!soundEnable || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {
    /* 音频不可用时静默跳过 */
  }
}

export function soundTap() { initAudio(); playTone(620, 0.12); }
export function soundFeed() { initAudio(); playTone(440, 0.15); setTimeout(() => playTone(520, 0.15), 80); }
export function soundLevelUp() {
  initAudio();
  playTone(520, 0.14);
  setTimeout(() => playTone(660, 0.14), 120);
  setTimeout(() => playTone(880, 0.22), 240);
}
export function soundGameHit() { initAudio(); playTone(800, 0.09, "square"); }
export function soundGameEnd() { initAudio(); playTone(580, 0.15); setTimeout(() => playTone(480, 0.15), 120); }
export function soundReward() { initAudio(); playTone(700, 0.15); setTimeout(() => playTone(840, 0.18), 100); }

export function isSoundOn() {
  return soundEnable;
}

export function setSoundEnabled(on) {
  soundEnable = !!on;
  try {
    localStorage.setItem("mushroomPetSound", soundEnable ? "1" : "0");
  } catch (e) {
    // 存储不可用时仅本次会话生效
  }
  syncSoundLabel();
}

export function toggleSound() {
  setSoundEnabled(!soundEnable);
  return soundEnable;
}

export function syncSoundLabel() {
  const els = document.querySelectorAll("[data-sound-label]");
  els.forEach(el => {
    el.innerText = soundEnable ? "🔊 音效开" : "🔇 音效关";
  });
}

export function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ================= 轻提示（替代阻塞式 alert） ================= */
let toastTimer = null;

export function toast(text, duration = 2200) {
  let wrap = document.getElementById("toastWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toastWrap";
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const item = document.createElement("div");
  item.className = "toast-item";
  item.innerText = text;
  wrap.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => {
      item.remove();
      // 最后一个提示消失后把容器也收掉，避免空 div 一直留在页面上
      if (wrap && !wrap.children.length && wrap.isConnected) {
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { if (wrap && !wrap.children.length) wrap.remove(); }, 500);
      }
    }, 300);
  }, duration);
}

/* 把 {grain:2, cookie:1} 这类奖励转成文案 */
export function formatRewardList(reward) {
  return Object.entries(reward || {}).map(([k, v]) => {
    const item = AppConfig.ITEM_CONFIG.find(x => x.id === k);
    return `${item ? item.icon + item.name : k}×${v}`;
  }).join(" ");
}

/**
 * v2.8 环形菜单圆心计算（纯函数，便于测试）
 * @param {{left:number,top:number,width:number,height:number}} rect 团子图片可视区域
 * @param {number} radius 展开半径
 * @param {number} half 按钮半宽
 * @param {number} vw 视口宽
 * @param {number} vh 视口高
 * @param {number} margin 边距
 * @returns {{x:number,y:number,fallbackX:boolean,fallbackY:boolean}} 圆心坐标
 */
export function computeRadialCenter(rect, radius, half, vw, vh, margin = 8) {
  const spread = radius + half;
  const desiredX = rect.left + rect.width / 2;
  const desiredY = rect.top + rect.height / 2 - 10;
  const minX = spread + margin;
  const maxX = vw - spread - margin;
  const minY = spread + margin;
  const maxY = vh - spread - margin;
  const fallbackX = minX > maxX;
  const fallbackY = minY > maxY;
  const cx = fallbackX ? vw / 2 : Math.min(Math.max(desiredX, minX), maxX);
  const cy = fallbackY ? vh / 2 : Math.min(Math.max(desiredY, minY), maxY);
  return { x: Math.round(cx), y: Math.round(cy), fallbackX, fallbackY };
}
