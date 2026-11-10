import { AppConfig } from './config.js?v=20261110.7';
import { toast } from './util.js?v=20261110.7';

const STORAGE_KEY = "mushroomPetData";
const CORRUPT_KEY = "mushroomPetData_corrupt";

let lastSaveAt = 0;
let pendingData = null;

export const AppStore = {
  data: null,
  defaultData: {
    dataVersion: 2,
    petName: "团子",
    level: 1,
    exp: 0,
    expNeed: 100,
    hunger: 80,
    mood: 80,
    lastActive: Date.now(),
    lastSettleTime: Date.now(),
    lastBoxGenTime: Date.now(),
    isPlaying: false,
    isNightAwake: false,
    nightAwakeEnd: 0,
    bag: {
      grain: 5, cookie: 3, fruit: 3, cake: 0, milk: 0,
      ball: 2, bell: 1, feather: 0, sweetPotion: 0
    },
    boxQueue: [],
    petTouchCount: 0,
    lastTouchTime: 0,
    gameCd: 0,
    feedGameCd: 0,
    whackGameCd: 0,
    memoryGameCd: 0,
    snakeGameCd: 0,
    bubbleCatGameCd: 0,
    // 合成工坊已下线，字段保留用于兼容旧存档
    mergeGameCd: 0,
    restEnd: 0,
    restCd: 0,
    maxCombo: 0,
    totalFeedGame: 0,
    totalWhack: 0,
    totalMemory: 0,
    memoryWins: 0,
    totalSnake: 0,
    totalBubbleCat: 0,
    bestFeed: 0,
    bestBubble: 0,
    bestWhack: 0,
    bestMemory: 0,
    bestSnake: 0,
    bestBubbleCat: 0,
    bubbleLevel: 1,
    totalFeed: 0,
    totalTouch: 0,
    totalGame: 0,
    totalExpGained: 0,
    nightCareCount: 0,
    openBoxCount: 0,
    buffUseCount: 0,
    itemCd: {},
    buff: { slowDecayEnd: 0 },
    signLastDate: "",
    signContinueDay: 0,
    signMonthGet: false,
    achieveDone: []
  },

  /** 首次启动或损坏重置 */
  freshData() {
    const d = JSON.parse(JSON.stringify(this.defaultData));
    d.lastActive = Date.now();
    d.lastSettleTime = Date.now();
    d.lastBoxGenTime = Date.now();
    return d;
  },

  /** 写入存档；默认节流，force=true 立即写 */
  save(data, force = false) {
    const now = Date.now();
    if (!force && now - lastSaveAt < AppConfig.CONFIG.saveInterval) {
      pendingData = data;
      return true;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      lastSaveAt = now;
      pendingData = null;
      return true;
    } catch (e) {
      // 无痕模式或配额满：不抛出，避免打断 2 秒心跳
      console.warn("存档写入失败，已暂时跳过：", e);
      return false;
    }
  },

  /** 页面隐藏/卸载前强制落盘 */
  flush() {
    if (pendingData) return this.save(pendingData, true);
    if (this.data) return this.save(this.data, true);
    return true;
  },

  /** 把外部对象（导入存档）补齐成合法数据结构 */
  normalize(obj) {
    const out = Object.assign(
      JSON.parse(JSON.stringify(this.defaultData)),
      (obj && typeof obj === "object") ? obj : {}
    );
    out.bag = Object.assign({}, this.defaultData.bag,
      (obj && typeof obj.bag === "object" && obj.bag) || {});
    out.itemCd = (obj && typeof obj.itemCd === "object" && obj.itemCd) || {};
    out.buff = Object.assign({}, this.defaultData.buff, (obj && typeof obj.buff === "object" && obj.buff) || {});
    out.boxQueue = Array.isArray(obj && obj.boxQueue) ? obj.boxQueue : [];
    out.achieveDone = (Array.isArray(obj && obj.achieveDone) ? obj.achieveDone : [])
      .filter(id => typeof id === "string");

    // 数值兜底：导入的存档/损坏数据可能是字符串、NaN、负数，
    // 直接参与运算会污染界面（如 expNeed=0 会让升级循环停不下来）
    const num = (v, def, min, max) => {
      if (v === null || v === undefined || v === "" || (typeof v === "string" && v.trim() === "")) return def;
      const n = Number(v);
      if (!Number.isFinite(n)) return def;
      return Math.min(max, Math.max(min, n));
    };
    out.level = Math.floor(num(out.level, 1, 1, 999));
    out.expNeed = Math.floor(num(out.expNeed, 100, 1, 99999));
    out.exp = Math.floor(num(out.exp, 0, 0, 99999));
    out.hunger = num(out.hunger, 80, 0, 100);
    out.mood = num(out.mood, 80, 0, 100);
    out.isPlaying = out.isPlaying === true;
    out.isNightAwake = out.isNightAwake === true;
    out.petName = typeof out.petName === "string" && out.petName.trim() ? out.petName.trim() : "团子";
    out.signLastDate = typeof out.signLastDate === "string" ? out.signLastDate : "";
    out.buff.slowDecayEnd = num(out.buff.slowDecayEnd, 0, 0, 1e15);
    out.lastTouchTime = num(out.lastTouchTime, 0, 0, 1e15);
    out.lastSettleTime = num(out.lastSettleTime, Date.now(), 0, 1e15);
    out.lastBoxGenTime = num(out.lastBoxGenTime, Date.now(), 0, 1e15);
    out.restEnd = num(out.restEnd, 0, 0, 1e15);
    out.restCd = num(out.restCd, 0, 0, 1e15);
    out.nightAwakeEnd = num(out.nightAwakeEnd, 0, 0, 1e15);
    out.lastActive = num(out.lastActive, Date.now(), 0, 1e15);
    ["gameCd", "feedGameCd", "whackGameCd", "memoryGameCd", "snakeGameCd", "bubbleCatGameCd"].forEach(k => {
      out[k] = num(out[k], 0, 0, 1e15);
    });
    // 计数类字段必须是数字，否则签到会算成 "3"+1="31"
    ["signContinueDay", "totalFeed", "totalTouch", "totalGame", "totalFeedGame",
      "totalWhack", "totalMemory", "memoryWins", "nightCareCount", "openBoxCount",
      "buffUseCount", "maxCombo", "petTouchCount", "totalExpGained", "lastCombo",
      "bestFeed", "bestBubble", "bestWhack", "bestMemory", "bestSnake", "bestBubbleCat",
      "totalSnake", "totalBubbleCat"].forEach(k => {
      out[k] = Math.floor(num(out[k], 0, 0, 1e9));
    });
    out.signMonthGet = out.signMonthGet === true;
    out.bubbleLevel = Math.floor(num(out.bubbleLevel, 1, 1, 999));
    out.boxQueue = out.boxQueue.filter(k => typeof k === "string").slice(-AppConfig.CONFIG.maxCacheBox);
    // 导入旧版本存档后统一升级到当前数据结构版本
    out.dataVersion = 2;

    AppConfig.ITEM_CONFIG.forEach(item => {
      out.bag[item.id] = Math.max(0, Math.floor(num(out.bag[item.id], 0, 0, 99999)));
      out.itemCd[item.id] = num(out.itemCd[item.id], 0, 0, 1e15);
    });
    return out;
  },

  load() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // 隐私模式/禁用存储：直接给一份内存档，避免启动就崩
      return this.freshData();
    }
    if (!raw) {
      const data = this.freshData();
      this.save(data, true);
      return data;
    }
    try {
      const parsed = JSON.parse(raw);
      const data = this.normalize(parsed);
      // 旧存档没有离线结算基准：从当前时间开始，不补扣
      if (typeof parsed.lastSettleTime === "undefined") data.lastSettleTime = Date.now();
      return data;
    } catch (e) {
      try { localStorage.setItem(CORRUPT_KEY, raw); } catch (err) { /* 备份失败忽略 */ }
      const data = this.freshData();
      this.save(data, true);
      setTimeout(() => toast("存档损坏，已重置；原数据备份在 " + CORRUPT_KEY, 4000), 400);
      return data;
    }
  }
};
