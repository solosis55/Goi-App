import type { Exercise } from "../types/exercise";

export function filterExercisesByCatalogQuery(
  catalog: Exercise[],
  query: string,
  muscleSlugs: string[],
  equipmentSlugs: string[]
): Exercise[] {
  const q = query.trim().toLowerCase();
  let list = catalog;

  if (q) {
    list = list.filter((e) => e.name.toLowerCase().includes(q));
  }

  if (muscleSlugs.length > 0) {
    const sel = new Set(muscleSlugs);
    list = list.filter((e) => (e.muscles ?? []).some((m) => sel.has(m)));
  }

  if (equipmentSlugs.length > 0) {
    const sel = new Set(equipmentSlugs);
    list = list.filter((e) => (e.equipmentTags ?? []).some((t) => sel.has(t)));
  }

  return list.slice(0, 80);
}

export function toggleSlugList(list: string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}
