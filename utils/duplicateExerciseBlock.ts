import type { WorkoutExerciseBlock } from "../types/workout";

/** Copia profunda de un bloque de ejercicio (misma rutina). */
export function duplicateExerciseBlock(block: WorkoutExerciseBlock): WorkoutExerciseBlock {
  return {
    exerciseId: block.exerciseId,
    laterality: block.laterality,
    equipmentSlug: block.equipmentSlug,
    sets: block.sets.map((s) => ({ ...s })),
  };
}
