/** Descanso por defecto tras marcar una serie (segundos). */
export const WORKOUT_DEFAULT_REST_SEC = 90;

/** Sin temporizador: el usuario descansa a su ritmo. */
export const WORKOUT_REST_NONE_SEC = 0;

/** Límites razonables para descanso entre series. */
export const WORKOUT_REST_MIN_SEC = 15;
export const WORKOUT_REST_MAX_SEC = 600;

export function isTimedRestSec(sec?: number | null): boolean {
  return typeof sec === "number" && sec > 0;
}

/** Atajos opcionales en el selector (no son el único límite). */
export const WORKOUT_REST_PRESETS_SEC = [45, 60, 90, 120, 180, 300] as const;

export function normalizeRestSec(sec?: number, fallback = WORKOUT_DEFAULT_REST_SEC): number {
  if (sec === WORKOUT_REST_NONE_SEC) return WORKOUT_REST_NONE_SEC;
  if (sec == null || !Number.isFinite(sec)) return fallback;
  return Math.min(WORKOUT_REST_MAX_SEC, Math.max(WORKOUT_REST_MIN_SEC, Math.round(sec)));
}

/** Etiqueta compacta: «1:30», «2 min», «45s», «Libre». */
export function formatRestDuration(sec: number): string {
  if (sec === WORKOUT_REST_NONE_SEC) return "Libre";
  const safe = normalizeRestSec(sec);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  if (m > 0 && s > 0) return `${m}:${String(s).padStart(2, "0")}`;
  if (m > 0) return `${m} min`;
  return `${s}s`;
}

export function restDurationToParts(sec: number): { minutes: string; seconds: string } {
  const safe = normalizeRestSec(sec);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return { minutes: String(m), seconds: String(s) };
}

export function partsToRestSec(minutesRaw: string, secondsRaw: string, fallback = WORKOUT_DEFAULT_REST_SEC): number {
  const m = parseInt(minutesRaw.replace(/\D/g, ""), 10);
  const s = parseInt(secondsRaw.replace(/\D/g, ""), 10);
  const mins = Number.isFinite(m) ? Math.max(0, m) : 0;
  const secs = Number.isFinite(s) ? Math.min(59, Math.max(0, s)) : 0;
  const total = mins * 60 + secs;
  if (total < WORKOUT_REST_MIN_SEC) return fallback;
  return normalizeRestSec(total, fallback);
}
