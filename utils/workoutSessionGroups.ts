import type { WorkoutSessionWithTitle } from "../types/workoutSession";

export type SessionDayGroup = {
  key: string;
  label: string;
  sessions: WorkoutSessionWithTitle[];
};

function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(dayStart: number, now = Date.now()): string {
  const today = startOfLocalDay(now);
  const yesterday = today - 24 * 60 * 60 * 1000;
  if (dayStart === today) return "Hoy";
  if (dayStart === yesterday) return "Ayer";
  const weekAgo = today - 6 * 24 * 60 * 60 * 1000;
  if (dayStart >= weekAgo) {
    return new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(new Date(dayStart));
  }
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(dayStart));
}

/** Agrupa sesiones por día local (más recientes primero). */
export function groupSessionsByDay(
  sessions: WorkoutSessionWithTitle[],
  now = Date.now()
): SessionDayGroup[] {
  const sorted = [...sessions].sort((a, b) => Date.parse(b.performedAt) - Date.parse(a.performedAt));
  const groups: SessionDayGroup[] = [];
  const indexByDay = new Map<number, number>();

  for (const session of sorted) {
    const t = Date.parse(session.performedAt);
    if (!Number.isFinite(t)) continue;
    const dayStart = startOfLocalDay(t);
    let idx = indexByDay.get(dayStart);
    if (idx === undefined) {
      idx = groups.length;
      indexByDay.set(dayStart, idx);
      groups.push({
        key: String(dayStart),
        label: dayLabel(dayStart, now),
        sessions: [],
      });
    }
    groups[idx].sessions.push(session);
  }

  return groups;
}
