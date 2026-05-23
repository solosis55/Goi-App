const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Semanas consecutivas (hacia atrás desde hoy) con al menos una sesión. */
export function computeWorkoutStreakWeeks(
  sessionTimes: number[],
  now = Date.now()
): number {
  if (sessionTimes.length === 0) return 0;

  const weekStarts = new Set<number>();
  for (const t of sessionTimes) {
    if (!Number.isFinite(t)) continue;
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - diffToMonday);
    weekStarts.add(d.getTime());
  }

  const todayStart = startOfLocalDay(now);
  const today = new Date(todayStart);
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  today.setDate(today.getDate() - diffToMonday);
  let cursor = today.getTime();

  let streak = 0;
  while (weekStarts.has(cursor)) {
    streak += 1;
    cursor -= WEEK_MS;
  }
  return streak;
}
