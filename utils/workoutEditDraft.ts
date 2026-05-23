import AsyncStorage from "@react-native-async-storage/async-storage";
import { WORKOUT_EDIT_DRAFT_KEY } from "../constants/storageKeys";
import type { WorkoutExerciseBlock } from "../types/workout";
import { notifyWorkoutDraftChanged } from "./workoutDraftEvents";

export type WorkoutEditDraft = {
  workoutId: string;
  title: string;
  description: string;
  tagsInput: string;
  exerciseBlocks: WorkoutExerciseBlock[];
};

export function isMeaningfulWorkoutEditDraft(d: WorkoutEditDraft | null): boolean {
  if (!d?.workoutId) return false;
  if (d.title.trim().length > 0) return true;
  if (d.description.trim().length > 0) return true;
  if (d.tagsInput.trim().length > 0) return true;
  return (d.exerciseBlocks?.length ?? 0) > 0;
}

export async function readWorkoutEditDraft(): Promise<WorkoutEditDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_EDIT_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<WorkoutEditDraft>;
    if (typeof o.workoutId !== "string" || typeof o.title !== "string" || typeof o.description !== "string") {
      return null;
    }
    if (typeof o.tagsInput !== "string" || !Array.isArray(o.exerciseBlocks)) return null;
    return {
      workoutId: o.workoutId,
      title: o.title,
      description: o.description,
      tagsInput: o.tagsInput,
      exerciseBlocks: o.exerciseBlocks,
    };
  } catch {
    return null;
  }
}

export async function writeWorkoutEditDraft(d: WorkoutEditDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(WORKOUT_EDIT_DRAFT_KEY, JSON.stringify(d));
    notifyWorkoutDraftChanged();
  } catch {
    /* ignore */
  }
}

export async function clearWorkoutEditDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUT_EDIT_DRAFT_KEY);
    notifyWorkoutDraftChanged();
  } catch {
    /* ignore */
  }
}
