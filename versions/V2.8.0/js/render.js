import { AppConfig, versionLabel, buildLabel } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { progressText } from './achievements.js?v=20261110.7';
import { toast } from './util.js?v=20261110.7';

export let currentBackpackTab = "all";

/** 记录上一次渲染快照，只有变化的字段才写 DOM（v2.7 性能优化） */
const last = {
  name: null,
  level: null,
  expW: null,
  hungerW: null,
  moodW: null,
  night: null,
  buff: null,
  img: null,
  version: null
};

function setPetImage(name) {
  const petImg = document.getElementById("petImg");
  if (!petImg) return;
  const src = `./img/${name}.webp`;
  if (last.img === src) return;
  last.img = src;
  petImg.src = src;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** v2.8.1：数量写在按钮文字里，不再用会让人误点的红色角标 */
function setInline(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = text;
}

function updateBadges(data) {
  const bag = data.bag || {};
  const total = Object.values(bag).reduce((s, v) => s + (Number(v) || 0), 0);
  const foodTotal = AppConfig.ITEM_CONFIG
    .filter(i => i.type === "food")
    .reduce((s, i) => s + (Number(bag[i.id]) || 0), 0);
  const boxCount = (data.boxQueue || []).length;
  setInline("bagCount", total > 99 ? "99+" : String(total));
  setInline("feedCount", foodTotal > 99 ? "99+" : String(foodTotal));
  setInline("signState", data.signLastDate === todayStr() ? "已签" : "待签");
  setInline("boxCountText", boxCount > 99 ? "99+" : String(boxCount));
  const claimBtn = document.getElementById("btnClaimBox");
  if (claimBtn) {
    claimBtn.disabled = boxCount <= 0;
    claimBtn.style.opacity = boxCount <= 0 ? "0.55" : "1";
  }
}

export function renderMain() {
  const data = AppStore.data;
  const verShow = document.getElementById("verShow");
  const verBuild = document.getElementById("verBuild");
  const pageTitleSpan = document.querySelector("#pageTitle span");
  const levelEl = document.getElementById("level");
  const expBar = document.getElementById("expBar");
  const hungerBar = document.getElementById("hungerBar");
  const moodBar = document.getElementById("moodBar");
  const hungerVal = document.getElementById("hungerVal");
  const moodVal = document.getElementById("moodVal");
  const buffTip = document.getElementById("buffTip");
  if (!verShow || !pageTitleSpan || !levelEl || !hungerBar || !moodBar || !buffTip) {
    return;
  }

  if (last.version !== versionLabel()) {
    verShow.innerText = versionLabel();
    if (verBuild) verBuild.innerText = buildLabel();
    last.version = versionLabel();
  }
  if (data.petName !== last.name) {
    pageTitleSpan.innerText = data.petName;
    document.title = `${data.petName} · 蘑菇团子`;
    last.name = data.petName;
  }
  if (data.level !== last.level) {
    levelEl.innerText = data.level;
    last.level = data.level;
  }
  const expW = `${Math.round((data.exp / Math.max(1, data.expNeed || 1)) * 1000) / 10}%`;
  if (expBar && expW !== last.expW) {
    expBar.style.width = expW;
    last.expW = expW;
  }
  const hungerW = `${Math.round(data.hunger * 10) / 10}%`;
  if (hungerW !== last.hungerW) {
    hungerBar.style.width = hungerW;
    if (hungerVal) hungerVal.innerText = Math.round(data.hunger);
    last.hungerW = hungerW;
  }
  const moodW = `${Math.round(data.mood * 10) / 10}%`;
  if (moodW !== last.moodW) {
    moodBar.style.width = moodW;
    if (moodVal) moodVal.innerText = Math.round(data.mood);
    last.moodW = moodW;
  }
  const isNight = new Date().getHours() >= AppConfig.NIGHT_START ||
    new Date().getHours() < AppConfig.DAY_START;
  if (isNight !== last.night) {
    document.body.classList.toggle("night", isNight);
    last.night = isNight;
  }
  const now = Date.now();
  const resting = now < (data.restEnd || 0);
  let buffText = "";
  if (data.buff.slowDecayEnd > now) {
    const left = Math.ceil((data.buff.slowDecayEnd - now) / 1000 / 60);
    buffText = `✨衰减减缓buff，剩余${left}分钟`;
  }
  if (buffText !== last.buff) {
    buffTip.innerText = buffText;
    buffTip.style.display = buffText ? "block" : "none";
    last.buff = buffText;
  }

  // 图片只在状态变化时切换，避免每 2 秒重设 src
  let imgName = "normal";
  if (resting || (isNight && !data.isNightAwake)) imgName = "sleep";
  else if (data.hunger <= 15 || data.mood <= 15) imgName = "sad";
  else if (data.hunger <= 30) imgName = "hungry";        // 饿了优先于心情
  else if (data.mood < 20) imgName = "bored";
  else if (data.mood < 30) imgName = "shy";
  else if (data.mood < 60 && data.isPlaying) imgName = "play";
  else if (data.mood >= 85) imgName = "happy";
  setPetImage(imgName);
  const petBox = document.getElementById("petImgContainer");
  if (petBox) petBox.classList.toggle("sleeping", imgName === "sleep");
  updateBadges(data);
}

/** 背包：默认沿用当前标签，不再每次重置为「全部」 */
export function renderBackpack(activeTab) {
  const validTabs = ["all", "food", "toy", "potion", "achieve"];
  if (!activeTab || !validTabs.includes(activeTab)) activeTab = currentBackpackTab || "all";
  currentBackpackTab = activeTab;

  const data = AppStore.data;
  const wrap = document.getElementById("backpackList");
  const canClaimEl = document.getElementById("canClaim");
  if (!wrap) return;
  const tabs = ["all", "food", "toy", "potion", "achieve"];
  const tabNameMap = { all: "全部", food: "食物", toy: "玩具", potion: "药剂", achieve: "成就" };

  let html = `<div class="bp-tab-wrap">`;
  for (const t of tabs) {
    html += `<button class="bp-tab ${activeTab === t ? 'active' : ''}" data-tab="${t}">${tabNameMap[t]}</button>`;
  }
  html += `</div>`;

  if (activeTab === "achieve") {
    html += `<div class="achieve-wrap">`;
    for (const ach of AppConfig.ACHIEVE_LIST) {
      const done = data.achieveDone.includes(ach.id);
      const rewardText = Object.entries(ach.reward).map(([k, v]) => {
        const item = AppConfig.ITEM_CONFIG.find(x => x.id === k);
        return `${item ? item.name : k}×${v}`;
      }).join(" ");
      html += `
      <div class="achieve-card ${done ? 'done' : 'lock'}">
        <div class="achieve-name">${ach.name} ${done ? '✅' : '🔒'}</div>
        <div class="achieve-desc">${ach.desc}</div>
        <div class="achieve-progress">进度：${progressText(ach, data)}｜奖励：${rewardText}</div>
      </div>`;
    }
    html += `</div>`;
  } else {
    html += `<div class="bp-items-wrap">`;
    const itemList = activeTab === "all"
      ? [...AppConfig.ITEM_CONFIG]
      : AppConfig.ITEM_CONFIG.filter(i => i.type === activeTab);
    if (itemList.length === 0) {
      html += `<div style="grid-column:1/-1;text-align:center;padding:24px;color:#888;">暂无道具</div>`;
    }
    const now = Date.now();
    for (const item of itemList) {
      const num = data.bag[item.id] || 0;
      const cdEnd = data.itemCd?.[item.id] ?? 0;
      const inCoolDown = cdEnd > now;
      const canUse = num > 0 && !inCoolDown;
      let tagColor = "#d84444";
      if (item.type === "toy") tagColor = "#348ede";
      if (item.type === "potion") tagColor = "#9b59b6";
      let coolText = "";
      if (inCoolDown) {
        const remainSec = Math.ceil((cdEnd - now) / 1000);
        coolText = `<div class="item-cooltip">冷却 ${remainSec}s</div>`;
      }
      html += `
      <div class="item-card ${canUse ? 'can-use' : 'disabled'}" data-id="${item.id}">
        <div class="item-name" style="color:${tagColor}">[${item.tag}] ${item.name}</div>
        <div class="item-num">×${num}</div>
        ${coolText}
        <div class="item-tooltip">${item.desc}</div>
      </div>`;
    }
    html += `</div>`;
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll(".bp-tab").forEach(tab => {
    tab.onclick = () => renderBackpack(tab.dataset.tab);
  });
  if (canClaimEl) canClaimEl.innerText = data.boxQueue.length;
  window.dispatchEvent(new CustomEvent("backpack-render-finish"));
}

/** 小游戏中心：卡片上的冷却与最高分每次打开时刷新 */
export function renderGameHub() {
  const wrap = document.getElementById("gameHubList");
  if (!wrap) return;
  const data = AppStore.data;
  const now = Date.now();
  wrap.innerHTML = AppConfig.GAMES.map(g => {
    const left = Math.ceil(((data[g.cdKey] || 0) - now) / 1000);
    const cooling = left > 0;
    const best = data[g.bestKey] || 0;
    return `
      <div class="game-card ${cooling ? 'cooling' : ''}" data-game="${g.id}">
        <div class="game-icon icon-${g.color}">${g.icon}</div>
        <div class="game-info">
          <div class="game-name">${g.name}</div>
          <div class="game-desc">${g.desc}</div>
          <div class="game-meta">最高 ${best}${g.unit}${cooling ? `｜冷却 ${left}s` : "｜可开始"}</div>
        </div>
      </div>`;
  }).join("");
  wrap.querySelectorAll(".game-card").forEach(card => {
    card.onclick = () => {
      const id = card.dataset.game;
      const g = AppConfig.GAMES.find(x => x.id === id);
      const left = Math.ceil(((data[g.cdKey] || 0) - Date.now()) / 1000);
      if (left > 0) {
        toast(`${g.icon}${g.name}冷却中，还要 ${left} 秒`, 2200);
        return;
      }
      window.dispatchEvent(new CustomEvent("open-game", { detail: { id } }));
    };
  });
}

export function showTalk(text) {
  const bubble = document.getElementById("talkBubble");
  if (!bubble) return;
  bubble.innerText = text;
  bubble.style.opacity = "1";
  clearTimeout(bubble._hideTimer);
  bubble._hideTimer = setTimeout(() => {
    bubble.style.opacity = "0";
  }, 1800);
}

export function setStatusText(txt) {
  const el = document.getElementById("statusText");
  if (el && el.innerText !== txt) el.innerText = txt;
}

/** v2.8：签到面板（7 天连签 + 今日状态 + 奖励预览） */
export function renderSignPanel() {
  const strip = document.getElementById("signStrip");
  const hint = document.getElementById("signHint");
  const btn = document.getElementById("btnDoSign");
  if (!strip) return;

  const data = AppStore.data;
  const today = todayStr();
  const yd = new Date();
  yd.setDate(yd.getDate() - 1);
  const yesterday = `${yd.getFullYear()}-${String(yd.getMonth() + 1).padStart(2, "0")}-${String(yd.getDate()).padStart(2, "0")}`;

  const signed = data.signLastDate === today;
  const streak = data.signContinueDay || 0;
  const continued = data.signLastDate === yesterday;
  const nextDay = signed ? 0 : (continued ? streak + 1 : 1);
  const showDay = Math.min(nextDay || 7, 7);

  const rewardLabel = d => {
    if (d === 1) return "🌾×3";
    if (d === 3) return "🍪×2 🥛×1";
    if (d === 7) return "🍰×2 🔔×1";
    return "经验+10";
  };

  let html = "";
  for (let d = 1; d <= 7; d++) {
    let state = "lock";
    // 已签过：今天及以前的档位都算完成；未签但连签未断：昨天以前的档位也应显示完成
    if (signed && d <= Math.min(streak, 7)) state = "done";
    else if (!signed && continued && d <= Math.min(streak, 7)) state = "done";
    else if (!signed && d === showDay) state = "today";
    const mark = state === "done" ? "✅ " : (state === "today" ? "👉 " : "");
    html += `
      <div class="sign-day ${state}">
        <div class="sd-title">${mark}第${d}天</div>
        <div class="sd-reward">${rewardLabel(d)}</div>
      </div>`;
  }
  strip.innerHTML = html;

  if (hint) {
    if (signed) hint.innerText = `今天已签到，已连续 ${streak} 天${streak >= 7 ? "，明天继续～" : ""}`;
    else if (nextDay > 7) hint.innerText = `连续签到 ${streak} 天，今天继续领第 7 档奖励`;
    else hint.innerText = `连续签到 ${streak} 天，今天签到领第 ${nextDay} 天奖励`;
  }
  if (btn) {
    btn.disabled = signed;
    btn.innerText = signed ? "今天已签到" : "立即签到";
  }
}
