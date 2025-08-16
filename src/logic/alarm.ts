export interface AlarmConfig {
  enabled: boolean;
  hour: number;
  minute: number;
}

export function willTriggerNow(
  prev: Date,
  now: Date,
  cfg: AlarmConfig
): boolean {
  if (!cfg.enabled) return false;
  const prevMin = Math.floor(prev.getTime() / 60000);
  const nowMin = Math.floor(now.getTime() / 60000);
  const crossedMinute = prevMin !== nowMin;
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  return crossedMinute && h === cfg.hour && m === cfg.minute;
}

export function shouldHourlyChime(
  prev: Date,
  now: Date,
  enabled: boolean
): boolean {
  if (!enabled) return false;
  const prevHour = prev.getUTCHours();
  const nowHour = now.getUTCHours();
  return prevHour !== nowHour && now.getUTCMinutes() === 0;
}
