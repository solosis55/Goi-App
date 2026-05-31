import type { FeedNotification } from "../types/post";

export type NotificationDayGroup = {
  key: string;
  title: string;
  items: FeedNotification[];
};

function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayTitle(dayStartMs: number, todayStart: number, yesterdayStart: number): string {
  if (dayStartMs >= todayStart) return "Hoy";
  if (dayStartMs >= yesterdayStart) return "Ayer";
  return new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "short" }).format(
    new Date(dayStartMs)
  );
}

export function groupNotificationsByDay(items: FeedNotification[]): NotificationDayGroup[] {
  const now = Date.now();
  const todayStart = startOfLocalDay(now);
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  const buckets = new Map<string, FeedNotification[]>();
  const titles = new Map<string, string>();

  for (const n of items) {
    const t = new Date(n.createdAt).getTime();
    const dayStart = startOfLocalDay(t);
    let key: string;
    let title: string;
    if (dayStart >= todayStart) {
      key = "today";
      title = "Hoy";
    } else if (dayStart >= yesterdayStart) {
      key = "yesterday";
      title = "Ayer";
    } else if (dayStart >= weekStart) {
      key = `week-${dayStart}`;
      title = dayTitle(dayStart, todayStart, yesterdayStart);
    } else {
      key = `older-${dayStart}`;
      title = dayTitle(dayStart, todayStart, yesterdayStart);
    }
    if (!buckets.has(key)) {
      buckets.set(key, []);
      titles.set(key, title);
    }
    buckets.get(key)!.push(n);
  }

  const order = ["today", "yesterday", ...[...buckets.keys()].filter((k) => k.startsWith("week-")).sort().reverse(), ...[...buckets.keys()].filter((k) => k.startsWith("older-")).sort().reverse()];

  const seen = new Set<string>();
  const groups: NotificationDayGroup[] = [];
  for (const key of order) {
    if (seen.has(key) || !buckets.has(key)) continue;
    seen.add(key);
    groups.push({ key, title: titles.get(key) ?? key, items: buckets.get(key)! });
  }
  return groups;
}

export function isToday(iso: string): boolean {
  const todayStart = startOfLocalDay(Date.now());
  return startOfLocalDay(new Date(iso).getTime()) >= todayStart;
}
