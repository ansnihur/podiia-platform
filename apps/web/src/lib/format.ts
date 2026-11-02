/**
 * All dates are shown in Kyiv time, whatever the server's timezone is
 * (the thesis version showed UTC on Vercel — this fixes that).
 */
export const TZ = 'Europe/Kyiv';

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('uk-UA', { timeZone: TZ, ...opts });

export const dayNum = (d: Date) => fmt({ day: '2-digit' }).format(d);
export const monthShort = (d: Date) => fmt({ month: 'short' }).format(d).replace('.', '').toUpperCase().slice(0, 4);
export const monthLong = (d: Date) => fmt({ month: 'long' }).format(d);
export const weekdayShort = (d: Date) => {
  const w = fmt({ weekday: 'short' }).format(d);
  return w.charAt(0).toUpperCase() + w.slice(1);
};
export const time = (d: Date) => fmt({ hour: '2-digit', minute: '2-digit' }).format(d);
/** "Чт, 5 листопада · 13:00" */
export const dateLine = (d: Date) =>
  `${weekdayShort(d)}, ${fmt({ day: 'numeric', month: 'long' }).format(d)} · ${time(d)}`;

export function isWeekendInKyiv(d: Date) {
  const w = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d);
  return w === 'Sat' || w === 'Sun';
}

/** "через 3 дні", "сьогодні", "завтра" */
export function relativeDays(d: Date, now = new Date()) {
  const key = (x: Date) => fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(x);
  const a = new Date(key(now).split('.').reverse().join('-'));
  const b = new Date(key(d).split('.').reverse().join('-'));
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (diff === 0) return 'сьогодні';
  if (diff === 1) return 'завтра';
  if (diff < 0) return 'минула';
  return `через ${diff} ${plural(diff, 'день', 'дні', 'днів')}`;
}

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** Scale tag that makes small and big events equally legible: "до 8 людей", "1500+ людей". */
export function scaleLabel(capacity: number | null) {
  if (capacity == null) return 'без обмежень';
  if (capacity >= 500) return `${capacity}+ людей`;
  return `до ${capacity} ${plural(capacity, 'людини', 'людей', 'людей')}`;
}

export function priceLabel(kopecks: number | null) {
  if (kopecks == null || kopecks === 0) return 'Безкоштовно';
  return `від ${Math.round(kopecks / 100)} грн`;
}

export function greeting(now = new Date()) {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(now));
  if (h < 5) return 'Доброї ночі';
  if (h < 12) return 'Доброго ранку';
  if (h < 18) return 'Добрий день';
  return 'Добрий вечір';
}

export const monthNum = (d: Date) => fmt({ month: '2-digit' }).format(d);
