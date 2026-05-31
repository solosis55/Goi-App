import type { ExerciseLastPerformance } from "./exerciseLastPerformance";
import type { SessionPerformSet } from "../types/workoutSessionPerform";

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function setVolume(row: SessionPerformSet): number | null {
  const reps = parseNum(row.actualReps.trim() || row.planned.reps);
  if (reps == null) return null;
  const weight = parseNum(row.actualWeight.trim() || row.planned.weight) ?? 0;
  return reps * (weight || 1);
}

/** True si la serie completada supera el volumen del último registro guardado. */
export function setBeatsLastPerformance(
  row: SessionPerformSet,
  last?: ExerciseLastPerformance
): boolean {
  if (!row.done || !last) return false;
  const currentVol = setVolume(row);
  const lastReps = parseNum(last.reps);
  if (currentVol == null || lastReps == null) return false;
  const lastWeight = parseNum(last.weight) ?? 0;
  const lastVol = lastReps * (lastWeight || 1);
  return currentVol > lastVol;
}
