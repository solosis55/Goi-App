import { MUSCLE_LABEL } from "./catalogExerciseDisplay";
import type { Exercise } from "../types/exercise";
import type { UsageStore } from "./catalogExerciseUsage";

export type CatalogSortMode = "alpha" | "muscle" | "recent" | "frequent";

export const CATALOG_SORT_OPTIONS: { mode: CatalogSortMode; label: string }[] = [
  { mode: "alpha", label: "A–Z" },
  { mode: "muscle", label: "Músculo" },
  { mode: "frequent", label: "Más usados" },
  { mode: "recent", label: "Recientes" },
];

export function sortCatalogExercises(
  list: Exercise[],
  mode: CatalogSortMode,
  usage: UsageStore,
): Exercise[] {
  const copy = [...list];
  if (mode === "alpha") {
    return copy.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  if (mode === "frequent") {
    return copy.sort((a, b) => {
      const ca = usage[a.id]?.count ?? 0;
      const cb = usage[b.id]?.count ?? 0;
      if (cb !== ca) return cb - ca;
      return a.name.localeCompare(b.name, "es");
    });
  }
  if (mode === "recent") {
    return copy.sort((a, b) => {
      const ta = usage[a.id]?.lastAt ?? 0;
      const tb = usage[b.id]?.lastAt ?? 0;
      if (tb !== ta) return tb - ta;
      return a.name.localeCompare(b.name, "es");
    });
  }
  return copy.sort((a, b) => {
    const ma = primaryMuscleLabel(a);
    const mb = primaryMuscleLabel(b);
    const g = ma.localeCompare(mb, "es");
    if (g !== 0) return g;
    return a.name.localeCompare(b.name, "es");
  });
}

export function primaryMuscleSlug(exercise: Exercise): string {
  return exercise.muscles?.[0] ?? "_otros";
}

export function primaryMuscleLabel(exercise: Exercise): string {
  const slug = primaryMuscleSlug(exercise);
  if (slug === "_otros") return "Otros";
  return MUSCLE_LABEL[slug] ?? slug;
}

export type CatalogSection = { title: string; key: string; data: Exercise[] };

export function groupExercisesByMuscle(exercises: Exercise[]): CatalogSection[] {
  const map = new Map<string, Exercise[]>();
  for (const ex of exercises) {
    const slug = primaryMuscleSlug(ex);
    const title = slug === "_otros" ? "Otros" : MUSCLE_LABEL[slug] ?? slug;
    const key = slug;
    const arr = map.get(key);
    if (arr) arr.push(ex);
    else map.set(key, [ex]);
  }
  return [...map.entries()]
    .map(([key, data]) => ({
      key,
      title: key === "_otros" ? "Otros" : MUSCLE_LABEL[key] ?? key,
      data,
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}
