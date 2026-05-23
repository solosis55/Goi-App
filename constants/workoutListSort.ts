import type { Workout } from "../types/workout";

export type WorkoutListSort = "recent" | "alpha" | "mostSessions";

export const WORKOUT_LIST_SORT_OPTIONS: { id: WorkoutListSort; label: string }[] = [
  { id: "recent", label: "Recientes" },
  { id: "alpha", label: "A–Z" },
  { id: "mostSessions", label: "Más usadas" },
];

export function sortWorkouts(
  workouts: Workout[],
  sort: WorkoutListSort,
  sessionCountById: Map<string, number>,
  lastSessionById: Map<string, string | null>
): Workout[] {
  const list = [...workouts];
  if (sort === "alpha") {
    list.sort((a, b) => a.title.localeCompare(b.title, "es"));
    return list;
  }
  if (sort === "mostSessions") {
    list.sort((a, b) => (sessionCountById.get(b.id) ?? 0) - (sessionCountById.get(a.id) ?? 0));
    return list;
  }
  list.sort((a, b) => {
    const ta = lastSessionById.get(a.id) ?? a.updatedAt ?? "";
    const tb = lastSessionById.get(b.id) ?? b.updatedAt ?? "";
    return tb.localeCompare(ta);
  });
  return list;
}
