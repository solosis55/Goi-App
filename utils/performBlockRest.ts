import { normalizeRestSec, WORKOUT_DEFAULT_REST_SEC, WORKOUT_REST_NONE_SEC } from "../constants/workoutRest";
import type { SessionPerformBlock } from "../types/workoutSessionPerform";

export function normalizeBlockRestSec(sec?: number, fallback = WORKOUT_DEFAULT_REST_SEC): number {
  if (sec === WORKOUT_REST_NONE_SEC) return WORKOUT_REST_NONE_SEC;
  if (sec == null || !Number.isFinite(sec)) return fallback;
  return normalizeRestSec(sec, fallback);
}

/** Segundos de descanso tras serie; 0 = libre (sin temporizador). */
export function blockRestSec(block: Pick<SessionPerformBlock, "restSec">): number {
  if (block.restSec === WORKOUT_REST_NONE_SEC) return WORKOUT_REST_NONE_SEC;
  return normalizeBlockRestSec(block.restSec);
}

export function isBlockRestTimed(block: Pick<SessionPerformBlock, "restSec">): boolean {
  return blockRestSec(block) > WORKOUT_REST_NONE_SEC;
}

export function normalizePerformBlock(
  block: SessionPerformBlock,
  fallbackRestSec = WORKOUT_DEFAULT_REST_SEC
): SessionPerformBlock {
  return {
    ...block,
    restSec:
      block.restSec === WORKOUT_REST_NONE_SEC
        ? WORKOUT_REST_NONE_SEC
        : normalizeBlockRestSec(block.restSec ?? fallbackRestSec),
    notes: typeof block.notes === "string" ? block.notes : "",
    sets: block.sets.map((row) => ({
      ...row,
      rpe: typeof row.rpe === "string" ? row.rpe : "",
    })),
  };
}

export function normalizePerformBlocks(
  blocks: SessionPerformBlock[],
  fallbackRestSec = WORKOUT_DEFAULT_REST_SEC
): SessionPerformBlock[] {
  return blocks.map((b) => normalizePerformBlock(b, fallbackRestSec));
}
