import type { WorkoutSessionWithTitle } from "../types/workoutSession";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionStatsByWorkout = {
  sessionCount: number;
  lastSessionPerformedAt: string | null;
};

export function computeSessionStatsByWorkoutId(
  sessions: WorkoutSessionWithTitle[]
): Map<string, SessionStatsByWorkout> {
  const map = new Map<string, SessionStatsByWorkout>();
  for (const s of sessions) {
    const cur = map.get(s.workoutId) ?? { sessionCount: 0, lastSessionPerformedAt: null };
    cur.sessionCount += 1;
    if (
      !cur.lastSessionPerformedAt ||
      Date.parse(s.performedAt) > Date.parse(cur.lastSessionPerformedAt)
    ) {
      cur.lastSessionPerformedAt = s.performedAt;
    }
    map.set(s.workoutId, cur);
  }
  return map;
}

export function countSessionsInRollingWeek(sessions: WorkoutSessionWithTitle[], now = Date.now()) {
  const start = now - WEEK_MS;
  return sessions.filter((s) => {
    const t = Date.parse(s.performedAt);
    return Number.isFinite(t) && t >= start && t <= now;
  }).length;
}
