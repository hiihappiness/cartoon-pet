// 版本规则（v2.7 起）：
//   feature = 用户能感知的功能版本，新增一批玩法才 +1
//   build   = 构建号，日期 + 当日序号，修 bug/调数值只改这里
// 页面、version.json、service-worker 都不再各自维护功能版本。
// v2.8：界面信息架构调整（状态条下移、主按钮 4 格、入口可见化）
// v2.8 干净版：环形菜单圆心修正、7 天签到面板、移除 7.5MB PNG 兜底
export const AppConfig = {
  APP_VERSION: {
    feature: "2.8",
    build: "20261110.7"
  },
  CONFIG: {
    // v2.7 放慢衰减：原 0.35/2秒 约 10 分钟见底，改为约 55 分钟
    baseDecay: 0.06,
    levelConsumeRate: 0.003,
    nightRate: 0.2,
    happyExtraConsume: 1.03,
    lowMoodConsume: 0.85,
    happyExpRate: 1.2,
    sadExpRate: 0.7,
    fullHungerLimit: 95,
    maxCacheBox: 9999,
    nightWakeDuration: 90 * 1000,
    // v2.7 触摸手感：冷却放宽，避免连点几秒满心情
    touchCd: 450,
    comboWindow: 2500,
    comboMax: 30,
    restDuration: 120 * 1000,
    restMoodGain: 12,
    restCd: 5 * 60 * 1000,
    // 离线结算：最多补算 2 小时，单次最多掉 30 点，保底 20
    offlineMaxMs: 2 * 60 * 60 * 1000,
    offlineMaxDrop: 30,
    offlineFloor: 20,
    // 存档节流：最短写入间隔
    saveInterval: 8000
  },
  // 接食物小游戏参数
  FEED_GAME: {
    duration: 20,
    spawnBase: 680,
    spawnMin: 380,
    basketWidth: 72,
    foodSize: 30
  },
  // 小游戏中心：统一入口、冷却与文案
  GAMES: [
    {
      id: "feed",
      name: "接食物",
      icon: "🍎",
      color: "pink",
      desc: "左右拖动小篮子，接住掉落的食物",
      duration: 20,
      cooldown: 90 * 1000,
      cdKey: "feedGameCd",
      mod: "./game-feed.js",
      bestKey: "bestFeed",
      unit: "个"
    },
    {
      id: "bubble",
      name: "戳泡泡",
      icon: "🫧",
      color: "blue",
      desc: "30 秒内点破尽可能多的泡泡",
      duration: 30,
      cooldown: 90 * 1000,
      cdKey: "gameCd",
      mod: "./game-bubble.js",
      bestKey: "bestBubble",
      unit: "分"
    },
    {
      id: "whack",
      name: "打地鼠",
      icon: "🔨",
      color: "yellow",
      desc: "30 秒内敲中冒头的小团子，连击加分",
      duration: 30,
      cooldown: 90 * 1000,
      cdKey: "whackGameCd",
      mod: "./game-whack.js",
      bestKey: "bestWhack",
      unit: "分"
    },
    {
      id: "memory",
      name: "翻翻乐",
      icon: "🃏",
      color: "purple",
      desc: "翻开卡片找出相同食物，步数越少奖励越好",
      duration: 90,
      cooldown: 120 * 1000,
      cdKey: "memoryGameCd",
      mod: "./game-memory.js",
      bestKey: "bestMemory",
      unit: "对"
    },
    {
      id: "snake",
      name: "贪吃蛇",
      icon: "🐍",
      color: "green",
      desc: "吃果实变长，越吃越快，别撞墙也别咬到自己",
      duration: 0,
      cooldown: 90 * 1000,
      cdKey: "snakeGameCd",
      mod: "./game-snake.js",
      bestKey: "bestSnake",
      unit: "分"
    },
    {
      id: "bubblecat",
      name: "泡泡闯关",
      icon: "🫧",
      color: "purple",
      desc: "拖动瞄准，从底部大炮发射泡泡，同色三消，最高 999 关",
      duration: 0,
      cooldown: 120 * 1000,
      cdKey: "bubbleCatGameCd",
      mod: "./game-bubblecat.js",
      bestKey: "bestBubbleCat",
      unit: "关"
    }
  ],
  BOX_CONFIG: [
    {
      key: "bronze",
      name: "青铜宝箱",
      reward: { grain: [2, 4], fruit: [1, 2], cookie: [0, 1] },
      weight: 100
    },
    {
      key: "silver",
      name: "白银宝箱",
      reward: { cookie: [1, 2], milk: [0, 1], ball: [0, 1], fruit: [0, 2] },
      weight: 50
    },
    {
      key: "gold",
      name: "黄金宝箱",
      reward: { cake: [0, 1], bell: [0, 1], ball: [0, 1], milk: [0, 1] },
      weight: 20
    },
    {
      key: "rare",
      name: "稀有宝箱",
      reward: { feather: [0, 1], sweetPotion: [0, 1], cake: [0, 1] },
      weight: 8
    }
  ],
  SIGN_CONFIG: {
    day1: { grain: 3 },
    day3: { cookie: 2, milk: 1 },
    day7: { cake: 2, bell: 1 },
    month: { sweetPotion: 1 }
  },
  ACHIEVE_LIST: [
    { id: "feed10", name: "小小投喂家", desc: "累计投喂10次", target: 10, type: "totalFeed", reward: { bell: 1 } },
    { id: "feed50", name: "投喂达人", desc: "累计投喂50次", target: 50, type: "totalFeed", reward: { cake: 2 } },
    { id: "feed200", name: "美食管家", desc: "累计投喂200次", target: 200, type: "totalFeed", reward: { sweetPotion: 1 } },
    { id: "touch50", name: "摸摸爱好者", desc: "累计抚摸团子50次", target: 50, type: "totalTouch", reward: { feather: 1 } },
    { id: "touch200", name: "贴心陪伴", desc: "累计抚摸团子200次", target: 200, type: "totalTouch", reward: { cake: 2 } },
    { id: "touch500", name: "贴贴狂魔", desc: "累计抚摸团子500次", target: 500, type: "totalTouch", reward: { sweetPotion: 1 } },
    { id: "lv5", name: "五级萌新", desc: "团子升到5级", target: 5, type: "level", reward: { cake: 3 } },
    { id: "lv10", name: "十级陪伴", desc: "团子升到10级", target: 10, type: "level", reward: { sweetPotion: 1 } },
    { id: "lv20", name: "长久相伴", desc: "团子升到20级", target: 20, type: "level", reward: { sweetPotion: 2 } },
    { id: "nightCare", name: "深夜陪伴", desc: "在夜间照料团子一次", target: 1, type: "nightCareCount", reward: { milk: 2 } },
    { id: "nightCare10", name: "守夜人", desc: "夜间照料团子10次", target: 10, type: "nightCareCount", reward: { feather: 2 } },
    { id: "game10", name: "游戏新手", desc: "游玩泡泡游戏10次", target: 10, type: "totalGame", reward: { cookie: 3 } },
    { id: "game50", name: "泡泡高手", desc: "游玩泡泡游戏50次", target: 50, type: "totalGame", reward: { sweetPotion: 1 } },
    { id: "box10", name: "寻宝新手", desc: "累计开启宝箱10个", target: 10, type: "openBox", reward: { fruit: 5 } },
    { id: "box50", name: "寻宝爱好者", desc: "累计开启宝箱50个", target: 50, type: "openBox", reward: { bell: 2 } },
    { id: "box200", name: "宝藏猎人", desc: "累计开启宝箱200个", target: 200, type: "openBox", reward: { sweetPotion: 2 } },
    { id: "buffUse", name: "舒缓时刻", desc: "第一次使用舒心药剂", target: 1, type: "buffUse", reward: { milk: 3 } },
    { id: "sign3", name: "三日之约", desc: "连续签到3天", target: 3, type: "signContinue", reward: { grain: 5 } },
    { id: "sign7", name: "一周陪伴", desc: "连续签到7天", target: 7, type: "signContinue", reward: { cake: 2 } },
    { id: "sign28", name: "月月相守", desc: "连续签到28天", target: 28, type: "signContinue", reward: { sweetPotion: 3 } },
    { id: "combo20", name: "连击达人", desc: "单次抚摸连击达到20", target: 20, type: "maxCombo", reward: { cake: 1 } },
    { id: "feedGame10", name: "接食小能手", desc: "游玩接食物小游戏10次", target: 10, type: "totalFeedGame", reward: { cookie: 3 } },
    // v2.7 新游戏成就
    { id: "whack10", name: "地鼠克星", desc: "游玩打地鼠10次", target: 10, type: "totalWhack", reward: { bell: 2 } },
    { id: "whack30score", name: "手速惊人", desc: "打地鼠单局得分达到30", target: 30, type: "bestWhack", reward: { cake: 1 } },
    { id: "memory10", name: "记忆大师", desc: "游玩翻翻乐10次", target: 10, type: "totalMemory", reward: { feather: 2 } },
    { id: "memoryAll", name: "过目不忘", desc: "翻翻乐全部配对成功8次", target: 8, type: "memoryWins", reward: { sweetPotion: 1 } }
  ],
  ITEM_CONFIG: [
    { id: "grain", name: "口粮", icon: "🌾", type: "food", tag: "主食", desc: "基础主食，饱食+20，经验+15", addHunger: 20, addMood: 0, addExp: 15, cd: 0 },
    { id: "cookie", name: "小饼干", icon: "🍪", type: "food", tag: "点心", desc: "美味点心，饱食+12，心情+30，经验+10", addHunger: 12, addMood: 30, addExp: 10, cd: 0 },
    { id: "fruit", name: "鲜果", icon: "🍎", type: "food", tag: "水果", desc: "新鲜水果，饱食+16，心情+15，经验+20", addHunger: 16, addMood: 15, addExp: 20, cd: 0 },
    { id: "cake", name: "小蛋糕", icon: "🍰", type: "food", tag: "甜品", desc: "甜甜的蛋糕，饱食+25，心情+40，经验+25", addHunger: 25, addMood: 40, addExp: 25, cd: 0 },
    { id: "milk", name: "温牛奶", icon: "🥛", type: "food", tag: "饮品", desc: "暖暖的牛奶，饱食+10，心情+20，经验+8", addHunger: 10, addMood: 20, addExp: 8, cd: 0 },
    { id: "ball", name: "弹力小球", icon: "⚽", type: "toy", tag: "玩具", desc: "圆圆的小球，心情+35，经验+5", addHunger: 0, addMood: 35, addExp: 5, cd: 8000 },
    { id: "bell", name: "铃铛", icon: "🔔", type: "toy", tag: "玩具", desc: "叮铃铃铛，心情+25，经验+3", addHunger: 0, addMood: 25, addExp: 3, cd: 8000 },
    { id: "feather", name: "羽毛逗棒", icon: "🪶", type: "toy", tag: "玩具", desc: "软软羽毛，心情+45，经验+8", addHunger: 0, addMood: 45, addExp: 8, cd: 10000 },
    { id: "sweetPotion", name: "舒心药剂", icon: "🧪", type: "potion", tag: "增益", desc: "30分钟饱食心情衰减减半", buff: "slowDecay", buffTime: 30 * 60 * 1000, addHunger: 0, addMood: 0, addExp: 0, cd: 0 }
  ],
  DAY_START: 6,
  NIGHT_START: 23,
  TOUCH_TALK: {
    head: ["摸头好舒服~", "再摸摸头嘛！", "呼噜呼噜…🥰", "头发要被揉乱啦"],
    body: ["好痒呀嘿嘿~", "肚子软软的哦", "轻一点啦~", "嘿嘿，怕痒🥺"],
    feet: ["别挠脚脚！", "要跳起来啦！", "脚脚也想要摸摸", "痒痒的，咯咯咯"]
  },
  TALK_LIST_DAY: [
    "今天天气不错~",
    "摸摸我吧！",
    "想吃好吃的~",
    "陪我玩好不好",
    "嘿嘿🥰",
    "今天好开心！",
    "快喂我零食",
    "我在这里哦"
  ],
  TALK_LIST_NIGHT: [
    "好困哦...",
    "晚安啦...zzz",
    "想睡觉啦",
    "小声一点哦",
    "让我休息一会",
    "梦里有好吃的"
  ]
};

export function versionLabel() {
  return AppConfig.APP_VERSION.feature;
}

export function buildLabel() {
  return AppConfig.APP_VERSION.build;
}

export function fullVersionLabel() {
  return `${AppConfig.APP_VERSION.feature} · ${AppConfig.APP_VERSION.build}`;
}
