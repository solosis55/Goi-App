import type { ActiveWorkoutSession } from "../types/workoutSessionPerform";

export function sessionElapsedMs(session: ActiveWorkoutSession, nowMs = Date.now()): number {
  const start = Date.parse(session.startedAt);
  if (!Number.isFinite(start)) return 0;
  const pausedTotal = session.totalPausedMs ?? 0;
  const endMs = session.pausedAt ? Date.parse(session.pausedAt) : nowMs;
  if (!Number.isFinite(endMs)) return 0;
  return Math.max(0, endMs - start - pausedTotal);
}

export function formatSessionElapsed(ms: number): string {
  if (ms < 0) return "0 min";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function isSessionTimerPaused(session: ActiveWorkoutSession): boolean {
  return Boolean(session.pausedAt);
}

export function toggleSessionPause(session: ActiveWorkoutSession): ActiveWorkoutSession {
  if (session.pausedAt) {
    const pauseStart = Date.parse(session.pausedAt);
    const extra = Number.isFinite(pauseStart) ? Math.max(0, Date.now() - pauseStart) : 0;
    return {
      ...session,
      pausedAt: null,
      totalPausedMs: (session.totalPausedMs ?? 0) + extra,
    };
  }
  return { ...session, pausedAt: new Date().toISOString() };
}
