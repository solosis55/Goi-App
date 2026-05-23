import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXERCISE_LAST_PERFORMANCE_KEY } from "../constants/storageKeys";
import type { SessionPerformBlock } from "../types/workoutSessionPerform";

export type ExerciseLastPerformance = {
  reps: string;
  weight: string;
  performedAt: string;
};

type PerformanceMap = Record<string, ExerciseLastPerformance>;

export async function readExerciseLastPerformanceMap(): Promise<PerformanceMap> {
  try {
    const raw = await AsyncStorage.getItem(EXERCISE_LAST_PERFORMANCE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PerformanceMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeExerciseLastPerformanceMap(map: PerformanceMap): Promise<void> {
  try {
    await AsyncStorage.setItem(EXERCISE_LAST_PERFORMANCE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function bestDoneFromBlock(block: SessionPerformBlock): ExerciseLastPerformance | null {
  for (let i = block.sets.length - 1; i >= 0; i--) {
    const row = block.sets[i];
    if (!row?.done) continue;
    const reps = row.actualReps.trim() || row.planned.reps.trim();
    if (!reps) continue;
    const weight = row.actualWeight.trim() || row.planned.weight.trim();
    return {
      reps,
      weight: weight || "—",
      performedAt: new Date().toISOString(),
    };
  }
  return null;
}

/** Actualiza caché local con el mejor registro de cada ejercicio de la sesión. */
export async function mergeExerciseLastPerformanceFromBlocks(blocks: SessionPerformBlock[]): Promise<void> {
  const map = await readExerciseLastPerformanceMap();
  let changed = false;
  for (const block of blocks) {
    const entry = bestDoneFromBlock(block);
    if (!entry) continue;
    map[block.exerciseId] = entry;
    changed = true;
  }
  if (changed) await writeExerciseLastPerformanceMap(map);
}

export function formatExerciseLastPerformanceLine(entry: ExerciseLastPerformance | undefined): string {
  if (!entry) return "—";
  const w = entry.weight.trim();
  const hasWeight = w && w !== "—" && w !== "0";
  return hasWeight ? `${entry.reps} · ${w} kg` : entry.reps;
}
