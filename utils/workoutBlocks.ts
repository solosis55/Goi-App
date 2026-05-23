import type { Exercise } from "../types/exercise";
import type { WorkoutExerciseBlock, WorkoutSetRow } from "../types/workout";
import { defaultEquipmentSlugForExercise } from "./exerciseEquipmentLimits";

const DEFAULT_SET_TYPE = "normal";

export function createEmptySet(): WorkoutSetRow {
  return { reps: "", weight: "", setType: DEFAULT_SET_TYPE };
}

export function createBlockForExercise(exerciseId: string, exercise?: Exercise): WorkoutExerciseBlock {
  return {
    exerciseId,
    equipmentSlug: defaultEquipmentSlugForExercise(exercise),
    laterality: "bilateral",
    sets: [createEmptySet()],
  };
}

export function blocksFromLegacy(
  exerciseIds: string[] | undefined,
  blocks: WorkoutExerciseBlock[] | undefined
): WorkoutExerciseBlock[] {
  if (blocks && blocks.length > 0) return normalizeBlocksShape(blocks);
  return (exerciseIds ?? []).map((id) => createBlockForExercise(id));
}

function normalizeBlocksShape(blocks: WorkoutExerciseBlock[]): WorkoutExerciseBlock[] {
  return blocks.map((b) => ({
    exerciseId: b.exerciseId,
    equipmentSlug: (b.equipmentSlug ?? "").trim(),
    laterality: b.laterality === "unilateral" ? "unilateral" : "bilateral",
    sets:
      b.sets && b.sets.length > 0
        ? b.sets.map((s) => ({
            reps: s.reps ?? "",
            weight: s.weight ?? "",
            setType: s.setType || DEFAULT_SET_TYPE,
          }))
        : [createEmptySet()],
  }));
}

export function updateBlockAt(
  blocks: WorkoutExerciseBlock[],
  index: number,
  fn: (b: WorkoutExerciseBlock) => WorkoutExerciseBlock
): WorkoutExerciseBlock[] {
  return blocks.map((b, i) => (i === index ? fn(b) : b));
}
