const APP_VERSION = {
  major: 2,
  minor: 2
};
document.getElementById("verShow").innerText = `${APP_VERSION.major}.${APP_VERSION.minor}`;
const SW_TAG = `${APP_VERSION.major}.${APP_VERSION.minor}`;
// ===================== 【佛系数值配置】 =====================
const CONFIG = {
  baseDecay: 0.35,
  levelConsumeRate: 0.003,
  nightRate: 0.2,
  happyExtraConsume: 1.03,
  lowMoodConsume: 0.85,
  happyExpRate: 1.2,
  sadExpRate: 0.7,
  fullHungerLimit: 95,
  halfFeedLimit: 80,
  maxCacheBox: 99,
  nightWakeDuration: 90 * 1000 //夜间唤醒持续90秒
};
// 宝箱配置
const BOX_CONFIG = [
  {
    key: "bronze",
    name: "青铜宝箱",
    interval: 3 * 60 * 1000,
    reward: { grain: [2,4], fruit: [1,2] },
    weight: 100
  },
  {
    key: "silver",
    name: "白银宝箱",
    interval: 10 * 60 * 1000,
    reward: { cookie: [1,2], milk: [0,1] },
    weight: 50
  },
  {
    key: "gold",
    name: "黄金宝箱",
    interval: 30 * 60 * 1000,
    reward: { cake: [0,1], bell: [0,1] },
    weight: 20
  },
  {
    key: "rare",
    name: "稀有宝箱",
    interval: 60 * 60 * 1000,
    reward: { feather: [0,1], sweetPotion: [0,1] },
    weight: 8
  }
];
// 签到配置
const SIGN_CONFIG = {
  day1: {grain:3},
  day3: {cookie:2, milk:1},
  day7: {cake:2, bell:1},
  month: {sweetPotion:1}
};
// 成就配置
const ACHIEVE_LIST = [
  {id:"feed10", name:"小小投喂家", desc:"累计投喂10次", target:10, type:"totalFeed", reward:{bell:1}},
  {id:"touch50", name:"摸摸爱好者", desc:"累计抚摸团子50次", target:50, type:"totalTouch", reward:{feather:1}},
  {id:"lv5", name:"五级萌新", desc:"团子升到5级", target:5, type:"level", reward:{cake:3}},
  {id:"lv10", name:"十级陪伴", desc:"团子升到10级", target:10, type:"level", reward:{sweetPotion:1}},
  {id:"nightCare", name:"深夜陪伴", desc:"在夜间照料团子一次", target:1, type:"nightCare", reward:{milk:2}}
];
const ITEM_CONFIG = [
  {id:"grain", name:"口粮", type:"food", tag:"主食", desc:"基础主食，饱食+20，经验+15", addHunger:20, addMood:0, addExp:15, cd:0},
  {id:"cookie", name:"小饼干", type:"food", tag:"点心", desc:"美味点心，饱食+12，心情+30，经验+10", addHunger:12, addMood:30, addExp:10, cd:0},
  {id:"fruit", name:"鲜果", type:"food", tag:"水果", desc:"新鲜水果，饱食+16，心情+15，经验+20", addHunger:16, addMood:15, addExp:20, cd:0},
  {id:"cake", name:"小蛋糕", type:"food", tag:"甜品", desc:"甜甜的蛋糕，饱食+25，心情+40，经验+25", addHunger:25, addMood:40, addExp:25, cd:0},
  {id:"milk", name:"温牛奶", type:"food", tag:"饮品", desc:"暖暖的牛奶，饱食+10，心情+20，经验+8", addHunger:10, addMood:20, addExp:8, cd:0},
  {id:"ball", name:"弹力小球", type:"toy", tag:"玩具", desc:"圆圆的小球，心情+35，经验+5", addHunger:0, addMood:35, addExp:5, cd:8000},
  {id:"bell", name:"铃铛", type:"toy", tag:"玩具", desc:"叮铃铃铛，心情+25，经验+3", addHunger:0, addMood:25, addExp:3, cd:8000},
  {id:"feather", name:"羽毛逗棒", type:"toy", tag:"玩具", desc:"软软羽毛，心情+45，经验+8", addHunger:0, addMood:45, addExp:8, cd:10000},
  {id:"sweetPotion", name:"舒心药剂", type:"potion", tag:"增益", desc:"30分钟饱食心情衰减减半", buff:"slowDecay", buffTime:30 * 60 * 1000, addHunger:0, addMood:0, addExp:0, cd:0},
];
const DAY_START = 7;
const NIGHT_START = 21;
const TALK_LIST_DAY = [
  "今天天气不错~",
  "摸摸我吧！",
  "想吃好吃的~",
  "陪我玩好不好",
  "嘿嘿🥰",
  "今天好开心！",
  "快喂我零食",
  "我在这里哦"
];
const TALK_LIST_NIGHT = [
  "好困哦...",
  "晚安啦...zzz",
  "想睡觉啦",
  "小声一点哦",
  "让我休息一会",
  "梦里有好吃的"
];
// ====== 音效 ======
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
  document.getElementById('soundBtn').innerText = soundEnable ? "🔊音效开" : "🔇音效关";
}
// ===================== PWA serviceWorker 修复更新逻辑 =====================
let newWorker = null;
let swReg = null;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(`./service-worker.js`).then(reg => {
    swReg = reg;
    // 页面刚打开，如果已经有等待中的新版本（后台已经下载好）
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
//备用：微信等缓存顽固环境，强制带时间戳重新加载页面，localStorage存档不会丢失
function hardReload(){
  if(!confirm("将完全重载页面，宠物存档不会丢失，确认继续？")) return;
  location.href = `./index.html?_t=${Date.now()}`;
}
// 弹出更新确认，确认后skipWaiting并刷新页面
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
async function checkUpdate() {
  if(!navigator.serviceWorker){
    alert("当前环境不支持PWA更新");
    return;
  }
  const reg = swReg ?? await navigator.serviceWorker.getRegistration();
  if(!reg){ alert("无注册服务"); return; }
  try{
    await reg.update();
    // update之后，已经存在waiting，直接弹窗
    if(reg.waiting){
      showUpdateConfirm(reg.waiting);
    }else{
      alert("✅当前已经是最新版本");
    }
  }catch(err){
    alert("⚠️更新检查失败，请稍后重试");
    console.error(err);
  }
}
const defaultData = {
  petName:"团子",
  level:1,
  exp:0,
  expNeed:100,
  hunger:80,
  mood:80,
  lastActive:Date.now(),
  lastBoxGenTime: Date.now(),
  isPlaying: false,
  //夜间唤醒
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
  itemCd:{},
  buff:{
    slowDecayEnd:0
  },
  signLastDate:"",
  signContinueDay:0,
  signMonthGet:false,
  achieveDone:[]
};
function saveData(data){
  localStorage.setItem('mushroomPetData', JSON.stringify(data));
}
function loadData(){
  let raw = localStorage.getItem('mushroomPetData');
  let data;
  if(!raw){
    data = JSON.parse(JSON.stringify(defaultData));
    saveData(data);
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
    //旧存档兼容夜间唤醒字段
    if(typeof data.isNightAwake === "undefined") data.isNightAwake = false;
    if(typeof data.nightAwakeEnd === "undefined") data.nightAwakeEnd = 0;
    ITEM_CONFIG.forEach(item=>{
      if(typeof data.bag[item.id] === "undefined"){
        data.bag[item.id] = 0;
      }
    })
  }catch(e){
    alert("存档损坏，已重置团子");
    data = JSON.parse(JSON.stringify(defaultData));
    saveData(data);
  }
  return data;
}
let data = loadData();
// DOM缓存
const petImg = document.getElementById('petImg');
const levelEl = document.getElementById('level');
const expBar = document.getElementById('expBar');
const hungerBar = document.getElementById('hungerBar');
const moodBar = document.getElementById('moodBar');
const statusText = document.getElementById('statusText');
const levelUpModal = document.getElementById('levelUpModal');
const backpackModal = document.getElementById('backpackModal');
const backpackList = document.getElementById('backpackList');
const canClaimEl = document.getElementById("canClaim");
const saveModal = document.getElementById('saveModal');
const guideModal = document.getElementById('guideModal');
const fileInput = document.getElementById('fileInput');
const gameModal = document.getElementById("gameModal");
const gameArea = document.getElementById("gameArea");
const gameScoreEl = document.getElementById("gameScore");
const gameTimerText = document.getElementById("gameTimerText");
const gameTipEl = document.getElementById("gameTip");
const talkBubble = document.getElementById("talkBubble");
let animLock = false;
let gameMainTimer = null;
let bubbleSpawnTimer = null;
let score = 0;
let gameRunning = false;
let remainTime = 30;
//====夜间唤醒函数====
function wakePetAtNight(){
  if(!isNightTime()) return;
  data.isNightAwake = true;
  data.nightAwakeEnd = Date.now() + CONFIG.nightWakeDuration;
  saveData(data);
  //唤醒专属台词
  const bubble = talkBubble;
  bubble.innerText = "唔……被你叫醒啦✨";
  bubble.style.opacity = "1";
  setTimeout(()=>{ bubble.style.opacity = "0"; },2200);
}
function isNightTime(){
  const h = new Date().getHours();
  return h >= NIGHT_START || h < DAY_START;
}
function getTodayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function calcDecayPerMinute(){
  let base = CONFIG.baseDecay;
  if(Date.now() < data.buff.slowDecayEnd){
    base = base * 0.5;
  }
  const lvlRate = 1 + (data.level - 1) * CONFIG.levelConsumeRate;
  const dayRate = isNightTime() ? CONFIG.nightRate : 1;
  let moodRate = 1;
  if(data.mood > 80) moodRate = CONFIG.happyExtraConsume;
  else if(data.mood < 20) moodRate = CONFIG.lowMoodConsume;
  return base * lvlRate * dayRate * moodRate;
}
function showTalk(){
  const bubble = talkBubble;
  let txt;
  //夜间并且未唤醒才播放夜间台词；唤醒用白天台词
  if(isNightTime() && !data.isNightAwake){
    txt = TALK_LIST_NIGHT[Math.floor(Math.random() * TALK_LIST_NIGHT.length)];
  }else{
    txt = TALK_LIST_DAY[Math.floor(Math.random() * TALK_LIST_DAY.length)];
  }
  bubble.innerText = txt;
  bubble.style.opacity = "1";
  setTimeout(()=>{
    bubble.style.opacity = "0";
  }, 2200);
}
function petClick(){
  soundTap();
  //夜间睡觉状态点击执行唤醒
  if(isNightTime() && !data.isNightAwake){
    wakePetAtNight();
  }else{
    showTalk();
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
    checkAchievement("nightCare");
  }
  saveData(data);
  animLock = true;
  if(data.petTouchCount >=3){
    petImg.classList.add("bounce-anim");
    setTimeout(()=>{
      petImg.classList.remove("bounce-anim");
      animLock = false;
    },450);
    data.petTouchCount = 0;
  }else{
    petImg.classList.add("shy-anim");
    setTimeout(()=>{
      petImg.classList.remove("shy-anim");
      animLock = false;
    },400);
  }
  render();
}
function feedAnim(){
  soundFeed();
  if(animLock) return;
  animLock = true;
  petImg.classList.add("chew-anim");
  setTimeout(()=>{
    petImg.classList.remove("chew-anim");
    animLock = false;
  },350);
}
// ========== 宝箱系统 离线补发 ==========
function randomBoxType(){
  const totalWeight = BOX_CONFIG.reduce((s,item)=>s+item.weight,0);
  let r = Math.random() * totalWeight;
  for(const b of BOX_CONFIG){
    r -= b.weight;
    if(r <= 0) return b;
  }
  return BOX_CONFIG[0];
}
function getBoxInfo(key){
  return BOX_CONFIG.find(b=>b.key === key);
}
function tryGenBox(){
  const now = Date.now();
  const BOX_INTERVAL = 30 * 1000;
  while(data.boxQueue.length < CONFIG.maxCacheBox && now - data.lastBoxGenTime >= BOX_INTERVAL){
    const boxType = randomBoxType();
    data.boxQueue.push({
      type: boxType.key,
      createAt: now
    });
    data.lastBoxGenTime += BOX_INTERVAL;
  }
  saveData(data);
}
// 【修复版：汇总一次弹窗，不会浏览器阻塞】
// 【修复版：汇总一次弹窗，宝箱名称做数量合并，不会浏览器阻塞】
function claimAllBox(){
  console.log("点击领取，队列：", JSON.parse(JSON.stringify(data.boxQueue)));
  if(data.boxQueue.length === 0){
    alert("暂时没有宝箱，耐心等待生成~");
    return;
  }
  const list = [...data.boxQueue];
  data.boxQueue = [];
  saveData(data);

  //统计每种宝箱出现多少次
  const boxCountMap = {};
  const totalReward = {};

  list.forEach(box=>{
    const boxCfg = getBoxInfo(box.type);
    if(!boxCfg){
      console.warn("非法宝箱类型跳过：", box);
      return;
    }
    //统计宝箱数量
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

  //组装合并后的宝箱显示文本：青铜宝箱×3、白银宝箱×2
  const boxShowArr = Object.values(boxCountMap).map(item=>{
    return `${item.name}×${item.count}`;
  });

  //宝箱奖励写入背包
  for(const [k,v] of Object.entries(totalReward)){
    if(data.bag[k] === undefined) data.bag[k] = 0;
    data.bag[k] += v;
  }
  soundReward();
  const text = Object.entries(totalReward).map(([k,v])=>{
    const it = ITEM_CONFIG.find(x=>x.id===k);
    return `${it.name}×${v}`;
  }).join("\n");
  alert(`📦一共开启：${boxShowArr.join("、")}\n🎁全部奖励：${text}`);
  tryGenBox();
  saveData(data);
  renderBackpack();
  render();
}
// ========== 签到系统 ==========
function doSignIn(){
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
    reward = {...SIGN_CONFIG.day7};
  }else if(data.signContinueDay >=3){
    reward = {...SIGN_CONFIG.day3};
  }else{
    reward = {...SIGN_CONFIG.day1};
  }
  if(data.signContinueDay >=28 && !data.signMonthGet){
    Object.assign(reward, SIGN_CONFIG.month);
    data.signMonthGet = true;
  }
  for(const [k,v] of Object.entries(reward)){
    data.bag[k] += v;
  }
  soundReward();
  const text = Object.entries(reward).map(([k,v])=>{
    const it = ITEM_CONFIG.find(x=>x.id===k);
    return `${it.name}×${v}`;
  }).join(" ");
  alert(`✅签到成功！连续${data.signContinueDay}天\n🎁奖励：${text}`);
  saveData(data);
  renderBackpack();
}
// ========== 成就系统 ==========
function checkAchievement(type){
  for(const ach of ACHIEVE_LIST){
    if(data.achieveDone.includes(ach.id)) continue;
    let ok = false;
    if(ach.type === "totalFeed" && data.totalFeed >= ach.target) ok = true;
    if(ach.type === "totalTouch" && data.totalTouch >= ach.target) ok = true;
    if(ach.type === "level" && data.level >= ach.target) ok = true;
    if(ach.type === "nightCare" && type === "nightCare") ok = true;
    if(ok){
      data.achieveDone.push(ach.id);
      for(const [k,v] of Object.entries(ach.reward)){
        data.bag[k] += v;
      }
      soundReward();
      const text = Object.entries(ach.reward).map(([k,v])=>{
        const it = ITEM_CONFIG.find(x=>x.id===k);
        return `${it.name}×${v}`;
      }).join(" ");
      alert(`🏆解锁成就【${ach.name}】\n${ach.desc}\n🎁奖励：${text}`);
      saveData(data);
    }
  }
}
function updateClaimText(){
  canClaimEl.innerText = data.boxQueue.length;
}
// ========== A组：改名功能 ==========
function renamePet(){
  const newName = prompt("给你的团子起新名字：", data.petName);
  if(newName === null) return;
  const trimName = newName.trim();
  if(trimName.length ===0 || trimName.length>8){
    alert("名字不能为空，最多8个字！");
    return;
  }
  data.petName = trimName;
  saveData(data);
  render();
}
// ========== A组：Buff倒计时UI更新 ==========
function updateBuffUI(){
  const buffDom = document.getElementById("buffTip");
  if(!buffDom) return;
  const now = Date.now();
  if(now < data.buff.slowDecayEnd){
    const leftSec = Math.ceil((data.buff.slowDecayEnd - now)/1000);
    const m = Math.floor(leftSec / 60);
    const s = leftSec % 60;
    buffDom.innerText = `✨舒心药剂生效，剩余 ${m}分${s}秒`;
    buffDom.style.display = "block";
  }else{
    buffDom.style.display = "none";
  }
}
// ========== A组：宝箱下一轮倒计时UI ==========
function updateBoxNextUI(){
  const boxNextTip = document.getElementById("boxNextTip");
  if(!boxNextTip) return;
  const now = Date.now();
  const BOX_INTERVAL = 30 * 1000;
  const nextTime = data.lastBoxGenTime + BOX_INTERVAL;
  if(data.boxQueue.length >= CONFIG.maxCacheBox){
    boxNextTip.innerText = "宝箱队列已满，先领取！";
  }else{
    const diff = nextTime - now;
    if(diff <=0){
      boxNextTip.innerText = "✅可以生成新宝箱";
    }else{
      boxNextTip.innerText = `下一个宝箱：${Math.ceil(diff/1000)}秒`;
    }
  }
}
// ========== B组：背包分类渲染 + tooltip【修复冒泡】 ==========
let backpackTab = "all";
function switchBackpackTab(tabKey){
  backpackTab = tabKey;
  renderBackpack();
}
function renderBackpack(){
  updateClaimText();
  updateBoxNextUI();
  backpackList.innerHTML = "";
  const tabWrap = document.createElement("div");
  tabWrap.className = "bp-tab-wrap";
  const tabs = [
    {k:"all", name:"全部"},
    {k:"food", name:"食物"},
    {k:"toy", name:"玩具"},
    {k:"potion", name:"药剂"}
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
      e.stopPropagation(); //阻止冒泡，不会关闭弹窗
      switchBackpackTab(t.k);
    }
    tabWrap.appendChild(btn);
  })
  backpackList.appendChild(tabWrap);
  const itemWrap = document.createElement("div");
  itemWrap.className = "bp-items-wrap";
  ITEM_CONFIG.forEach(item=>{
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
        e.stopPropagation(); //阻止冒泡
        useItem(item);
      }
    }
    itemWrap.appendChild(div);
  })
  backpackList.appendChild(itemWrap);
}
function openBackpack(){
  tryGenBox();
  renderBackpack();
  backpackModal.style.display="flex";
}
function closeBackpack(){
  backpackModal.style.display="none";
}
function useItem(item){
  if(data.bag[item.id] <=0) return;
  const now = Date.now();
  if(item.cd>0 && data.itemCd[item.id] && now < data.itemCd[item.id]) return;
  feedAnim();
  data.bag[item.id]--;
  data.totalFeed++;
  checkAchievement("totalFeed");
  //使用玩具，夜间睡觉状态唤醒；食物不唤醒
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
    alert("✨舒心药剂生效！30分钟衰减减半");
  }else{
    if(item.addExp>0){
      addExp(item.addExp);
    }
  }
  data.lastActive = Date.now();
  saveData(data);
  render();
  renderBackpack();
  closeBackpack();
}
// ========== 泡泡游戏 ==========
function openGame(){
  const now = Date.now();
  if(now < data.gameCd){
    const left = Math.ceil((data.gameCd - now)/1000);
    alert(`🎮游戏冷却：${left}秒`);
    return;
  }
  gameModal.style.display="flex";
}
function closeGame(){
  clearInterval(gameMainTimer);
  clearInterval(bubbleSpawnTimer);
  gameArea.innerHTML = "";
  gameRunning = false;
  gameModal.style.display="none";
}
function startGame(){
  if(gameRunning) return;
  score = 0;
  remainTime = 30;
  gameScoreEl.innerText = score;
  gameTimerText.innerText = remainTime;
  gameTipEl.innerText = "点击泡泡得分！限时30秒";
  gameRunning = true;
  gameArea.innerHTML = "";
  gameMainTimer = setInterval(()=>{
    remainTime--;
    gameTimerText.innerText = remainTime;
    if(remainTime <=0){
      endGame();
    }
  },1000);
  bubbleSpawnTimer = setInterval(()=>{
    if(!gameRunning) return;
    const b = document.createElement("div");
    b.className = "bubble";
    const w = gameArea.clientWidth - 44;
    const h = gameArea.clientHeight - 44;
    b.style.left = Math.random()*w + "px";
    b.style.top = Math.random()*h + "px";
    b.innerText = "+1";
    b.onclick = ()=>{
      soundGameHit();
      score++;
      gameScoreEl.innerText = score;
      b.remove();
    }
    gameArea.appendChild(b);
    setTimeout(()=>b.remove(),2000);
  },700);
}
function endGame(){
  soundGameEnd();
  clearInterval(gameMainTimer);
  clearInterval(bubbleSpawnTimer);
  gameRunning = false;
  data.totalGame++;
  let reward = {};
  if(score >=40){
    reward.grain = 3; reward.cookie=2; reward.fruit=1;
    const r = Math.random();
    if(r<0.25) reward.milk = 1;
    if(r<0.12) reward.bell =1;
    if(r<0.04) reward.feather =1;
    if(r<0.015) reward.sweetPotion =1;
  }else if(score >=20){
    reward.grain =2; reward.cookie=1;
    const r = Math.random();
    if(r<0.15) reward.milk=1;
    if(r<0.06) reward.bell=1;
  }else if(score >=10){
    reward.grain=2;
  }else{
    reward.grain=1;
  }
  for(const [k,v] of Object.entries(reward)){
    data.bag[k] += v;
  }
  data.gameCd = Date.now() + 60*1000;
  saveData(data);
  renderBackpack();
  const txt = Object.entries(reward).map(([k,v])=>{
    const it = ITEM_CONFIG.find(x=>x.id===k);
    return `${it.name}×${v}`;
  }).join(" ");
  alert(`⏱游戏结束！得分：${score}\n🎁奖励：${txt}`);
  gameTipEl.innerText="游戏结束";
}
function checkGuide(){
  if(localStorage.getItem("hideGuide") !== "1"){
    guideModal.style.display="flex";
  }
}
function closeGuideModal(){
  const ck = document.getElementById("noMoreGuide");
  if(ck.checked){
    localStorage.setItem("hideGuide","1");
  }
  guideModal.style.display="none";
}
function openSaveModal(){
  saveModal.style.display="flex";
}
function closeSaveModal(){
  saveModal.style.display="none";
}
function exportSave(){
  const str = JSON.stringify(data,null,2);
  const blob = new Blob([str],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mushroom_save.json";
  a.click();
  URL.revokeObjectURL(url);
}
fileInput.onchange = function(e){
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const imported = JSON.parse(ev.target.result);
      localStorage.setItem('mushroomPetData', JSON.stringify(imported));
      data = loadData();
      render();
      alert("✅存档导入成功");
      closeSaveModal();
    }catch(err){
      alert("❌存档文件解析失败");
    }
  }
  reader.readAsText(f);
  fileInput.value = "";
}
function pet(){
  petClick();
}
// 离线衰减【修复：后台宝箱累计】
function autoDecay(){
  const now = Date.now();
  const gapMin = (now - data.lastActive)/60000;
  if(gapMin <=0){
    data.lastActive = now;
    tryGenBox();
    saveData(data);
    return;
  }
  const perMin = calcDecayPerMinute();
  const sub = perMin * gapMin;
  data.hunger = Math.max(0, data.hunger - sub);
  data.mood = Math.max(0, data.mood - sub);
  data.lastActive = now;
  tryGenBox();
  saveData(data);
  render();
}
function checkState(){
  const now = Date.now();
  if(isNightTime()){
    document.body.classList.add("night");
  }else{
    document.body.classList.remove("night");
  }
  //清醒时间到期自动关闭唤醒
  if(isNightTime() && data.isNightAwake){
    if(now >= data.nightAwakeEnd){
      data.isNightAwake = false;
      saveData(data);
    }
  }
  //夜间并且没有被唤醒 →睡觉模式
  if (isNightTime() && !data.isNightAwake) {
    petImg.src = "./sleep.png";
    statusText.innerText = `${data.petName}：💤呼呼睡觉中`;
    return;
  }
  //夜间被唤醒 / 白天共用正常状态逻辑
  if (data.isPlaying) {
    petImg.src = "./play.png";
    statusText.innerText = `${data.petName}：玩得好开心！🥰`;
  } else if (data.hunger <= 15 || data.mood <= 15) {
    petImg.src = "./sad.png";
    statusText.innerText = `${data.petName}：呜呜，快来陪我`;
  } else if (data.hunger <= 30) {
    petImg.src = "./hungry.png";
    statusText.innerText = `${data.petName}：肚子饿饿，想吃东西`;
  } else if (data.mood >= 85) {
    petImg.src = "./happy.png";
    statusText.innerText = `${data.petName}：今天超开心！✨`;
  } else if (data.mood < 30 && data.hunger > 40) {
    petImg.src = "./shy.png";
    statusText.innerText = `${data.petName}：有点闷闷的`;
  } else if (data.hunger >=70 && data.mood >=70) {
    petImg.src = "./normal.png";
    statusText.innerText = `${data.petName}：乖乖待着哦~`;
  } else {
    petImg.src = "./normal.png";
    statusText.innerText = `${data.petName}：乖乖待着哦~`;
  }
  //夜间清醒状态追加倒计时提示
  if(isNightTime() && data.isNightAwake){
    const leftSec = Math.ceil((data.nightAwakeEnd - now)/1000);
    statusText.innerText += ` 🌙清醒${leftSec}s`;
  }
}
function render(){
  levelEl.innerText = data.level;
  const expPercent = (data.exp / data.expNeed) *100;
  expBar.style.width = expPercent + "%";
  hungerBar.style.width = data.hunger + "%";
  moodBar.style.width = data.mood + "%";
  checkState();
  checkAchievement("");
  tryGenBox();
  updateBuffUI();
  updateBoxNextUI();
  // =====每次渲染同步团子名字到页面标题、浏览器标签
  const pageTitleEl = document.querySelector('#pageTitle span');
  const docTitleEl = document.getElementById('docTitle');
  if(pageTitleEl) pageTitleEl.innerText = data.petName;
  if(docTitleEl) docTitleEl.textContent = `🍄${data.petName}电子宠物`;
}
function addExp(num){
  data.exp += num;
  data.totalExpGained += num;
  while(data.exp >= data.expNeed){
    soundLevelUp();
    data.exp -= data.expNeed;
    data.level += 1;
    data.expNeed = Math.floor(data.expNeed * 1.35);
    levelUpModal.style.display = "flex";
    checkAchievement("level");
  }
  saveData(data);
  render();
}
function closeLevelModal(){
  levelUpModal.style.display="none";
}
function resetPet(){
  if(!confirm("确定重置？所有进度清空！")) return;
  data = JSON.parse(JSON.stringify(defaultData));
  saveData(data);
  render();
}
// ========== A组：页面可见性，切后台自动结束泡泡游戏 ==========
let decayTimer = null;
function startDecayLoop(){
  if(decayTimer) clearInterval(decayTimer);
  decayTimer = setInterval(autoDecay,5000);
}
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
})
startDecayLoop();
// 弹窗遮罩点击关闭：只点击最外层modal才关闭，点击内部modal‑content不关闭
function modalMaskClose(event){
  if(event.target !== event.currentTarget) return;
  const id = event.target.id;
  if(id === "backpackModal") closeBackpack();
  if(id === "gameModal") closeGame();
  if(id === "saveModal") closeSaveModal();
  if(id === "guideModal") closeGuideModal();
}
window.modalMaskClose = modalMaskClose;
// 全局挂载，给html onclick调用
window.hardReload = hardReload;
window.claimAllBox = claimAllBox;
window.doSignIn = doSignIn;
window.pet = pet;
window.toggleSound = toggleSound;
window.openBackpack = openBackpack;
window.closeBackpack = closeBackpack;
window.openGame = openGame;
window.startGame = startGame;
window.closeGame = closeGame;
window.openSaveModal = openSaveModal;
window.closeSaveModal = closeSaveModal;
window.exportSave = exportSave;
window.checkUpdate = checkUpdate;
window.resetPet = resetPet;
window.closeLevelModal = closeLevelModal;
window.closeGuideModal = closeGuideModal;
window.renamePet = renamePet;
window.switchBackpackTab = switchBackpackTab;
checkGuide();
render();
