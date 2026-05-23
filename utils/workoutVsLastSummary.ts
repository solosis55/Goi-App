import type { ExerciseLastPerformance } from "./exerciseLastPerformance";
import type { SessionPerformBlock } from "../types/workoutSessionPerform";

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function bestDoneFromBlock(block: SessionPerformBlock): { reps: number; weight: number } | null {
  let best: { reps: number; weight: number } | null = null;
  for (const row of block.sets) {
    if (!row.done) continue;
    const reps = parseNum(row.actualReps || row.planned.reps);
    const weight = parseNum(row.actualWeight || row.planned.weight) ?? 0;
    if (reps == null) continue;
    const vol = reps * (weight || 1);
    const bestVol = best ? best.reps * (best.weight || 1) : -1;
    if (vol > bestVol) best = { reps, weight };
  }
  return best;
}

export type VsLastTrend = "up" | "down" | "same" | "none";

export function buildVsLastSummary(
  block: SessionPerformBlock,
  last?: ExerciseLastPerformance
): { label: string; trend: VsLastTrend } | null {
  if (!last) return null;
  const lastReps = parseNum(last.reps);
  const lastWeight = parseNum(last.weight) ?? 0;
  if (lastReps == null) return null;

  const current = bestDoneFromBlock(block);
  if (!current) {
    const w = lastWeight > 0 ? `${lastWeight} kg × ` : "";
    return { label: `vs última: ${w}${last.reps} reps`, trend: "none" };
  }

  const lastVol = lastReps * (lastWeight || 1);
  const curVol = current.reps * (current.weight || 1);
  let trend: VsLastTrend = "same";
  if (curVol > lastVol) trend = "up";
  else if (curVol < lastVol) trend = "down";

  const w = current.weight > 0 ? `${current.weight} kg × ` : "";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "=";
  return { label: `${arrow} vs última · ${w}${current.reps} reps`, trend };
}
