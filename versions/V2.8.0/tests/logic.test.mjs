/**
 * 蘑菇团子 v2.8 逻辑回归测试（Node 直接跑，无需浏览器）
 *   node tests/logic.test.mjs
 * 覆盖：成就进度表、游戏冷却、触摸/休息冷却、离线结算、存档节流、夜间衰减、
 *       环形菜单圆心、脏数据兜底、签到连签与月奖重置、版本号比较。
 */

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  clear: () => store.clear()
};

function makeEl() {
  return {
    style: {},
    dataset: {},
    children: [],
    innerText: "",
    textContent: "",
    src: "",
    offsetWidth: 260,
    offsetHeight: 260,
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => this._s.add(x)); },
      remove(...c) { c.forEach(x => this._s.delete(x)); },
      contains(c) { return this._s.has(c); },
      toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); }
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(c) { this.children.push(c); return c; },
    remove() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest() { return null; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 260, height: 260 }; },
    naturalWidth: 512,
    naturalHeight: 512,
    getContext() { return null; }
  };
}

const els = new Map();
globalThis.document = {
  getElementById(id) {
    if (!els.has(id)) els.set(id, makeEl());
    return els.get(id);
  },
  querySelector() { return makeEl(); },
  querySelectorAll() { return []; },
  createElement() { return makeEl(); },
  addEventListener() {},
  body: {
    classList: { toggle() {}, add() {}, remove() {} },
    appendChild(c) { return c; },
    removeChild() {}
  },
  hidden: false
};
globalThis.requestAnimationFrame = fn => setTimeout(() => fn(0), 0);
globalThis.cancelAnimationFrame = id => clearTimeout(id);
globalThis.window = {
  addEventListener() {},
  playPetAnimation() {},
  AudioContext: function () {
    return {
      createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: {} }),
      createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
      destination: {},
      currentTime: 0
    };
  },
  innerWidth: 390,
  innerHeight: 844
};
Object.defineProperty(globalThis, "navigator", { value: { vibrate() {} }, configurable: true });

const results = [];
function check(name, cond, extra = "") {
  results.push({ name, ok: !!cond, extra });
}

const { AppConfig } = await import("../js/config.js?v=20261110.7");
const { AppStore } = await import("../js/store.js?v=20261110.7");
const { checkAchievements, progressOf } = await import("../js/achievements.js?v=20261110.7");
const { touchPet, restPet, settleOffline, petTick, addExp, doSign } = await import("../js/main-pet.js?v=20261110.7");
const { beginGame, cooldownLeft, grantReward, gameById } = await import("../js/game-common.js?v=20261110.7");
const { computeRadialCenter } = await import("../js/util.js?v=20261110.7");

// 初始化存档
AppStore.data = AppStore.freshData();

// 1. 成就：nightCare 类型必须可解锁（v2.6 的老 bug）
AppStore.data.nightCareCount = 1;
checkAchievements();
check("nightCare 成就可解锁", AppStore.data.achieveDone.includes("nightCare"));
const ach = AppConfig.ACHIEVE_LIST.find(a => a.id === "nightCare");
check("nightCare 进度可显示", progressOf(ach) === 1);

// 2. 游戏冷却：开始时就写入，第二次开始被拒绝
const feed = gameById("feed");
check("首次开始成功", beginGame(feed) === true);
check("冷却期间无法重开", beginGame(feed) === false);
check("冷却已写入存档", cooldownLeft(feed.cdKey) > 0);

// 3. 4 个游戏都配置了冷却键
for (const g of AppConfig.GAMES) {
  check(`游戏 ${g.id} 有冷却键`, typeof g.cdKey === "string" && g.cdKey.length > 0);
}

// 4. 触摸冷却 + 连击
AppStore.data.mood = 50;
AppStore.data.lastTouchTime = 0;
AppStore.data.lastCombo = 0;
const t1 = touchPet("head");
check("首次抚摸未跳过", !t1.skipped && t1.combo === 1);
const t2 = touchPet("head");
check("冷却内抚摸被忽略", t2.skipped === true);
AppStore.data.lastTouchTime = Date.now() - 600;
const t3 = touchPet("body");
check("冷却后抚摸生效", !t3.skipped);

// 5. 休息冷却
AppStore.data.restEnd = 0;
AppStore.data.restCd = 0;
restPet();
check("进入休息", AppStore.data.restEnd > Date.now());
const restCdBefore = AppStore.data.restCd;
AppStore.data.restEnd = Date.now();
restPet();
check("休息后进入冷却", AppStore.data.restCd === restCdBefore && AppStore.data.restCd > Date.now());

// 6. 离线结算：最多掉 30 点，保底 20
AppStore.data.hunger = 80;
AppStore.data.mood = 80;
AppStore.data.lastSettleTime = Date.now() - 6 * 3600 * 1000;
settleOffline();
check("离线饱食不低于保底", AppStore.data.hunger >= AppConfig.CONFIG.offlineFloor);
check("离线单次最多掉 30", 80 - AppStore.data.hunger <= AppConfig.CONFIG.offlineMaxDrop + 0.01);

// 7. 夜间衰减只乘一次（0.2）
AppStore.data = AppStore.freshData();
AppStore.data.hunger = 80;
AppStore.data.mood = 50;
AppStore.data.level = 1;
AppStore.data.buff = { slowDecayEnd: 0 };
AppStore.data.restEnd = 0;
const nowH = new Date().getHours();
petTick();
let drop = 80 - AppStore.data.hunger;
check("单次衰减量在合理范围", drop > 0 && drop <= AppConfig.CONFIG.baseDecay * 1.05,
  `drop=${drop.toFixed(3)} hunger=${AppStore.data.hunger} h=${nowH}`);

// 8. 存档节流：8 秒内第二次写入不落盘，flush 立即落盘
const s = AppStore.freshData();
s.petName = "节流测试";
AppStore.save(s, true);
const raw1 = localStorage.getItem("mushroomPetData");
AppStore.save(s, false); // 节流窗口内
const raw2 = localStorage.getItem("mushroomPetData");
check("节流窗口内不写盘", raw1 === raw2);
AppStore.flush();
check("flush 后落盘", localStorage.getItem("mushroomPetData").includes("mushroomPetData") === false &&
  localStorage.getItem("mushroomPetData").includes("节流测试"));

// 9. 升级与经验
AppStore.data = AppStore.freshData();
const lv0 = AppStore.data.level;
addExp(1200);
check("1200 经验可升级", AppStore.data.level > lv0);

// 10. 奖励发放与背包兜底（比较增量，避免成就奖励干扰）
AppStore.data = AppStore.freshData();
const before = { cake: AppStore.data.bag.cake, grain: AppStore.data.bag.grain };
const r = grantReward({ cake: 2, grain: 5 });
check("奖励正确入包",
  AppStore.data.bag.cake === before.cake + 2 && AppStore.data.bag.grain === before.grain + 5,
  `cake=${AppStore.data.bag.cake} grain=${AppStore.data.bag.grain}`);
check("奖励文案非空", typeof r === "string" && r.length > 0);

// 11. 环形菜单圆心：空间足够时落在团子中心；窄屏/边缘时被钳制且整圈不出屏
const petRect = { left: 62, top: 300, width: 265, height: 265 };
const roomy = computeRadialCenter(petRect, 150, 37, 390, 844);
check("圆心对齐团子中心", roomy.x === Math.round(62 + 265 / 2) && roomy.y === Math.round(300 + 265 / 2 - 10),
  `x=${roomy.x} y=${roomy.y}`);
const edge = computeRadialCenter({ left: 0, top: 0, width: 100, height: 100 }, 150, 37, 390, 844);
check("边缘圆心被钳制在视口内", edge.x >= 150 + 37 + 8 && edge.y >= 150 + 37 + 8,
  `x=${edge.x} y=${edge.y}`);
const narrow = computeRadialCenter(petRect, 150, 37, 300, 300);
check("放不下整圈时退化为屏幕中心", narrow.x === 150 && narrow.y === 150 && narrow.fallbackX && narrow.fallbackY,
  `x=${narrow.x} y=${narrow.y}`);
check("圆心为整数像素", Number.isInteger(roomy.x) && Number.isInteger(roomy.y));

// 12. 导入存档的脏数据兜底：字符串/NaN/越界值不能污染运行状态
const dirty = AppStore.normalize({
  hunger: "abc", mood: 999, expNeed: 0, level: 0,
  bag: { grain: "abc", cake: -3 },
  itemCd: "oops",
  boxQueue: [1, "bronze", null]
});
check("非法饱食回落到默认值", dirty.hunger === 80, `hunger=${dirty.hunger}`);
check("心情被钳制在 100 以内", dirty.mood === 100, `mood=${dirty.mood}`);
check("expNeed 不会为 0", dirty.expNeed >= 1, `expNeed=${dirty.expNeed}`);
check("等级至少为 1", dirty.level >= 1, `level=${dirty.level}`);
check("道具数量非负且为整数", dirty.bag.cake === 0 && dirty.bag.grain === 0,
  `cake=${dirty.bag.cake} grain=${dirty.bag.grain}`);
check("冷却表被纠正为对象", typeof dirty.itemCd === "object" && dirty.itemCd !== "null");
check("宝箱队列只保留字符串", dirty.boxQueue.length === 1 && dirty.boxQueue[0] === "bronze",
  JSON.stringify(dirty.boxQueue));

const streaky = AppStore.normalize({ signContinueDay: "3", dataVersion: 1, totalFeed: "abc" });
check("签到天数被纠正为数字", streaky.signContinueDay === 3 && typeof streaky.signContinueDay === "number",
  `signContinueDay=${streaky.signContinueDay} type=${typeof streaky.signContinueDay}`);
check("旧存档升级到 dataVersion 2", streaky.dataVersion === 2);
check("计数脏值归零", streaky.totalFeed === 0, `totalFeed=${streaky.totalFeed}`);

// 13. expNeed=0 时 addExp 不能死循环
AppStore.data = AppStore.freshData();
AppStore.data.expNeed = 0;
AppStore.data.exp = 150;
const lvBefore = AppStore.data.level;
addExp(10);
check("expNeed 异常时仍能升级且不卡死",
  AppStore.data.level > lvBefore && AppStore.data.expNeed >= 1,
  `level=${AppStore.data.level} need=${AppStore.data.expNeed}`);

// 14. 离线结算只扣不补：低于保底时不能被「保底」反向加血
AppStore.data = AppStore.freshData();
AppStore.data.hunger = 10;
AppStore.data.mood = 5;
AppStore.data.lastSettleTime = Date.now() - 2 * 3600 * 1000;
settleOffline();
check("离线结算不会把低数值拉高", AppStore.data.hunger <= 10 && AppStore.data.mood <= 5,
  `hunger=${AppStore.data.hunger} mood=${AppStore.data.mood}`);

// 15. build 号按数字比较：20261110.10 必须大于 20261110.9
const { buildNumber } = await import("../js/pwa.js");
check("build 号按数字比较", buildNumber("20261110.10") > buildNumber("20261110.9"),
  `10=${buildNumber("20261110.10")} 9=${buildNumber("20261110.9")}`);

// 16. 断签后连签归 1，且 28 天月奖重新可领
function dayStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
AppStore.data = AppStore.freshData();
AppStore.data.signLastDate = dayStr(-3);
AppStore.data.signContinueDay = 5;
AppStore.data.signMonthGet = true;
doSign();
check("断签后连签从 1 开始",
  AppStore.data.signContinueDay === 1, `streak=${AppStore.data.signContinueDay}`);
check("断签后月奖标记重置", AppStore.data.signMonthGet === false);

// 17. 连续第 28 天可领月奖，且只领一次
AppStore.data = AppStore.freshData();
AppStore.data.signLastDate = dayStr(-1);
AppStore.data.signContinueDay = 27;
AppStore.data.signMonthGet = false;
const potionBefore = AppStore.data.bag.sweetPotion || 0;
doSign();
check("第 28 天领取月奖", AppStore.data.signMonthGet === true &&
  (AppStore.data.bag.sweetPotion || 0) > potionBefore,
  `potion=${AppStore.data.bag.sweetPotion}`);

// 汇总
const failed = results.filter(r => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.extra ? "  (" + r.extra + ")" : ""}`);
}
console.log(`\n${results.length - failed.length}/${results.length} 通过`);
if (failed.length) process.exit(1);
