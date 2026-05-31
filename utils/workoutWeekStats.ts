const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionsThisWeekCount(
  sessions: { performedAt: string }[],
  nowMs = Date.now()
): number {
  const cutoff = nowMs - WEEK_MS;
  return sessions.filter((s) => new Date(s.performedAt).getTime() >= cutoff).length;
}
