import type { WorkoutSessionWithTitle } from "../types/workoutSession";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Conteo de sesiones por día en los últimos 7 días (índice 0 = hace 6 días, 6 = hoy). */
export function sessionsPerDayLast7(sessions: WorkoutSessionWithTitle[], now = Date.now()): number[] {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const counts = Array.from({ length: 7 }, () => 0);

  for (const s of sessions) {
    const t = Date.parse(s.performedAt);
    if (!Number.isFinite(t)) continue;
    const dayStart = new Date(t);
    dayStart.setHours(0, 0, 0, 0);
    const diffDays = Math.round((todayMs - dayStart.getTime()) / DAY_MS);
    if (diffDays >= 0 && diffDays < 7) {
      counts[6 - diffDays] += 1;
    }
  }

  return counts;
}

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

/** Etiquetas de día para el sparkline (índice 0 = hace 6 días, 6 = hoy). */
export function last7DayLabels(now = new Date()): string[] {
  const today = now.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const dayIdx = (today - 6 + i + 7) % 7;
    return DAY_LABELS[dayIdx];
  });
}
