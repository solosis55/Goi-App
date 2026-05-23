import { equipmentLabel } from "../constants/exerciseEquipment";
import type { WorkoutExerciseBlock } from "../types/workout";

/** Línea bajo el nombre: «3 series · Bilateral · Mancuernas». */
export function editorBlockHeadMetaLine(block: WorkoutExerciseBlock): string {
  const parts: string[] = [
    `${block.sets.length} serie${block.sets.length === 1 ? "" : "s"}`,
    block.laterality === "unilateral" ? "Unilateral" : "Bilateral",
  ];
  const eq = equipmentLabel(block.equipmentSlug);
  if (eq) parts.push(eq);
  return parts.join(" · ");
}

/** 0–1 según series con al menos reps o kg definidos. */
export function editorBlockSetsFillRatio(block: WorkoutExerciseBlock): number {
  if (block.sets.length === 0) return 0;
  const filled = block.sets.filter((s) => s.reps.trim() || s.weight.trim()).length;
  return filled / block.sets.length;
}

/** Hay al menos una serie sin reps ni kg. */
export function editorBlockSetsIncomplete(block: WorkoutExerciseBlock): boolean {
  if (block.sets.length === 0) return true;
  return block.sets.some((s) => !s.reps.trim() && !s.weight.trim());
}
