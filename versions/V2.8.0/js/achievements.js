import { AppConfig } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { toast, soundReward } from './util.js?v=20261110.7';

/**
 * 成就进度唯一来源：type -> 取当前值。
 * 新增成就只需要在 config 里加一条、在 PROGRESS 里加一行，
 * 判定与进度显示会同时生效（v2.6 的 nightCare 漏分支问题由此根治）。
 */
const PROGRESS = {
  totalFeed: d => d.totalFeed || 0,
  totalTouch: d => d.totalTouch || 0,
  level: d => d.level || 1,
  nightCareCount: d => d.nightCareCount || 0,
  totalGame: d => d.totalGame || 0,
  openBox: d => d.openBoxCount || 0,
  buffUse: d => d.buffUseCount || 0,
  signContinue: d => d.signContinueDay || 0,
  maxCombo: d => d.maxCombo || 0,
  totalFeedGame: d => d.totalFeedGame || 0,
  totalWhack: d => d.totalWhack || 0,
  bestWhack: d => d.bestWhack || 0,
  totalMemory: d => d.totalMemory || 0,
  memoryWins: d => d.memoryWins || 0
};

export function progressOf(ach, data = AppStore.data) {
  const fn = PROGRESS[ach.type];
  return fn ? fn(data) : 0;
}

export function progressText(ach, data = AppStore.data) {
  const cur = progressOf(ach, data);
  const v = Math.min(cur, ach.target);
  return `${v}/${ach.target}`;
}

export function checkAchievements() {
  const data = AppStore.data;
  let unlockedAny = false;
  for (const ach of AppConfig.ACHIEVE_LIST) {
    if (data.achieveDone.includes(ach.id)) continue;
    if (progressOf(ach, data) < ach.target) continue;
    data.achieveDone.push(ach.id);
    for (const [k, v] of Object.entries(ach.reward || {})) {
      data.bag[k] = (data.bag[k] || 0) + v;
    }
    unlockedAny = true;
    toast(`🏆 解锁成就【${ach.name}】`, 2600);
    soundReward();
  }
  if (unlockedAny) AppStore.save(data, true);
  return unlockedAny;
}
