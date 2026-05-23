import { WORKOUT_TITLE_MAX } from "../constants/workoutFormLimits";
import type { Workout } from "../types/workout";
import { blocksFromLegacy } from "./workoutBlocks";
import { writeWorkoutCreateDraft, type WorkoutCreateDraft } from "./workoutCreateDraft";

export async function seedDuplicateWorkoutDraft(workout: Workout): Promise<void> {
  const blocks = blocksFromLegacy(workout.exerciseIds, workout.exerciseBlocks);
  const draft: WorkoutCreateDraft = {
    title: `${workout.title.trim()} (copia)`.slice(0, WORKOUT_TITLE_MAX),
    description: workout.description,
    exerciseBlocks: blocks.map((b) => ({
      ...b,
      sets: b.sets.map((s) => ({ ...s })),
    })),
    tags: [...workout.tags],
  };
  await writeWorkoutCreateDraft(draft);
}
