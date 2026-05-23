import { CATALOG_EQUIPMENT_OPTIONS } from "../constants/exerciseEquipment";
import { CATALOG_MUSCLE_OPTIONS } from "../constants/exerciseMuscleFilters";
import type { Exercise } from "../types/exercise";

export const MUSCLE_LABEL = Object.fromEntries(
  CATALOG_MUSCLE_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

export const EQUIPMENT_LABEL = Object.fromEntries(
  CATALOG_EQUIPMENT_OPTIONS.map((o) => [o.slug, o.label] as const),
) as Record<string, string>;

export function catalogExerciseMetaLine(ex: {
  equipmentTags?: string[];
  muscles?: string[];
}): string | null {
  const bits: string[] = [];
  if (ex.equipmentTags?.length) {
    bits.push(ex.equipmentTags.map((s) => EQUIPMENT_LABEL[s] ?? s).join(" · "));
  }
  if (ex.muscles?.length) {
    bits.push(ex.muscles.map((s) => MUSCLE_LABEL[s] ?? s).join(" · "));
  }
  return bits.length ? bits.join(" · ") : null;
}

export function catalogExerciseSubtitle(ex: Exercise): string | null {
  return catalogExerciseMetaLine(ex);
}

/** Etiquetas compactas para filas del catálogo (máx. por grupo + contador). */
export function exerciseCatalogInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/** Placeholder de stats en fila hasta tener datos reales. */
export function catalogExerciseStatsHint(): string {
  return "Estadísticas próximamente";
}

export function catalogExerciseChipTags(
  ex: Exercise,
  maxPerGroup = 2,
): { muscles: string[]; equipment: string[] } {
  const muscles = (ex.muscles ?? []).slice(0, maxPerGroup).map((s) => MUSCLE_LABEL[s] ?? s);
  const equipment = (ex.equipmentTags ?? []).slice(0, maxPerGroup).map((s) => EQUIPMENT_LABEL[s] ?? s);
  const extraM = (ex.muscles?.length ?? 0) - maxPerGroup;
  const extraE = (ex.equipmentTags?.length ?? 0) - maxPerGroup;
  if (extraM > 0) muscles.push(`+${extraM}`);
  if (extraE > 0) equipment.push(`+${extraE}`);
  return { muscles, equipment };
}
