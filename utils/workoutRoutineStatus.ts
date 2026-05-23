export type RoutineTrainStatus = "never" | "this_week" | "recent" | "stale";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getRoutineTrainStatus(
  lastSessionAt: string | null,
  sessionCount: number,
  now = Date.now()
): RoutineTrainStatus {
  if (sessionCount === 0 || !lastSessionAt) return "never";
  const t = Date.parse(lastSessionAt);
  if (!Number.isFinite(t)) return "never";
  const days = (now - t) / DAY_MS;
  if (days <= 7) return "this_week";
  if (days <= 21) return "recent";
  return "stale";
}

export function routineStatusLabel(status: RoutineTrainStatus): string {
  switch (status) {
    case "never":
      return "Sin entrenar";
    case "this_week":
      return "Esta semana";
    case "recent":
      return "Reciente";
    case "stale":
      return "Hace tiempo";
  }
}

export function routineStatusAccentColor(status: RoutineTrainStatus): string {
  switch (status) {
    case "never":
      return "rgba(163, 163, 163, 0.55)";
    case "this_week":
      return "rgba(212, 175, 55, 0.85)";
    case "recent":
      return "rgba(134, 239, 172, 0.65)";
    case "stale":
      return "rgba(251, 191, 36, 0.55)";
  }
}
