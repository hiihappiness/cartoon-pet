import { AppConfig } from './config.js?v=20261110.7';
import { AppStore } from './store.js?v=20261110.7';
import { toast, formatRewardList, soundReward } from './util.js?v=20261110.7';

/** 距离冷却结束还有多少秒；0 表示可用 */
export function cooldownLeft(cdKey) {
  const end = AppStore.data[cdKey] || 0;
  const left = Math.ceil((end - Date.now()) / 1000);
  return left > 0 ? left : 0;
}

/**
 * 开始一局：冷却在「开始」时就写入，避免局中反复按开始重开刷奖励。
 * 返回 true 表示可以开始。
 */
export function beginGame(game) {
  const left = cooldownLeft(game.cdKey);
  if (left > 0) {
    toast(`${game.icon}${game.name}冷却中，还要 ${left} 秒`, 2200);
    return false;
  }
  AppStore.data[game.cdKey] = Date.now() + game.cooldown;
  AppStore.save(AppStore.data, true);
  return true;
}

/** 发奖励并返回文案 */
export function grantReward(reward) {
  const data = AppStore.data;
  for (const [k, v] of Object.entries(reward || {})) {
    data.bag[k] = (data.bag[k] || 0) + v;
  }
  AppStore.save(data, true);
  return formatRewardList(reward);
}

/** 记录最高分（只升不降） */
export function recordBest(key, value) {
  const data = AppStore.data;
  if (typeof data[key] !== "number") data[key] = 0;
  if (value > data[key]) data[key] = value;
}

export function gameById(id) {
  return AppConfig.GAMES.find(g => g.id === id);
}

/** 结算时统一提示 */
export function finishToast(icon, title, detail, rewardText) {
  soundReward();
  const lines = [title];
  if (detail) lines.push(detail);
  if (rewardText) lines.push("🎁 " + rewardText);
  toast(`${icon} ${lines.join("\n")}`, 3200);
}
