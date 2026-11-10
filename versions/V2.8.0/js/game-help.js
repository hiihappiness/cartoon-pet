// 六个小游戏的统一玩法说明：首次进入自动弹出，可跳过；之后用右上角“?”随时查看。
const STORAGE_KEY = "mushroomPetHelpSeen";

const GUIDES = {
  feed: {
    title: "接食物怎么玩",
    steps: [
      "按住屏幕左右拖动小篮子，篮子会跟着手指走。",
      "接住掉下来的食物，每接住一个 +1 分，漏掉不扣分。",
      "限时 20 秒，时间到后按接住的数量发零食奖励。",
    ],
    tip: "篮子对准食物落点，提前一点点移动更容易接住。",
  },
  bubble: {
    title: "戳泡泡怎么玩",
    steps: [
      "直接点屏幕里出现的泡泡，点破一个 +1 分。",
      "泡泡会不断冒出来，手快一点，30 秒内尽量多点。",
      "时间到后按得分发奖励。",
    ],
    tip: "优先点靠近手指、快消失的泡泡，别追着最小的跑。",
  },
  whack: {
    title: "打地鼠怎么玩",
    steps: [
      "小团子会从 9 个洞里随机冒头，看到就点它。",
      "敲中一只 +10 分，缩回去再敲不算。",
      "限时 30 秒，时间到后按得分发奖励。",
    ],
    tip: "手指停在中间，左右两个洞都能快速够到。",
  },
  memory: {
    title: "翻翻乐怎么玩",
    steps: [
      "点卡片翻开图案，一次翻两张。",
      "两张图案相同就配对成功，不同会自动盖回去。",
      "配完 8 对或 90 秒时间到结束，步数越少越好。",
    ],
    tip: "先记下第一次翻到的位置，再找它的另一半。",
  },
  snake: {
    title: "贪吃蛇怎么玩",
    steps: [
      "在屏幕上滑动，或者按方向键 / 下方方向按钮转向。",
      "吃到果实 +10 分、身体变长一节，速度会越来越快。",
      "撞到墙或咬到自己就结束，按得分发奖励。",
    ],
    tip: "不要贴墙走，提前一格转向，给蛇头留出转弯空间。",
  },
  bubblecat: {
    title: "泡泡闯关怎么玩",
    steps: [
      "按住屏幕拖动瞄准，松手后从底部大炮发射泡泡。",
      "泡泡碰到墙会反弹，碰到顶部或其它泡泡会粘住。",
      "3 个及以上同色泡泡相连会消除，失去支撑的悬空泡泡也会掉落。",
      "达到本关目标分数就能进入下一关，最高 999 关；时间到或泡泡堆到底部则结束。",
    ],
    tip: "先打掉连接大片泡泡的“支点”，让上面一整片悬空掉落，分数更高。",
  },
};

let currentId = null;

function $id(id) { return document.getElementById(id); }

function loadSeen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch (e) {
    return {};
  }
}

function saveSeen(obj) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) { /* 忽略 */ }
}

export function hasSeenGameHelp(id) {
  return !!loadSeen()[id];
}

export function markGameHelpSeen(id) {
  if (!id) return;
  const seen = loadSeen();
  seen[id] = 1;
  saveSeen(seen);
}

export function showGameHelp(id) {
  const guide = GUIDES[id];
  const modal = $id("gameHelpModal");
  if (!guide || !modal) return;
  currentId = id;
  const title = $id("gameHelpTitle");
  const body = $id("gameHelpBody");
  if (title) title.innerText = guide.title;
  if (body) {
    body.innerHTML = `<ol class="help-steps">${guide.steps.map(s => `<li>${s}</li>`).join("")}</ol>
      <p class="help-tip">小提示：${guide.tip}</p>`;
  }
  modal.style.display = "flex";
}

export function closeGameHelp(mark = true) {
  const modal = $id("gameHelpModal");
  if (modal) modal.style.display = "none";
  if (mark && currentId) markGameHelpSeen(currentId);
  currentId = null;
}

/** 首次进入某个游戏时自动弹出；已看过则不再打扰 */
export function maybeShowGameHelp(id) {
  if (!hasSeenGameHelp(id)) showGameHelp(id);
}

/** 绑定右上角帮助按钮和说明弹窗的关闭按钮 */
export function bindGameHelpButtons() {
  const skip = $id("gameHelpSkip");
  const ok = $id("gameHelpOk");
  const backdrop = $id("gameHelpBackdrop");
  if (skip && !skip.dataset.bound) {
    skip.dataset.bound = "1";
    skip.addEventListener("click", () => closeGameHelp(true));
  }
  if (ok && !ok.dataset.bound) {
    ok.dataset.bound = "1";
    ok.addEventListener("click", () => closeGameHelp(true));
  }
  if (backdrop && !backdrop.dataset.bound) {
    backdrop.dataset.bound = "1";
    backdrop.addEventListener("click", () => closeGameHelp(true));
  }
  document.querySelectorAll("[data-game-help]").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => showGameHelp(btn.dataset.gameHelp));
  });
}
