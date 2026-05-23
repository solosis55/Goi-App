import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACTIVE_WORKOUT_SESSION_KEY } from "../constants/storageKeys";
import type { Exercise } from "../types/exercise";
import type { Workout, WorkoutExerciseBlock, WorkoutSetRow } from "../types/workout";
import { createBlockForExercise, createEmptySet } from "./workoutBlocks";
import type { ActiveWorkoutSession, SessionPerformBlock, SessionPerformSet } from "../types/workoutSessionPerform";
import { blocksFromLegacy } from "./workoutBlocks";
import { notifyWorkoutDraftChanged } from "./workoutDraftEvents";
import { normalizeBlockRestSec, normalizePerformBlocks } from "./performBlockRest";
import { normalizePerformSet } from "./performSetExtras";

function blockToPerform(block: WorkoutExerciseBlock, defaultRestSec: number): SessionPerformBlock {
  return {
    exerciseId: block.exerciseId,
    equipmentSlug: block.equipmentSlug,
    laterality: block.laterality,
    restSec: normalizeBlockRestSec(defaultRestSec),
    notes: "",
    sets: block.sets.map((planned) =>
      normalizePerformSet({
        planned,
        done: false,
        actualReps: planned.reps,
        actualWeight: planned.weight,
      })
    ),
  };
}

export function createPerformSet(planned?: WorkoutSetRow): SessionPerformSet {
  const p = planned ?? createEmptySet();
  return normalizePerformSet({
    planned: { ...p },
    done: false,
    actualReps: p.reps,
    actualWeight: p.weight,
    rpe: "",
  });
}

export function createPerformBlockForExercise(
  exerciseId: string,
  exercise?: Exercise,
  defaultRestSec?: number
): SessionPerformBlock {
  return blockToPerform(createBlockForExercise(exerciseId, exercise), normalizeBlockRestSec(defaultRestSec));
}

export function createActiveSessionFromWorkout(workout: Workout, defaultRestSec?: number): ActiveWorkoutSession {
  const rest = normalizeBlockRestSec(defaultRestSec);
  const blocks = blocksFromLegacy(workout.exerciseIds, workout.exerciseBlocks);
  return {
    workoutId: workout.id,
    workoutTitle: workout.title,
    startedAt: new Date().toISOString(),
    blocks: blocks.map((b) => blockToPerform(b, rest)),
    notes: "",
  };
}

export function normalizeActiveWorkoutSession(
  session: ActiveWorkoutSession,
  defaultRestSec?: number
): ActiveWorkoutSession {
  const fallback = normalizeBlockRestSec(defaultRestSec);
  return {
    ...session,
    blocks: normalizePerformBlocks(session.blocks, fallback).map((block) => ({
      ...block,
      sets: block.sets.map((row) => normalizePerformSet(row)),
    })),
  };
}

export function countPerformProgress(blocks: SessionPerformBlock[]): {
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
} {
  let completedSets = 0;
  let totalSets = 0;
  let completedExercises = 0;
  for (const block of blocks) {
    totalSets += block.sets.length;
    const blockDone = block.sets.length > 0 && block.sets.every((s) => s.done);
    if (blockDone) completedExercises += 1;
    for (const set of block.sets) {
      if (set.done) completedSets += 1;
    }
  }
  return {
    completedSets,
    totalSets,
    completedExercises,
    totalExercises: blocks.length,
  };
}

export function buildSessionNotesFromPerform(
  userNotes: string,
  completedSets: number,
  totalSets: number,
  blockNotesLines: string[] = []
): string {
  const summary = `${completedSets}/${totalSets} series completadas`;
  const trimmed = userNotes.trim();
  const base = trimmed ? `${summary}\n\n${trimmed}` : summary;
  if (blockNotesLines.length === 0) return base;
  return `${base}\n\n--- Por ejercicio ---\n${blockNotesLines.join("\n")}`;
}

export function collectPerformBlockNotesLines(
  blocks: SessionPerformBlock[],
  exerciseName: (exerciseId: string) => string
): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    const text = block.notes?.trim();
    if (!text) continue;
    lines.push(`${exerciseName(block.exerciseId)}: ${text}`);
  }
  return lines;
}

export async function readActiveWorkoutSession(): Promise<ActiveWorkoutSession | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_WORKOUT_SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<ActiveWorkoutSession>;
    if (typeof o.workoutId !== "string" || typeof o.workoutTitle !== "string") return null;
    if (typeof o.startedAt !== "string" || !Array.isArray(o.blocks)) return null;
    const session: ActiveWorkoutSession = {
      workoutId: o.workoutId,
      workoutTitle: o.workoutTitle,
      startedAt: o.startedAt,
      blocks: o.blocks as SessionPerformBlock[],
      notes: typeof o.notes === "string" ? o.notes : "",
      totalPausedMs: typeof o.totalPausedMs === "number" ? o.totalPausedMs : 0,
      pausedAt: typeof o.pausedAt === "string" ? o.pausedAt : null,
    };
    return normalizeActiveWorkoutSession(session);
  } catch {
    return null;
  }
}

export async function writeActiveWorkoutSession(session: ActiveWorkoutSession): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_WORKOUT_SESSION_KEY, JSON.stringify(session));
    notifyWorkoutDraftChanged();
  } catch {
    /* ignore */
  }
}

export async function clearActiveWorkoutSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_SESSION_KEY);
    notifyWorkoutDraftChanged();
  } catch {
    /* ignore */
  }
}

export async function hasActiveWorkoutSession(): Promise<boolean> {
  const s = await readActiveWorkoutSession();
  return s !== null && s.blocks.length > 0;
}
