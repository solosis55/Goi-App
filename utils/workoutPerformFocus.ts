import type { SessionPerformBlock } from "../types/workoutSessionPerform";

export type PerformSetFocus = { blockIndex: number; setIndex: number };

function firstIncompleteInBlock(block: SessionPerformBlock, fromSet = 0): number | null {
  for (let s = fromSet; s < block.sets.length; s++) {
    if (!block.sets[s]?.done) return s;
  }
  return null;
}

/** Siguiente serie sin marcar tras completar una (misma rutina, orden natural). */
export function nextPerformSetFocus(
  blocks: SessionPerformBlock[],
  blockIndex: number,
  setIndex: number
): PerformSetFocus | null {
  const current = blocks[blockIndex];
  if (current) {
    const inBlock = firstIncompleteInBlock(current, setIndex + 1);
    if (inBlock !== null) return { blockIndex, setIndex: inBlock };
  }
  for (let b = blockIndex + 1; b < blocks.length; b++) {
    const block = blocks[b];
    if (!block) continue;
    const idx = firstIncompleteInBlock(block, 0);
    if (idx !== null) return { blockIndex: b, setIndex: idx };
  }
  for (let b = 0; b < blockIndex; b++) {
    const block = blocks[b];
    if (!block) continue;
    const idx = firstIncompleteInBlock(block, 0);
    if (idx !== null) return { blockIndex: b, setIndex: idx };
  }
  return null;
}

/** Primer pendiente o el siguiente tras el foco actual (botón «Siguiente»). */
export function resolvePerformNextFocus(
  blocks: SessionPerformBlock[],
  current: PerformSetFocus | null
): PerformSetFocus | null {
  if (current) {
    const next = nextPerformSetFocus(blocks, current.blockIndex, current.setIndex);
    if (next) return next;
  }
  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b];
    if (!block) continue;
    const idx = firstIncompleteInBlock(block, 0);
    if (idx !== null) return { blockIndex: b, setIndex: idx };
  }
  return null;
}
