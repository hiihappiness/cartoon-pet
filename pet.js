// =====================【配置模块】常量，不执行业务 =====================
const AppConfig = {
  APP_VERSION: {
    major: 2,
    minor: 4
  },
  CONFIG: {
    baseDecay: 0.35,
    levelConsumeRate: 0.003,
    nightRate: 0.2,
    happyExtraConsume: 1.03,
    lowMoodConsume: 0.85,
    happyExpRate: 1.2,
    sadExpRate: 0.7,
    fullHungerLimit: 95,
    halfFeedLimit: 80,
    maxCacheBox: 9999,
    nightWakeDuration: 90 * 1000
  },
  BOX_CONFIG: [
    {
      key: "bronze",
      name: "青铜宝箱",
      interval: 3 * 60 * 1000,
      reward: {
        grain: [2,4],
        fruit: [1,2],
        cookie:[0,1]
      },
      weight: 100
    },
    {
      key: "silver",
      name: "白银宝箱",
      interval: 10 * 60 * 1000,
      reward: {
        cookie: [1,2],
        milk: [0,1],
        ball:[0,1],
        fruit:[0,2]
      },
      weight: 50
    },
    {
      key: "gold",
      name: "黄金宝箱",
      interval: 30 * 60 * 1000,
      reward: {
        cake: [0,1],
        bell: [0,1],
        ball:[0,1],
        milk:[0,1]
      },
      weight: 20
    },
    {
      key: "rare",
      name: "稀有宝箱",
      interval: 60 * 60 * 1000,
      reward: {
        feather: [0,1],
        sweetPotion: [0,1],
        cake:[0,1]
      },
      weight: 8
    }
  ],
  SIGN_CONFIG: {
    day1: {grain:3},
    day3: {cookie:2, milk:1},
    day7: {cake:2, bell:1},
    month: {sweetPotion:1}
  },
  ACHIEVE_LIST: [
    {id:"feed10", name:"小小投喂家", desc:"累计投喂10次", target:10, type:"totalFeed", reward:{bell:1}},
    {id:"feed50", name:"投喂达人", desc:"累计投喂50次", target:50, type:"totalFeed", reward:{cake:2}},
    {id:"feed200", name:"美食管家", desc:"累计投喂200次", target:200, type:"totalFeed", reward:{sweetPotion:1}},
    {id:"touch50", name:"摸摸爱好者", desc:"累计抚摸团子50次", target:50, type:"totalTouch", reward:{feather:1}},
    {id:"touch200", name:"贴心陪伴", desc:"累计抚摸团子200次", target:200, type:"totalTouch", reward:{cake:2}},
    {id:"touch500", name:"贴贴狂魔", desc:"累计抚摸团子500次", target:500, type:"totalTouch", reward:{sweetPotion:1}},
    {id:"lv5", name:"五级萌新", desc:"团子升到5级", target:5, type:"level", reward:{cake:3}},
    {id:"lv10", name:"十级陪伴", desc:"团子升到10级", target:10, type:"level", reward:{sweetPotion:1}},
    {id:"lv20", name:"长久相伴", desc:"团子升到20级", target:20, type:"level", reward:{sweetPotion:2}},
    {id:"nightCare", name:"深夜陪伴", desc:"在夜间照料团子一次", target:1, type:"nightCare", reward:{milk:2}},
    {id:"nightCare10", name:"守夜人", desc:"夜间照料团子10次", target:10, type:"nightCareCount", reward:{feather:2}},
    {id:"game10", name:"游戏新手", desc:"游玩泡泡游戏10次", target:10, type:"totalGame", reward:{cookie:3}},
    {id:"game50", name:"泡泡高手", desc:"游玩泡泡游戏50次", target:50, type:"totalGame", reward:{sweetPotion:1}},
    {id:"box10", name:"寻宝新手", desc:"累计开启宝箱10个", target:10, type:"openBox", reward:{fruit:5}},
    {id:"box50", name:"寻宝爱好者", desc:"累计开启宝箱50个", target:50, type:"openBox", reward:{bell:2}},
    {id:"box200", name:"宝藏猎人", desc:"累计开启宝箱200个", target:200, type:"openBox", reward:{sweetPotion:2}},
    {id:"buffUse", name:"舒缓时刻", desc:"第一次使用舒心药剂", target:1, type:"useBuff", reward:{milk:3}},
    {id:"sign3", name:"三日之约", desc:"连续签到3天", target:3, type:"signContinue", reward:{grain:5}},
    {id:"sign7", name:"一周陪伴", desc:"连续签到7天", target:7, type:"signContinue", reward:{cake:2}},
    {id:"sign28", name:"月月相守", desc:"连续签到28天", target:28, type:"signContinue", reward:{sweetPotion:3}},
  ],
  ITEM_CONFIG: [
    {id:"grain", name:"口粮", type:"food", tag:"主食", desc:"基础主食，饱食+20，经验+15", addHunger:20, addMood:0, addExp:15, cd:0},
    {id:"cookie", name:"小饼干", type:"food", tag:"点心", desc:"美味点心，饱食+12，心情+30，经验+10", addHunger:12, addMood:30, addExp:10, cd:0},
    {id:"fruit", name:"鲜果", type:"food", tag:"水果", desc:"新鲜水果，饱食+16，心情+15，经验+20", addHunger:16, addMood:15, addExp:20, cd:0},
    {id:"cake", name:"小蛋糕", type:"food", tag:"甜品", desc:"甜甜的蛋糕，饱食+25，心情+40，经验+25", addHunger:25, addMood:40, addExp:25, cd:0},
    {id:"milk", name:"温牛奶", type:"food", tag:"饮品", desc:"暖暖的牛奶，饱食+10，心情+20，经验+8", addHunger:10, addMood:20, addExp:8, cd:0},
    {id:"ball", name:"弹力小球", type:"toy", tag:"玩具", desc:"圆圆的小球，心情+35，经验+5", addHunger:0, addMood:35, addExp:5, cd:8000},
    {id:"bell", name:"铃铛", type:"toy", tag:"玩具", desc:"叮铃铃铛，心情+25，经验+3", addHunger:0, addMood:25, addExp:3, cd:8000},
    {id:"feather", name:"羽毛逗棒", type:"toy", tag:"玩具", desc:"软软羽毛，心情+45，经验+8", addHunger:0, addMood:45, addExp:8, cd:10000},
    {id:"sweetPotion", name:"舒心药剂", type:"potion", tag:"增益", desc:"30分钟饱食心情衰减减半", buff:"slowDecay", buffTime:30 * 60 * 1000, addHunger:0, addMood:0, addExp:0, cd:0},
  ],
  DAY_START: 7,
  NIGHT_START: 21,
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
const SW_TAG = `${AppConfig.APP_VERSION.major}.${AppConfig.APP_VERSION.minor}`;

document.getElementById("verShow").innerText = `${AppConfig.APP_VERSION.major}.${AppConfig.APP_VERSION.minor}`;

// =====================【Store存档模块】只读写localStorage，不操作DOM =====================
const AppStore = {
  data: null,
  defaultData: {
    petName:"团子",
    level:1,
    exp:0,
    expNeed:100,
    hunger:80,
    mood:80,
    lastActive:Date.now(),
    lastBoxGenTime: Date.now(),
    isPlaying: false,
    isNightAwake: false,
    nightAwakeEnd:0,
    bag:{
      grain:5,
      cookie:3,
      fruit:3,
      cake:0,
      milk:0,
      ball:2,
      bell:1,
      feather:0,
      sweetPotion:0
    },
    boxQueue: [],
    petTouchCount: 0,
    lastTouchTime: 0,
    gameCd:0,
    totalFeed:0,
    totalTouch:0,
    totalGame:0,
    totalExpGained:0,
    nightCareCount:0,
    openBoxCount:0,
    buffUseCount:0,
    itemCd:{},
    buff:{
      slowDecayEnd:0
    },
    signLastDate:"",
    signContinueDay:0,
    signMonthGet:false,
    achieveDone:[]
  },
  save(data){
    localStorage.setItem('mushroomPetData', JSON.stringify(data));
  },
  load(){
    let raw = localStorage.getItem('mushroomPetData');
    let data;
    if(!raw){
      data = JSON.parse(JSON.stringify(this.defaultData));
      this.save(data);
      return data;
    }
    try{
      data = JSON.parse(raw);
      if(typeof data.petName === "undefined") data.petName = "团子";
      if(!data.bag) data.bag = {};
      if(!data.itemCd) data.itemCd = {};
      if(!data.buff) data.buff = {slowDecayEnd:0};
      if(!data.boxQueue) data.boxQueue = [];
      if(!data.achieveDone) data.achieveDone = [];
      if(typeof data.signLastDate === "undefined") data.signLastDate = "";
      if(typeof data.signContinueDay === "undefined") data.signContinueDay = 0;
      if(typeof data.signMonthGet === "undefined") data.signMonthGet = false;
      if(typeof data.lastBoxGenTime === "undefined") data.lastBoxGenTime = Date.now();
      if(typeof data.totalFeed === 'undefined') data.totalFeed = 0;
      if(typeof data.totalTouch === 'undefined') data.totalTouch = 0;
      if(typeof data.totalGame === 'undefined') data.totalGame = 0;
      if(typeof data.totalExpGained === 'undefined') data.totalExpGained = 0;
      if(typeof data.nightCareCount === "undefined") data.nightCareCount = 0;
      if(typeof data.openBoxCount === "undefined") data.openBoxCount = 0;
      if(typeof data.buffUseCount === "undefined") data.buffUseCount = 0;
      if(typeof data.isNightAwake === "undefined") data.isNightAwake = false;
      if(typeof data.nightAwakeEnd === "undefined") data.nightAwakeEnd = 0;
      AppConfig.ITEM_CONFIG.forEach(item=>{
        if(typeof data.bag[item.id] === "undefined"){
          data.bag[item.id] = 0;
        }
      })
    }catch(e){
      alert("存档损坏，已重置团子");
      data = JSON.parse(JSON.stringify(this.defaultData));
      this.save(data);
    }
    return data;
  }
};

// =====================【Util工具模块】音效、时间等纯工具 =====================
let audioCtx = null;
let soundEnable = true;
function initAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playTone(freq, dur, type='sine', vol=0.2){
  if(!soundEnable || !audioCtx) return;
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
}
function soundTap(){ initAudio(); playTone(620,0.12); }
function soundFeed(){ initAudio(); playTone(440,0.15); setTimeout(()=>playTone(520,0.15),80); }
function soundLevelUp(){
  initAudio();
  playTone(520,0.14);
  setTimeout(()=>playTone(660,0.14),120);
  setTimeout(()=>playTone(880,0.22),240);
}
function soundGameHit(){ initAudio(); playTone(800,0.09,'square'); }
function soundGameEnd(){ initAudio(); playTone(580,0.15); setTimeout(()=>playTone(480,0.15),120); }
function soundReward(){ initAudio(); playTone(700,0.15); setTimeout(()=>playTone(840,0.18),100); }
function toggleSound(){
  soundEnable = !soundEnable;
  const el = document.getElementById('soundBtn');
  if(el) el.innerText = soundEnable ? "🔊音效开" : "🔇音效关";
}
function getTodayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function isNightTime(){
  const h = new Date().getHours();
  return h >= AppConfig.NIGHT_START || h < AppConfig.DAY_START;
}

// =====================【PWA更新模块】版本检测、SW逻辑 =====================
let newWorker = null;
let swReg = null;
async function checkRemoteVersion() {
  let hasNewVersion = false;
  try {
    const res = await fetch(`./version.json?t=${Date.now()}`, {
      cache: "no‑store",
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`http ${res.status}`);
    const remote = await res.json();
    if (!remote || typeof remote.major !== "number") throw new Error("version.json格式错误");
    const localVer = AppConfig.APP_VERSION.major * 1000 + AppConfig.APP_VERSION.minor;
    const remoteVer = remote.major * 1000 + remote.minor;
    if (remoteVer > localVer) {
      hasNewVersion = true;
      const msg = `✨发现新版本 v${remote.major}.${remote.minor}\n更新说明：${remote.note || "优化体验与修复BUG"}\n点击【确定】执行更新并刷新页面`;
      const ok = confirm(msg);
      if (ok) triggerSWUpdate();
    }
    return { hasNewVersion, remote };
  } catch (e) {
    console.warn("[版本检测]失败(离线/超时):", e.message);
    return { hasNewVersion: false, remote: null };
  }
}
async function triggerSWUpdate() {
  if (!("serviceWorker" in navigator)) {
    alert("⚠️当前浏览器不支持PWA更新，请手动刷新页面。");
    location.href = `./index.html?_t=${Date.now()}`;
    return;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    alert("⚠️未检测到服务工作线程，手动刷新页面。");
    location.href = `./index.html?_t=${Date.now()}`;
    return;
  }
  let reloadFired = false;
  const onControllerChange = () => {
    if (reloadFired) return;
    reloadFired = true;
    navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    location.reload();
  };
  navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
  try {
    await reg.update();
    if (reg.waiting) showUpdateConfirm(reg.waiting);
    else alert("✅已触发更新下载，请等待下载完成后页面自动刷新。");
  } catch (err) {
    console.error("SW update异常", err);
    alert("⚠️更新触发失败，请手动刷新页面。");
  }
}
function showUpdateConfirm(worker){
  if(!worker) return;
  if (confirm("🍄检测到新版本，确认立即更新并刷新页面？")) {
    worker.postMessage({ type: 'SKIP_WAITING' });
    worker.addEventListener('statechange',()=>{
      if(worker.state === "activated"){
        location.reload();
      }
    })
  }
}
async function manualCheckUpdate() {
  const ret = await checkRemoteVersion();
  if (!ret.hasNewVersion) alert("✅当前已经是最新版本");
}
function hardReload(){
  if(!confirm("将完全重载页面，宠物存档不会丢失，确认继续？")) return;
  location.href = `./index.html?_t=${Date.now()}`;
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(`./service-worker.js`).then(reg => {
    swReg = reg;
    if(reg.waiting){
      showUpdateConfirm(reg.waiting);
    }
    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing;
      if(!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'waiting') {
          showUpdateConfirm(newWorker);
        }
      })
    })
  })
}

// =====================【业务模块business】只修改AppStore.data，不直接操作DOM =====================
let animLock = false;
let gameMainTimer = null;
let bubbleSpawnTimer = null;
let score = 0;
let gameRunning = false;
let remainTime = 30;
let backpackTab = "all";

function wakePetAtNight(){
  if(!isNightTime()) return;
  AppStore.data.isNightAwake = true;
  AppStore.data.nightAwakeEnd = Date.now() + AppConfig.CONFIG.nightWakeDuration;
  AppStore.save(AppStore.data);
}
function calcDecayPerMinute(){
  const data = AppStore.data;
  let base = AppConfig.CONFIG.baseDecay;
  if(Date.now() < data.buff.slowDecayEnd){
    base = base * 0.5;
  }
  const lvlRate = 1 + (data.level - 1) * AppConfig.CONFIG.levelConsumeRate;
  const dayRate = isNightTime() ? AppConfig.CONFIG.nightRate : 1;
  let moodRate = 1;
  if(data.mood > 80) moodRate = AppConfig.CONFIG.happyExtraConsume;
  else if(data.mood < 20) moodRate = AppConfig.CONFIG.lowMoodConsume;
  return base * lvlRate * dayRate * moodRate;
}
function petClick(){
  soundTap();
  const data = AppStore.data;
  if(isNightTime() && !data.isNightAwake){
    wakePetAtNight();
  }
  if(animLock) return;
  const now = Date.now();
  const gap = now - data.lastTouchTime;
  if(gap < 2000){
    data.petTouchCount += 1;
  }else{
    data.petTouchCount = 1;
  }
  data.lastTouchTime = now;
  data.totalTouch++;
  if(isNightTime()){
    data.nightCareCount++;
    checkAchievement("nightCare");
  }
  AppStore.save(data);
  animLock = true;
  if(data.petTouchCount >=3){
    dom.petImg.classList.add("bounce-anim");
    setTimeout(()=>{
      dom.petImg.classList.remove("bounce-anim");
      animLock = false;
    },450);
    data.petTouchCount = 0;
  }else{
    dom.petImg.classList.add("shy-anim");
    setTimeout(()=>{
      dom.petImg.classList.remove("shy-anim");
      animLock = false;
    },400);
  }

  // =========抚摸小概率惊喜掉落 12%概率触发
  const dropChance = 0.12;
  if(Math.random() < dropChance){
    const dropPool = [
      {id:"grain",count:1},
      {id:"fruit",count:1},
      {id:"cookie",count:1},
      {id:"milk",count:1}
    ];
    const dropItem = dropPool[Math.floor(Math.random()*dropPool.length)];
    data.bag[dropItem.id] = (data.bag[dropItem.id]||0) + dropItem.count;
    soundReward();
    const itemInfo = AppConfig.ITEM_CONFIG.find(it=>it.id === dropItem.id);
    alert(`💖团子送给你小礼物：${itemInfo.name} ×${dropItem.count}`);
  }

  render();
}
function feedAnim(){
  soundFeed();
  if(animLock) return;
  animLock = true;
  dom.petImg.classList.add("chew-anim");
  setTimeout(()=>{
    dom.petImg.classList.remove("chew-anim");
    animLock = false;
  },350);
}
function randomBoxType(){
  const totalWeight = AppConfig.BOX_CONFIG.reduce((s,item)=>s+item.weight,0);
  let r = Math.random() * totalWeight;
  for(const b of AppConfig.BOX_CONFIG){
    r -= b.weight;
    if(r <= 0) return b;
  }
  return AppConfig.BOX_CONFIG[0];
}
function getBoxInfo(key){
  return AppConfig.BOX_CONFIG.find(b=>b.key === key);
}
function tryGenBox(){
  const data = AppStore.data;
  const now = Date.now();
  const BOX_INTERVAL = 30 * 1000;
  const MAX_OFFLINE_MS = 8 * 3600 * 1000; //最大离线补偿8小时，超出作废

  //达到存储上限，冻结时间戳
  if(data.boxQueue.length >= AppConfig.CONFIG.maxCacheBox){
    data.lastBoxGenTime = now;
    AppStore.save(data);
    return;
  }

  let diff = now - data.lastBoxGenTime;
  //限制最大离线补偿时长
  if(diff > MAX_OFFLINE_MS){
    diff = MAX_OFFLINE_MS;
    data.lastBoxGenTime = now - diff;
  }

  while(data.boxQueue.length < AppConfig.CONFIG.maxCacheBox && diff >= BOX_INTERVAL){
    const boxType = randomBoxType();
    data.boxQueue.push({
      type: boxType.key,
      createAt: now
    });
    data.lastBoxGenTime += BOX_INTERVAL;
    diff -= BOX_INTERVAL;
  }
  AppStore.save(data);
}
function claimAllBox(){
  const data = AppStore.data;
  if(data.boxQueue.length === 0){
    alert("暂时没有宝箱，耐心等待生成~");
    return;
  }
  const list = [...data.boxQueue];
  data.boxQueue = [];
  AppStore.save(data);
  const boxCountMap = {};
  const totalReward = {};
  list.forEach(box=>{
    const boxCfg = getBoxInfo(box.type);
    if(!boxCfg){
      console.warn("非法宝箱类型跳过：", box);
      return;
    }
    if(!boxCountMap[boxCfg.key]){
      boxCountMap[boxCfg.key] = { name: boxCfg.name, count:0 };
    }
    boxCountMap[boxCfg.key].count +=1;
    const reward = {};
    for(const [itemId, range] of Object.entries(boxCfg.reward)){
      const min = range[0], max = range[1];
      const num = Math.floor(Math.random()*(max-min+1)) + min;
      if(num>0) reward[itemId] = num;
    }
    for(const [k,v] of Object.entries(reward)){
      if(!totalReward[k]) totalReward[k]=0;
      totalReward[k] += v;
    }
  })
  const boxShowArr = Object.values(boxCountMap).map(item=>{
    return `${item.name}×${item.count}`;
  });
  for(const [k,v] of Object.entries(totalReward)){
    if(data.bag[k] === undefined) data.bag[k] = 0;
    data.bag[k] += v;
  }
  data.openBoxCount += list.length;
  soundReward();
  const text = Object.entries(totalReward).map(([k,v])=>{
    const it = AppConfig.ITEM_CONFIG.find(x=>x.id===k);
    return `${it.name}×${v}`;
  }).join("\n");
  alert(`📦一共开启：${boxShowArr.join("、")}\n🎁全部奖励：${text}`);
  tryGenBox();
  AppStore.save(data);
  renderBackpack();
  render();
}
function doSignIn(){
  const data = AppStore.data;
  const today = getTodayStr();
  if(data.signLastDate === today){
    alert("今天已经签到过啦，明天再来~");
    return;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-1);
  const yStr = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
  if(data.signLastDate === yStr){
    data.signContinueDay += 1;
  }else{
    data.signContinueDay = 1;
  }
  data.signLastDate = today;
  let reward = {};
  if(data.signContinueDay >= 7){
    reward = {...AppConfig.SIGN_CONFIG.day7};
  }else if(data.signContinueDay >=3){
    reward = {...AppConfig.SIGN_CONFIG.day3};
  }else{
    reward = {...AppConfig.SIGN_CONFIG.day1};
  }
  if(data.signContinueDay >=28 && !data.signMonthGet){
    Object.assign(reward, AppConfig.SIGN_CONFIG.month);
    data.signMonthGet = true;
  }
  for(const [k,v] of Object.entries(reward)){
    data.bag[k] += v;
  }
  soundReward();
  const text = Object.entries(reward).map(([k,v])=>{
    const it = AppConfig.ITEM_CONFIG.find(x=>x.id===k);
    return `${it.name}×${v}`;
  }).join(" ");
  alert(`✅签到成功！连续${data.signContinueDay}天\n🎁奖励：${text}`);
  checkAchievement("signContinue");
  AppStore.save(data);
  renderBackpack();
}
function checkAchievement(type){
  const data = AppStore.data;
  for(const ach of AppConfig.ACHIEVE_LIST){
    if(data.achieveDone.includes(ach.id)) continue;
    let ok = false;
    if(ach.type === "totalFeed" && data.totalFeed >= ach.target) ok = true;
    if(ach.type === "totalTouch" && data.totalTouch >= ach.target) ok = true;
    if(ach.type === "level" && data.level >= ach.target) ok = true;
    if(ach.type === "nightCare" && type === "nightCare") ok = true;
    if(ach.type === "nightCareCount" && data.nightCareCount >= ach.target) ok = true;
    if(ach.type === "totalGame" && data.totalGame >= ach.target) ok = true;
    if(ach.type === "openBox" && data.openBoxCount >= ach.target) ok = true;
    if(ach.type === "useBuff" && data.buffUseCount >= ach.target) ok = true;
    if(ach.type === "signContinue" && data.signContinueDay >= ach.target) ok = true;
    if(ok){
      data.achieveDone.push(ach.id);
      for(const [k,v] of Object.entries(ach.reward)){
        data.bag[k] += v;
      }
      soundReward();
      const text = Object.entries(ach.reward).map(([k,v])=>{
        const it = AppConfig.ITEM_CONFIG.find(x=>x.id===k);
        return `${it.name}×${v}`;
      }).join(" ");
      alert(`🏆解锁成就【${ach.name}】\n${ach.desc}\n🎁奖励：${text}`);
      AppStore.save(data);
    }
  }
}
function renamePet(){
  const data = AppStore.data;
  const newName = prompt("给你的团子起新名字：", data.petName);
  if(newName === null) return;
  const trimName = newName.trim();
  if(trimName.length ===0 || trimName.length>8){
    alert("名字不能为空，最多8个字！");
    return;
  }
  data.petName = trimName;
  AppStore.save(data);
  render();
}
function switchBackpackTab(tabKey){
  backpackTab = tabKey;
  renderBackpack();
}
function openBackpack(){
  tryGenBox();
  renderBackpack();
  dom.backpackModal.style.display="flex";
}
function closeBackpack(){
  dom.backpackModal.style.display="none";
}
function useItem(item){
  const data = AppStore.data;
  if(data.bag[item.id] <=0) return;
  const now = Date.now();
  if(item.cd>0 && data.itemCd[item.id] && now < data.itemCd[item.id]) return;
  feedAnim();
  data.bag[item.id]--;
  data.totalFeed++;
  checkAchievement("totalFeed");
  if(item.type === "toy" && isNightTime() && !data.isNightAwake){
    wakePetAtNight();
  }
  if(item.cd>0){
    data.itemCd[item.id] = now + item.cd;
  }
  data.hunger = Math.min(100, data.hunger + item.addHunger);
  data.mood = Math.min(100, data.mood + item.addMood);
  if(item.type === "potion"){
    data.buff.slowDecayEnd = now + item.buffTime;
    data.buffUseCount ++;
    checkAchievement("useBuff");
    alert("✨舒心药剂生效！30分钟衰减减半");
  }else{
    if(item.addExp>0){
      addExp(item.addExp);
    }
  }
  data.lastActive = Date.now();
  AppStore.save(data);
  render();
  renderBackpack();
  closeBackpack();
}
function openGame(){
  const data = AppStore.data;
  const now = Date.now();
  if(now < data.gameCd){
    const left = Math.ceil((data.gameCd - now)/1000);
    alert(`🎮游戏冷却：${left}秒`);
    return;
  }
  dom.gameModal.style.display="flex";
}
function closeGame(){
  clearInterval(gameMainTimer);
  clearInterval(bubbleSpawnTimer);
  dom.gameArea.innerHTML = "";
  gameRunning = false;
  dom.gameModal.style.display="none";
}
function startGame(){
  if(gameRunning) return;
  score = 0;
  remainTime = 30;
  dom.gameScoreEl.innerText = score;
  dom.gameTimerText.innerText = remainTime;
  dom.gameTipEl.innerText = "点击泡泡得分！限时30秒";
  gameRunning = true;
  dom.gameArea.innerHTML = "";
  gameMainTimer = setInterval(()=>{
    remainTime--;
    dom.gameTimerText.innerText = remainTime;
    if(remainTime <=0){
      endGame();
    }
  },1000);
  bubbleSpawnTimer = setInterval(()=>{
    if(!gameRunning) return;
    const b = document.createElement("div");
    b.className = "bubble";
    const w = dom.gameArea.clientWidth - 44;
    const h = dom.gameArea.clientHeight - 44;
    b.style.left = Math.random()*w + "px";
    b.style.top = Math.random()*h + "px";
    b.innerText = "+1";
    b.onclick = ()=>{
      soundGameHit();
      score++;
      dom.gameScoreEl.innerText = score;
      b.remove();
    }
    dom.gameArea.appendChild(b);
    setTimeout(()=>b.remove(),2000);
  },700);
}
function endGame(){
  soundGameEnd();
  clearInterval(gameMainTimer);
  clearInterval(bubbleSpawnTimer);
  gameRunning = false;
  const data = AppStore.data;
  data.totalGame++;
  let reward = {};
  if(score >=40){
    //高分池
    reward.grain = 3; reward.cookie=2; reward.fruit=1;
    const r = Math.random();
    if(r<0.30) reward.milk = 1;
    if(r<0.18) reward.ball =1;
    if(r<0.10) reward.bell =1;
    if(r<0.05) reward.feather =1;
    if(r<0.02) reward.sweetPotion =1;
  }else if(score >=20){
    reward.grain =2; reward.cookie=1;
    const r = Math.random();
    if(r<0.25) reward.milk=1;
    if(r<0.12) reward.ball=1;
    if(r<0.05) reward.bell=1;
  }else if(score >=10){
    reward.grain=2;
    const r = Math.random();
    if(r<0.15) reward.cookie=1;
  }else{
    reward.grain=1;
  }

  for(const [k,v] of Object.entries(reward)){
    data.bag[k] += v;
  }
  data.gameCd = Date.now() + 60*1000;
  AppStore.save(data);
  renderBackpack();
  const txt = Object.entries(reward).map(([k,v])=>{
    const it = AppConfig.ITEM_CONFIG.find(x=>x.id===k);
    return `${it.name}×${v}`;
  }).join(" ");
  alert(`⏱游戏结束！得分：${score}\n🎁奖励：${txt}`);
  gameTipEl.innerText="游戏结束";
}
function checkGuide(){
  if(localStorage.getItem("hideGuide") !== "1"){
    dom.guideModal.style.display="flex";
  }
}
function closeGuideModal(){
  const ck = document.getElementById("noMoreGuide");
  if(ck && ck.checked){
    localStorage.setItem("hideGuide","1");
  }
  dom.guideModal.style.display="none";
}
function openSaveModal(){
  dom.saveModal.style.display="flex";
}
function closeSaveModal(){
  dom.saveModal.style.display="none";
}
function exportSave(){
  const str = JSON.stringify(AppStore.data,null,2);
  const blob = new Blob([str],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mushroom_save.json";
  a.click();
  URL.revokeObjectURL(url);
}
function addExp(num){
  const data = AppStore.data;
  data.exp += num;
  data.totalExpGained += num;
  while(data.exp >= data.expNeed){
    soundLevelUp();
    data.exp -= data.expNeed;
    data.level += 1;
    data.expNeed = Math.floor(data.expNeed * 1.35);
    dom.levelUpModal.style.display = "flex";
    checkAchievement("level");
  }
  AppStore.save(data);
  render();
}
function closeLevelModal(){
  dom.levelUpModal.style.display="none";
}
function resetPet(){
  if(!confirm("确定重置？所有进度清空！")) return;
  AppStore.data = JSON.parse(JSON.stringify(AppStore.defaultData));
  AppStore.save(AppStore.data);
  render();
}
function autoDecay(){
  const data = AppStore.data;
  const now = Date.now();
  const gapMin = (now - data.lastActive)/60000;
  if(gapMin <=0){
    data.lastActive = now;
    tryGenBox();
    AppStore.save(data);
    return;
  }
  const perMin = calcDecayPerMinute();
  const sub = perMin * gapMin;
  data.hunger = Math.max(0, data.hunger - sub);
  data.mood = Math.max(0, data.mood - sub);
  data.lastActive = now;
  tryGenBox();
  AppStore.save(data);
  render();
}
function modalMaskClose(event){
  if(event.target !== event.currentTarget) return;
  const id = event.target.parentElement.id;
  if(id === "backpackModal") closeBackpack();
  if(id === "gameModal") closeGame();
  if(id === "saveModal") closeSaveModal();
  if(id === "guideModal") closeGuideModal();
}

// =====================【Render渲染模块】只读数据，不修改data，操作DOM =====================
function showTalk(){
  const data = AppStore.data;
  let txt;
  if(isNightTime() && !data.isNightAwake){
    txt = AppConfig.TALK_LIST_NIGHT[Math.floor(Math.random() * AppConfig.TALK_LIST_NIGHT.length)];
  }else{
    txt = AppConfig.TALK_LIST_DAY[Math.floor(Math.random() * AppConfig.TALK_LIST_DAY.length)];
  }
  dom.talkBubble.innerText = txt;
  dom.talkBubble.style.opacity = "1";
  setTimeout(()=>{
    dom.talkBubble.style.opacity = "0";
  }, 2200);
}
function updateBuffUI(){
  const data = AppStore.data;
  if(!dom.buffTip) return;
  const now = Date.now();
  if(now < data.buff.slowDecayEnd){
    const leftSec = Math.ceil((data.buff.slowDecayEnd - now)/1000);
    const m = Math.floor(leftSec / 60);
    const s = leftSec % 60;
    dom.buffTip.innerText = `✨舒心药剂生效，剩余 ${m}分${s}秒`;
    dom.buffTip.style.display = "block";
  }else{
    dom.buffTip.style.display = "none";
  }
}
function updateBoxNextUI(){
  const data = AppStore.data;
  if(!dom.boxNextTip) return;
  const now = Date.now();
  const BOX_INTERVAL = 30 * 1000;
  const nextTime = data.lastBoxGenTime + BOX_INTERVAL;
  if(data.boxQueue.length >= AppConfig.CONFIG.maxCacheBox){
    dom.boxNextTip.innerText = "宝箱队列已满，先领取！";
  }else{
    const diff = nextTime - now;
    if(diff <=0){
      dom.boxNextTip.innerText = "✅可以生成新宝箱";
    }else{
      dom.boxNextTip.innerText = `下一个宝箱：${Math.ceil(diff/1000)}秒`;
    }
  }
}
function updateClaimText(){
  const data = AppStore.data;
  if(dom.canClaimEl) dom.canClaimEl.innerText = data.boxQueue.length;
}
function checkState(){
  const data = AppStore.data;
  const now = Date.now();
  if(isNightTime()){
    document.body.classList.add("night");
  }else{
    document.body.classList.remove("night");
  }
  if(isNightTime() && data.isNightAwake){
    if(now >= data.nightAwakeEnd){
      data.isNightAwake = false;
      AppStore.save(data);
    }
  }
  if (isNightTime() && !data.isNightAwake) {
    dom.petImg.src = "./sleep.png";
    dom.statusText.innerText = `${data.petName}：💤呼呼睡觉中`;
    return;
  }
  if (data.isPlaying) {
    dom.petImg.src = "./play.png";
    dom.statusText.innerText = `${data.petName}：玩得好开心！🥰`;
  } else if (data.hunger <= 15 || data.mood <= 15) {
    dom.petImg.src = "./sad.png";
    dom.statusText.innerText = `${data.petName}：呜呜，快来陪我`;
  } else if (data.hunger <= 30) {
    dom.petImg.src = "./hungry.png";
    dom.statusText.innerText = `${data.petName}：肚子饿饿，想吃东西`;
  } else if (data.mood >= 85) {
    dom.petImg.src = "./happy.png";
    dom.statusText.innerText = `${data.petName}：今天超开心！✨`;
  } else if (data.mood < 30 && data.hunger > 40) {
    dom.petImg.src = "./shy.png";
    dom.statusText.innerText = `${data.petName}：有点闷闷的`;
  } else if (data.hunger >=70 && data.mood >=70) {
    dom.petImg.src = "./normal.png";
    dom.statusText.innerText = `${data.petName}：乖乖待着哦~`;
  } else {
    dom.petImg.src = "./normal.png";
    dom.statusText.innerText = `${data.petName}：乖乖待着哦~`;
  }
  if(isNightTime() && data.isNightAwake){
    const leftSec = Math.ceil((data.nightAwakeEnd - now)/1000);
    dom.statusText.innerText += ` 🌙清醒${leftSec}s`;
  }
}
function render(){
  const data = AppStore.data;
  dom.levelEl.innerText = data.level;
  const expPercent = (data.exp / data.expNeed) *100;
  dom.expBar.style.width = expPercent + "%";
  dom.hungerBar.style.width = data.hunger + "%";
  dom.moodBar.style.width = data.mood + "%";
  checkState();
  checkAchievement("");
  tryGenBox();
  updateBuffUI();
  updateBoxNextUI();
  const pageTitleEl = document.querySelector('#pageTitle span');
  const docTitleEl = document.getElementById('docTitle');
  if(pageTitleEl) pageTitleEl.innerText = data.petName;
  if(docTitleEl) docTitleEl.textContent = `🍄${data.petName}电子宠物`;
}
function renderBackpack(){
  const data = AppStore.data;
  updateClaimText();
  updateBoxNextUI();
  dom.backpackList.innerHTML = "";
  const tabWrap = document.createElement("div");
  tabWrap.className = "bp-tab-wrap";
  const tabs = [
    {k:"all", name:"全部"},
    {k:"food", name:"食物"},
    {k:"toy", name:"玩具"},
    {k:"potion", name:"药剂"},
    {k:"achieve", name:"成就"}
  ];
  tabs.forEach(t=>{
    const btn = document.createElement("button");
    btn.innerText = t.name;
    if(backpackTab === t.k){
      btn.className = "bp-tab active";
      btn.style.fontWeight = "bold";
    }else{
      btn.className = "bp-tab";
    }
    btn.onclick = (e)=>{
      e.stopPropagation();
      switchBackpackTab(t.k);
    }
    tabWrap.appendChild(btn);
  })
  dom.backpackList.appendChild(tabWrap);
  if(backpackTab === "achieve"){
    const achieveWrap = document.createElement("div");
    achieveWrap.className = "achieve-wrap";
    AppConfig.ACHIEVE_LIST.forEach(ach=>{
      const done = data.achieveDone.includes(ach.id);
      const div = document.createElement("div");
      div.className = "achieve-card " + (done ? "done" : "lock");
      let progressText = "";
      if(ach.type === "totalFeed") progressText = `${Math.min(data.totalFeed, ach.target)}/${ach.target}`;
      if(ach.type === "totalTouch") progressText = `${Math.min(data.totalTouch, ach.target)}/${ach.target}`;
      if(ach.type === "level") progressText = `${Math.min(data.level, ach.target)}/${ach.target}`;
      if(ach.type === "nightCareCount") progressText = `${Math.min(data.nightCareCount, ach.target)}/${ach.target}`;
      if(ach.type === "totalGame") progressText = `${Math.min(data.totalGame, ach.target)}/${ach.target}`;
      if(ach.type === "openBox") progressText = `${Math.min(data.openBoxCount, ach.target)}/${ach.target}`;
      if(ach.type === "signContinue") progressText = `${Math.min(data.signContinueDay, ach.target)}/${ach.target}`;
      if(ach.type === "useBuff") progressText = `${Math.min(data.buffUseCount, ach.target)}/${ach.target}`;
      div.innerHTML = `
        <div class="achieve-name">${done ? "✅" : "🔒"} ${ach.name}</div>
        <div class="achieve-desc">${ach.desc}</div>
        <div class="achieve-progress">进度：${progressText}</div>
      `;
      achieveWrap.appendChild(div);
    })
    dom.backpackList.appendChild(achieveWrap);
    return;
  }
  const itemWrap = document.createElement("div");
  itemWrap.className = "bp-items-wrap";
  AppConfig.ITEM_CONFIG.forEach(item=>{
    if(backpackTab !== "all" && item.type !== backpackTab) return;
    const div = document.createElement("div");
    const has = data.bag[item.id] > 0;
    const now = Date.now();
    const inCd = item.cd>0 && data.itemCd[item.id] && now < data.itemCd[item.id];
    div.className = "item-card " + (has && !inCd ? "can-use" : "disabled");
    let tagColor = "#d84444";
    if(item.type === "toy") tagColor="#348ede";
    if(item.type === "potion") tagColor="#9b59b6";
    let cdText = inCd ? `<div style="color:#777;font-size:10px;">冷却中</div>` : "";
    const tipDom = document.createElement("div");
    tipDom.className = "item-tooltip";
    tipDom.innerText = item.desc;
    div.innerHTML = `
      <div class="item-name" style="color:${tagColor}">[${item.tag}] ${item.name}</div>
      <div class="item-num">×${data.bag[item.id]}</div>
      ${cdText}
    `;
    div.appendChild(tipDom);
    if(has && !inCd){
      div.onclick = (e)=>{
        e.stopPropagation();
        useItem(item);
      }
    }
    itemWrap.appendChild(div);
  })
  dom.backpackList.appendChild(itemWrap);
}

// =====================【App入口：DOM缓存、事件绑定、启动】 =====================
const dom = {
  petWrap: document.querySelector(".pet-wrap"),
  petImg: document.getElementById('petImg'),
  talkBubble: document.getElementById("talkBubble"),
  levelEl: document.getElementById('level'),
  expBar: document.getElementById('expBar'),
  hungerBar: document.getElementById('hungerBar'),
  moodBar: document.getElementById('moodBar'),
  statusText: document.getElementById('statusText'),
  buffTip: document.getElementById("buffTip"),
  canClaimEl: document.getElementById("canClaim"),
  boxNextTip: document.getElementById("boxNextTip"),
  levelUpModal: document.getElementById('levelUpModal'),
  backpackModal: document.getElementById('backpackModal'),
  backpackList: document.getElementById('backpackList'),
  saveModal: document.getElementById('saveModal'),
  guideModal: document.getElementById('guideModal'),
  fileInput: document.getElementById('fileInput'),
  gameModal: document.getElementById("gameModal"),
  gameArea: document.getElementById("gameArea"),
  gameScoreEl: document.getElementById("gameScore"),
  gameTimerText: document.getElementById("gameTimerText"),
  gameTipEl: document.getElementById("gameTip"),

  btnBackpack: document.querySelector("#btnBackpack"),
  btnPet: document.querySelector("#btnPet"),
  btnRename: document.querySelector("#btnRename"),
  btnGame: document.querySelector("#btnGame"),
  btnSign: document.querySelector("#btnSign"),
  btnSaveMgr: document.querySelector("#btnSaveMgr"),
  btnCheckUpdate: document.querySelector("#btnCheckUpdate"),
  btnHardReload: document.querySelector("#btnHardReload"),
  soundBtn: document.getElementById("soundBtn")
};

function bindEvents(){
  dom.petWrap.addEventListener("click", ()=>{
    const data = AppStore.data;
    if(isNightTime() && !data.isNightAwake){
      wakePetAtNight();
    }
    showTalk();
    petClick();
  });
  dom.btnBackpack.addEventListener("click", openBackpack);
  dom.btnPet.addEventListener("click", petClick);
  dom.btnRename.addEventListener("click", renamePet);
  dom.btnGame.addEventListener("click", openGame);
  dom.btnSign.addEventListener("click", doSignIn);
  dom.btnSaveMgr.addEventListener("click", openSaveModal);
  dom.btnCheckUpdate.addEventListener("click", manualCheckUpdate);
  dom.btnHardReload.addEventListener("click", hardReload);
  if(dom.soundBtn) dom.soundBtn.addEventListener("click", toggleSound);

  dom.fileInput.onchange = function(e){
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      try{
        const imported = JSON.parse(ev.target.result);
        localStorage.setItem('mushroomPetData', JSON.stringify(imported));
        AppStore.data = AppStore.load();
        render();
        alert("✅存档导入成功");
        closeSaveModal();
      }catch(err){
        alert("❌存档文件解析失败");
      }
    }
    reader.readAsText(f);
    dom.fileInput.value = "";
  };

  document.addEventListener("visibilitychange", ()=>{
    if(document.hidden){
      autoDecay();
      clearInterval(decayTimer);
      if(gameRunning){
        endGame();
      }
    }else{
      autoDecay();
      startDecayLoop();
    }
  });
}

let decayTimer = null;
function startDecayLoop(){
  if(decayTimer) clearInterval(decayTimer);
  decayTimer = setInterval(autoDecay,5000);
}

// 只保留遮罩这一处行内onclick
window.modalMaskClose = modalMaskClose;

// 启动入口
function bootstrap(){
  AppStore.data = AppStore.load();
  bindEvents();
  checkGuide();
  render();
  startDecayLoop();
  setTimeout(()=>checkRemoteVersion(),1000);
}

bootstrap();
