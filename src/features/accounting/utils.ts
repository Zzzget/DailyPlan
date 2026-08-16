export function formatAmount(value: number): string {
  return value.toFixed(2);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const isSameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');

  if (isSameDay) {
    return '今天';
  }
  if (isYesterday) {
    return '昨天';
  }
  return `${mm}月${dd}日`;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mi = `${date.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mi}`;
}

/** Date 转日历组件使用的 YYYY-MM-DD 键，按本地时区取年月日，避免 UTC 偏移导致日期错一天 */
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD 转「M月D日」展示文案，用于范围提示条 */
export function formatDayLabel(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${m}月${d}日`;
}

/** YYYY-MM-DD 转「M/D」短文案，用于日历按钮上的紧凑展示 */
export function formatDayShort(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${m}/${d}`;
}

/**
 * 判断账单时间戳是否落在 [startKey, endKey] 闭区间内
 * 入参为 YYYY-MM-DD 本地日期；结束日取 23:59:59.999，保证结束日当天的账单全部计入
 */
export function isWithinDateRange(
  timestamp: number,
  startKey: string,
  endKey: string,
): boolean {
  const [sy, sm, sd] = startKey.split('-').map(Number);
  const [ey, em, ed] = endKey.split('-').map(Number);
  const startTs = new Date(sy, sm - 1, sd).getTime();
  const endTs = new Date(ey, em - 1, ed, 23, 59, 59, 999).getTime();
  return timestamp >= startTs && timestamp <= endTs;
}
