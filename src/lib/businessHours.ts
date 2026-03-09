// 営業時間ユーティリティ
// 平日 9:00〜18:00 / 土日祝 10:00〜17:00
// 定休：毎週水曜・第2火曜・第3日曜

export interface BusinessStatus {
  open: boolean;
  label: string;
  color: string;   // Tailwind bg class
  dot: string;     // Tailwind bg class for dot
}

const weekOfMonth = (date: Date) => Math.ceil(date.getDate() / 7);

export const isClosedDay = (date: Date): boolean => {
  const day = date.getDay();
  const week = weekOfMonth(date);
  return (
    day === 3 ||                        // 毎週水曜
    (day === 2 && week === 2) ||        // 第2火曜
    (day === 0 && week === 3)           // 第3日曜
  );
};

// その日の営業開始・終了時刻（分）を返す。定休日はnull
const getHours = (date: Date): { open: number; close: number } | null => {
  if (isClosedDay(date)) return null;
  const day = date.getDay();
  if (day >= 1 && day <= 5) return { open: 9 * 60, close: 18 * 60 };
  return { open: 10 * 60, close: 17 * 60 };
};

// 次の営業開始日時を返す
const getNextOpenDate = (from: Date): Date => {
  const next = new Date(from);
  for (let i = 1; i <= 14; i++) {
    next.setDate(from.getDate() + i);
    next.setHours(0, 0, 0, 0);
    const h = getHours(next);
    if (h) {
      next.setHours(Math.floor(h.open / 60), h.open % 60, 0, 0);
      return next;
    }
  }
  return next;
};

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

const formatNextOpen = (next: Date, now: Date): string => {
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(todayStart.getDate() + 1);
  const afterTomorrowStart = new Date(todayStart); afterTomorrowStart.setDate(todayStart.getDate() + 2);

  const h = `${next.getHours()}:${String(next.getMinutes()).padStart(2, '0')}`;

  if (next >= todayStart && next < tomorrowStart) return `本日 ${h}より営業`;
  if (next >= tomorrowStart && next < afterTomorrowStart) return `明日(${DAY_NAMES[next.getDay()]}) ${h}より営業`;
  const month = next.getMonth() + 1;
  const date = next.getDate();
  return `${month}/${date}(${DAY_NAMES[next.getDay()]}) ${h}より営業`;
};

export const getBusinessStatus = (): BusinessStatus => {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  const hours = getHours(now);

  // 営業時間内
  if (hours && time >= hours.open && time < hours.close) {
    const closeH = `${Math.floor(hours.close / 60)}:${String(hours.close % 60).padStart(2, '0')}`;
    return { open: true, label: `営業中 〜${closeH}`, color: 'bg-green-600', dot: 'bg-green-300' };
  }

  // 次の営業日時を計算
  const nextOpen = getNextOpenDate(now);
  const label = formatNextOpen(nextOpen, now);

  // 定休日
  if (isClosedDay(now)) {
    return { open: false, label: `定休日 ／ ${label}`, color: 'bg-red-600', dot: 'bg-red-400' };
  }

  // 営業時間外（当日）
  return { open: false, label, color: 'bg-amber-600', dot: 'bg-amber-400' };
};
