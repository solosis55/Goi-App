import { hasActiveWorkoutSession } from "./workoutSessionPerform";
import {
  isMeaningfulWorkoutCreateDraft,
  readWorkoutCreateDraft,
  clearWorkoutCreateDraft,
} from "./workoutCreateDraft";
import {
  isMeaningfulWorkoutEditDraft,
  readWorkoutEditDraft,
  clearWorkoutEditDraft,
} from "./workoutEditDraft";

export async function hasWorkoutDraftInProgress(): Promise<boolean> {
  const [create, edit, active] = await Promise.all([
    readWorkoutCreateDraft(),
    readWorkoutEditDraft(),
    hasActiveWorkoutSession(),
  ]);
  return (
    active ||
    isMeaningfulWorkoutCreateDraft(create) ||
    isMeaningfulWorkoutEditDraft(edit)
  );
}

export async function clearAllWorkoutDrafts(): Promise<void> {
  const { clearActiveWorkoutSession } = await import("./workoutSessionPerform");
  await Promise.all([clearWorkoutCreateDraft(), clearWorkoutEditDraft(), clearActiveWorkoutSession()]);
}
