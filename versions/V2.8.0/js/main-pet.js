import { AppConfig } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { soundFeed, soundLevelUp, soundTap, getTodayStr, toast } from './util.js?v=20261110.7';
import { renderMain, showTalk, setStatusText, renderSignPanel } from './render.js?v=20261110.7';
import { checkAchievements } from './achievements.js?v=20261110.7';

function isNightNow() {
  const h = new Date().getHours();
  return h >= AppConfig.NIGHT_START || h < AppConfig.DAY_START;
}

/* ================= 启动 / 离线结算 ================= */
/**
 * 关掉页面再回来时，按真实流逝时间补算一点消耗：
 * 最多补 2 小时、单次最多掉 30 点、保底 20，避免“挂机完全无成本”，也不至于回来就饿死。
 */
export function settleOffline() {
  const data = AppStore.data;
  const now = Date.now();
  const last = data.lastSettleTime || now;
  const elapsed = Math.min(now - last, AppConfig.CONFIG.offlineMaxMs);
  if (elapsed < 60 * 1000) {
    data.lastSettleTime = now;
    return 0;
  }
  const lvlRate = 1 + (data.level - 1) * AppConfig.CONFIG.levelConsumeRate;
  // 基础衰减按 2 秒一格，换算成每秒；离线按 40% 强度补算
  let drop = (elapsed / 1000) * (AppConfig.CONFIG.baseDecay / 2) * 0.4 * lvlRate;
  drop = Math.min(drop, AppConfig.CONFIG.offlineMaxDrop);
  const floor = AppConfig.CONFIG.offlineFloor;
  // 「保底 20」只约束离线扣减，不能把本来就低于 20 的数值反向拉高
  data.hunger = data.hunger <= floor ? Math.max(0, data.hunger - drop) : Math.max(floor, data.hunger - drop);
  data.mood = data.mood <= floor ? Math.max(0, data.mood - drop) : Math.max(floor, data.mood - drop);
  data.lastSettleTime = now;
  AppStore.save(data, true);
  return Math.round(drop);
}

/* ================= 每 2 秒主循环 ================= */
export function petTick() {
  const data = AppStore.data;
  const now = Date.now();
  if (data.isNightAwake && now > data.nightAwakeEnd) {
    data.isNightAwake = false;
  }
  const resting = now < (data.restEnd || 0);
  if (!resting) {
    const isNight = isNightNow();
    // 夜间只乘一次 0.2（v2.6 曾重复相乘，夜里几乎不掉）
    let rate = AppConfig.CONFIG.baseDecay;
    if (isNight && !data.isNightAwake) rate *= AppConfig.CONFIG.nightRate;
    if (data.buff.slowDecayEnd > now) rate *= 0.5;
    const lvlRate = 1 + (data.level - 1) * AppConfig.CONFIG.levelConsumeRate;
    let moodRate = 1;
    if (data.mood > 80) moodRate = AppConfig.CONFIG.happyExtraConsume;
    else if (data.mood < 20) moodRate = AppConfig.CONFIG.lowMoodConsume;
    const sub = rate * lvlRate * moodRate;
    data.hunger = Math.max(0, data.hunger - sub);
    data.mood = Math.max(0, data.mood - sub);
  }
  genBoxQueue();

  // 每分钟左右推进一次离线结算基准，避免异常退出后重复结算
  if (now - (data.lastSettleTime || 0) > 60 * 1000) data.lastSettleTime = now;

  if (resting) {
    const left = Math.ceil((data.restEnd - now) / 1000);
    setStatusText(`团子正在打盹休息，${left}秒后醒来`);
  } else if (isNightNow() && !data.isNightAwake) {
    setStatusText("团子睡着了，消耗变慢");
  } else {
    setStatusText("团子乖乖陪着你~");
  }
  AppStore.save(data);
  renderMain();
}

/** 宝箱：固定 30 秒一个，离线最多补 8 小时；这里不再单独写存档，交给心跳统一节流保存 */
function genBoxQueue() {
  const data = AppStore.data;
  const now = Date.now();
  const maxBox = AppConfig.CONFIG.maxCacheBox;
  if (data.boxQueue.length >= maxBox) {
    data.lastBoxGenTime = now;
    return;
  }
  // 系统时间被往回拨时 now - lastBoxGenTime 会是负数，不修正就永远补不出箱子
  if (data.lastBoxGenTime > now) data.lastBoxGenTime = now;
  const pass = Math.min(now - data.lastBoxGenTime, 8 * 3600 * 1000);
  const BOX_INTERVAL = 30 * 1000;
  let diff = pass;
  while (data.boxQueue.length < maxBox && diff >= BOX_INTERVAL) {
    const pool = AppConfig.BOX_CONFIG;
    const totalWeight = pool.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * totalWeight;
    let selected = pool[0];
    for (const b of pool) {
      r -= b.weight;
      if (r <= 0) { selected = b; break; }
    }
    data.boxQueue.push(selected.key);
    data.lastBoxGenTime += BOX_INTERVAL;
    diff -= BOX_INTERVAL;
  }
}

/* ================= 经验与升级（公用） ================= */
export function addExp(amount) {
  const data = AppStore.data;
  if (!amount || amount <= 0) return 0;
  // 兜底：旧存档/导入存档的 expNeed 可能为 0 或负数，会让下面 while 变成死循环
  if (!Number.isFinite(data.expNeed) || data.expNeed < 1) data.expNeed = 100;
  data.exp += amount;
  data.totalExpGained += amount;
  let levels = 0;
  while (data.exp >= data.expNeed) {
    data.exp -= data.expNeed;
    data.level += 1;
    data.expNeed = Math.max(1, Math.floor(data.expNeed * 1.35));
    levels += 1;
  }
  if (levels > 0) {
    soundLevelUp();
    if (window.playPetAnimation) window.playPetAnimation("levelup-anim", 600);
    showTalk(`🎉升级啦！Lv.${data.level}`);
    checkAchievements();
    if (data.level % 5 === 0) toast(`🎉 升级！当前等级 Lv.${data.level}`, 2600);
  }
  return levels;
}

/* ================= 分区抚摸 + 连击 ================= */
export function touchPet(zone = "body") {
  const data = AppStore.data;
  const now = Date.now();
  const cfg = AppConfig.CONFIG;
  const last = data.lastTouchTime || 0;
  if (now - last < cfg.touchCd) {
    return { skipped: true, combo: data.lastCombo || 1 };
  }

  const inCombo = now - last < cfg.comboWindow;
  const combo = inCombo ? Math.min((data.lastCombo || 1) + 1, cfg.comboMax) : 1;
  data.lastCombo = combo;
  if (combo > (data.maxCombo || 0)) data.maxCombo = combo;

  data.lastTouchTime = now;
  data.totalTouch += 1;
  data.petTouchCount = (data.petTouchCount || 0) + 1;

  // v2.7 下调单次收益：基础 +3 心情，每 5 连击 +1，上限 +8
  const baseMood = zone === "head" ? 3 : 2;
  const moodGain = Math.min(8, baseMood + Math.floor(combo / 5));
  data.mood = Math.min(100, data.mood + moodGain);

  let expGain = 1;
  if (combo >= 20) expGain += 1;
  addExp(expGain);

  if (isNightNow() && !data.isNightAwake) {
    data.isNightAwake = true;
    data.nightAwakeEnd = now + AppConfig.CONFIG.nightWakeDuration;
    data.nightCareCount += 1;
    showTalk("唔…被你叫醒啦🥺");
    if (window.playPetAnimation) window.playPetAnimation("wake-anim", 500);
  } else if (zone === "head") {
    const list = AppConfig.TOUCH_TALK.head;
    showTalk(list[Math.floor(Math.random() * list.length)]);
  } else if (zone === "feet") {
    const list = AppConfig.TOUCH_TALK.feet;
    showTalk(list[Math.floor(Math.random() * list.length)]);
  } else {
    const list = AppConfig.TOUCH_TALK.body;
    showTalk(list[Math.floor(Math.random() * list.length)]);
  }

  let dropped = null;
  const dropRate = Math.min(0.25, 0.08 + combo * 0.008);
  if (Math.random() < dropRate) {
    const dropPool = [
      { id: "grain", count: 1 },
      { id: "fruit", count: 1 },
      { id: "cookie", count: 1 },
      { id: "milk", count: 1 }
    ];
    dropped = dropPool[Math.floor(Math.random() * dropPool.length)];
    data.bag[dropped.id] = (data.bag[dropped.id] || 0) + dropped.count;
  }
  soundTap();
  checkAchievements();
  AppStore.save(data, true);
  renderMain();
  return { combo, moodGain, dropped, zone };
}

/* ================= 休息（打盹） ================= */
export function restPet() {
  const data = AppStore.data;
  const now = Date.now();
  if (now < (data.restEnd || 0)) {
    showTalk("已经在休息啦~");
    toast("团子正在打盹，等它醒来吧", 2000);
    return;
  }
  if (now < (data.restCd || 0)) {
    const left = Math.ceil((data.restCd - now) / 1000);
    showTalk("刚睡醒，还不困呢~");
    toast(`休息冷却中，还要 ${left} 秒`, 2200);
    return;
  }
  data.restEnd = now + AppConfig.CONFIG.restDuration;
  data.restCd = data.restEnd + AppConfig.CONFIG.restCd;
  data.mood = Math.min(100, data.mood + AppConfig.CONFIG.restMoodGain);
  data.totalRest = (data.totalRest || 0) + 1;
  showTalk("打个小盹儿…zzz");
  if (window.playPetAnimation) window.playPetAnimation("sleep-anim", 500);
  AppStore.save(data, true);
  renderMain();
}

export function restLeft() {
  return Math.ceil(((AppStore.data.restEnd || 0) - Date.now()) / 1000);
}

/* ================= 使用道具 ================= */
export function useItem(itemId) {
  const data = AppStore.data;
  const item = AppConfig.ITEM_CONFIG.find(x => x.id === itemId);
  if (!item || (data.bag[itemId] || 0) <= 0) {
    toast("这个道具已经用完啦", 1800);
    return false;
  }
  const now = Date.now();
  const cdEnd = data.itemCd[itemId] || 0;
  if (cdEnd > now) {
    const left = Math.ceil((cdEnd - now) / 1000);
    showTalk(`${item.icon}${item.name}冷却中，还要${left}秒`);
    toast(`${item.icon} ${item.name} 冷却中，还要 ${left} 秒`, 2000);
    return false;
  }
  if (item.type === "food" && data.hunger >= AppConfig.CONFIG.fullHungerLimit) {
    showTalk("已经吃得饱饱的啦~");
    toast("团子已经很饱了，晚点再喂吧", 2200);
    return false;
  }
  data.bag[itemId] -= 1;
  if (item.type === "food") data.totalFeed += 1;
  if (item.type === "toy") {
    if (isNightNow() && !data.isNightAwake) {
      data.isNightAwake = true;
      data.nightAwakeEnd = now + AppConfig.CONFIG.nightWakeDuration;
      data.nightCareCount += 1;
    }
  }
  if (item.cd > 0) data.itemCd[itemId] = now + item.cd;
  data.hunger = Math.min(100, data.hunger + item.addHunger);
  data.mood = Math.min(100, data.mood + item.addMood);
  if (item.type === "food") {
    soundFeed();
    if (window.playEatAnimation) window.playEatAnimation(item.icon || "🍎");
    else if (window.playPetAnimation) window.playPetAnimation("chew-anim", 700);
  } else if (item.type === "toy") {
    if (window.playPetAnimation) window.playPetAnimation("hop-anim", 600);
  }
  if (item.buff === "slowDecay") {
    data.buff.slowDecayEnd = now + item.buffTime;
    data.buffUseCount += 1;
    checkAchievements();
    toast(`✨ ${item.name}生效！${Math.round(item.buffTime / 60000)} 分钟衰减减半`, 2600);
  } else {
    let expGain = item.addExp || 0;
    if (data.mood > 85) expGain *= AppConfig.CONFIG.happyExpRate;
    if (data.mood < 25) expGain *= AppConfig.CONFIG.sadExpRate;
    addExp(Math.round(expGain));
  }
  checkAchievements();
  AppStore.save(data, true);
  renderMain();
  return true;
}

/* ================= 宝箱 ================= */
export function claimAllBox() {
  const data = AppStore.data;
  const opened = data.boxQueue.length;
  if (opened <= 0) {
    toast("暂时没有宝箱，再等等吧", 2000);
    return;
  }
  const rewardMap = {};
  for (const boxKey of [...data.boxQueue]) {
    const boxCfg = AppConfig.BOX_CONFIG.find(b => b.key === boxKey);
    if (!boxCfg) continue;
    for (const [k, range] of Object.entries(boxCfg.reward)) {
      const min = range[0], max = range[1];
      const num = min + Math.floor(Math.random() * (max - min + 1));
      if (num > 0) rewardMap[k] = (rewardMap[k] || 0) + num;
    }
  }
  data.boxQueue = [];
  data.openBoxCount += opened;
  for (const [k, v] of Object.entries(rewardMap)) {
    data.bag[k] = (data.bag[k] || 0) + v;
  }
  checkAchievements();
  AppStore.save(data, true);
  renderMain();
  const showStr = Object.entries(rewardMap).map(([k, v]) => {
    const it = AppConfig.ITEM_CONFIG.find(x => x.id === k);
    return `${it ? it.name : k}×${v}`;
  }).join(" ");
  toast(`🎁 宝箱领取完成（${opened} 个）：${showStr}`, 3200);
}

/* ================= 签到 ================= */
export function doSign() {
  const data = AppStore.data;
  const today = getTodayStr();
  if (data.signLastDate === today) {
    toast("今天已经签到过啦", 1800);
    return;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  data.signContinueDay = data.signLastDate === yStr ? data.signContinueDay + 1 : 1;
  // 断签后开启新一轮连签，28 天的月度奖励也应重新可领
  if (data.signContinueDay === 1) data.signMonthGet = false;
  data.signLastDate = today;
  let reward = {};
  if (data.signContinueDay >= 28 && !data.signMonthGet) {
    Object.assign(reward, AppConfig.SIGN_CONFIG.month);
    data.signMonthGet = true;
  } else if (data.signContinueDay >= 7) {
    Object.assign(reward, AppConfig.SIGN_CONFIG.day7);
  } else if (data.signContinueDay >= 3) {
    Object.assign(reward, AppConfig.SIGN_CONFIG.day3);
  } else {
    Object.assign(reward, AppConfig.SIGN_CONFIG.day1);
  }
  for (const [k, v] of Object.entries(reward)) {
    data.bag[k] = (data.bag[k] || 0) + v;
  }
  addExp(10);
  checkAchievements();
  AppStore.save(data, true);
  renderMain();
  renderSignPanel();
  const showStr = Object.entries(reward).map(([k, v]) => {
    const it = AppConfig.ITEM_CONFIG.find(x => x.id === k);
    return `${it ? it.name : k}×${v}`;
  }).join(" ");
  toast(`✅ 签到成功，连续 ${data.signContinueDay} 天｜${showStr}`, 3000);
}

/** 兼容旧调用名 */
export const checkAchievement = checkAchievements;

/* ================= 其它 ================= */
export function renamePet() {
  const data = AppStore.data;
  const newName = prompt("给你的团子起新名字：", data.petName);
  if (!newName) return;
  const trim = newName.trim();
  if (trim.length === 0) return;
  if (trim.length > 12) {
    toast("名字最多 12 个字哦", 2000);
    return;
  }
  data.petName = trim;
  AppStore.save(data, true);
  renderMain();
  toast(`✅ 以后就叫你「${trim}」啦`, 2000);
}

export function exportSave() {
  const data = AppStore.data;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mushroom-${getTodayStr()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("📥 存档已导出", 2000);
}

export function importSave(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const obj = JSON.parse(e.target.result);
      if (!obj || typeof obj !== "object" || !obj.bag) throw new Error("invalid save");
      const data = AppStore.normalize(obj);
      AppStore.save(data, true);
      AppStore.data = data;
      toast("✅ 存档导入成功，正在重载…", 2000);
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      toast("❌ 存档格式不正确，导入失败", 2600);
    }
  };
  reader.readAsText(file);
}
