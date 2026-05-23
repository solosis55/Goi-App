/** Muestra segundos como m:ss (p. ej. 90 → 1:30). */
export function formatWorkoutCountdown(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseWorkDurationSec(value: string | undefined): number {
  const n = parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
