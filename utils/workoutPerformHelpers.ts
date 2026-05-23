import type { SessionPerformBlock } from "../types/workoutSessionPerform";

/** Índice del primer ejercicio con alguna serie pendiente. */
export function firstIncompleteBlockIndex(blocks: SessionPerformBlock[]): number {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block?.sets.some((s) => !s.done)) return i;
  }
  return -1;
}

export function estimateSessionVolumeKg(blocks: SessionPerformBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    for (const row of block.sets) {
      if (!row.done) continue;
      const reps = parseFloat(row.actualReps.replace(",", "."));
      const kg = parseFloat(row.actualWeight.replace(",", "."));
      if (Number.isFinite(reps) && Number.isFinite(kg) && reps > 0 && kg > 0) {
        total += reps * kg;
      }
    }
  }
  return Math.round(total);
}
