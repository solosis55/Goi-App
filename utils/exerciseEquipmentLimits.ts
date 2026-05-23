import { CATALOG_EQUIPMENT_OPTIONS, equipmentLabel } from "../constants/exerciseEquipment";
import type { Exercise } from "../types/exercise";

export type EquipmentOption = { slug: string; label: string };

/** `null` = sin tags (cualquier material del catálogo); array = variantes del movimiento. */
export function allowedEquipmentSlugs(exercise?: Exercise): string[] | null {
  const tags = exercise?.equipmentTags?.filter(Boolean) ?? [];
  if (tags.length === 0) return null;
  return tags;
}

export function exerciseHasEquipmentRestrictions(exercise?: Exercise): boolean {
  return allowedEquipmentSlugs(exercise) !== null;
}

/** Chips de material permitidos para el movimiento. */
export function equipmentOptionsForExercise(exercise?: Exercise): EquipmentOption[] {
  const allowed = allowedEquipmentSlugs(exercise);
  if (!allowed) return [...CATALOG_EQUIPMENT_OPTIONS];

  const allowedSet = new Set(allowed);
  const fromCatalog = CATALOG_EQUIPMENT_OPTIONS.filter((o) => allowedSet.has(o.slug));
  const known = new Set<string>(fromCatalog.map((o) => o.slug));
  const extras = allowed
    .filter((slug) => !known.has(slug))
    .map((slug) => ({ slug, label: equipmentLabel(slug) || slug }));

  return [...fromCatalog, ...extras];
}

export function defaultEquipmentSlugForExercise(exercise?: Exercise): string {
  const allowed = allowedEquipmentSlugs(exercise);
  const preferred = exercise?.defaultEquipmentSlug?.trim();
  if (preferred && (!allowed || allowed.includes(preferred))) return preferred;
  if (allowed?.length) return allowed[0]!;
  return "";
}

/** Corrige material no permitido (p. ej. rutina antigua o «ver todo» previo). */
export function sanitizeEquipmentSlug(current: string | undefined, exercise?: Exercise): string {
  const slug = (current ?? "").trim();
  const allowed = allowedEquipmentSlugs(exercise);
  if (!allowed) return slug;
  if (slug && allowed.includes(slug)) return slug;
  return defaultEquipmentSlugForExercise(exercise);
}

export function isEquipmentSlugAllowed(slug: string, exercise?: Exercise): boolean {
  const allowed = allowedEquipmentSlugs(exercise);
  if (!allowed) return true;
  return allowed.includes(slug);
}
