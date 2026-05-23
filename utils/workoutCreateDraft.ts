import AsyncStorage from "@react-native-async-storage/async-storage";
import { WORKOUT_CREATE_DRAFT_KEY } from "../constants/storageKeys";
import type { WorkoutExerciseBlock } from "../types/workout";
import { notifyWorkoutDraftChanged } from "./workoutDraftEvents";

export type WorkoutCreateDraft = {
  title: string;
  description: string;
  /** Legado: solo IDs; preferir `exerciseBlocks`. */
  exerciseIds?: string[];
  exerciseBlocks?: WorkoutExerciseBlock[];
  tags: string[];
};

export function isMeaningfulWorkoutCreateDraft(d: WorkoutCreateDraft | null): boolean {
  if (!d) return false;
  if (d.title.trim().length > 0) return true;
  if (d.description.trim().length > 0) return true;
  if (d.tags.length > 0) return true;
  if ((d.exerciseBlocks?.length ?? 0) > 0) return true;
  if ((d.exerciseIds?.length ?? 0) > 0) return true;
  return false;
}

export async function readWorkoutCreateDraft(): Promise<WorkoutCreateDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_CREATE_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<WorkoutCreateDraft>;
    if (typeof o.title !== "string" || typeof o.description !== "string") return null;
    if (!Array.isArray(o.tags)) return null;
    const exerciseIds = Array.isArray(o.exerciseIds) ? o.exerciseIds.filter((x) => typeof x === "string") : [];
    const exerciseBlocks = Array.isArray(o.exerciseBlocks) ? o.exerciseBlocks : undefined;
    return {
      title: o.title,
      description: o.description,
      exerciseIds,
      exerciseBlocks,
      tags: o.tags.filter((x) => typeof x === "string"),
    };
  } catch {
    return null;
  }
}

export async function writeWorkoutCreateDraft(d: WorkoutCreateDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(WORKOUT_CREATE_DRAFT_KEY, JSON.stringify(d));
    notifyWorkoutDraftChanged();
  } catch {
    /* ignore */
  }
}

export async function clearWorkoutCreateDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUT_CREATE_DRAFT_KEY);
    notifyWorkoutDraftChanged();
  } catch {
    /* ignore */
  }
}
