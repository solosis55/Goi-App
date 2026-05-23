import type { WorkoutExerciseBlock, WorkoutSetRow } from "./workout";

/** Paso de un dropset o de un rest-pause (peso + reps/series en ese tramo). */
export type PerformSetSubStep = {
  weight: string;
  reps: string;
};

/** Serie planificada + registro al realizar el entreno. */
export type SessionPerformSet = {
  planned: WorkoutSetRow;
  done: boolean;
  actualReps: string;
  actualWeight: string;
  /** RPE 1–10 (opcional). */
  rpe?: string;
  /** Duración de la serie en segundos (AMRAP, Tempo). */
  workDurationSec?: string;
  /** Descanso entre mini-series en rest-pause (segundos). */
  miniRestSec?: string;
  /** Bajadas de peso (dropset) o tramos de rest-pause. */
  subSteps?: PerformSetSubStep[];
};

export type SessionPerformBlock = {
  exerciseId: string;
  equipmentSlug?: string;
  laterality?: "bilateral" | "unilateral";
  /** Segundos de descanso tras cada serie de este ejercicio. */
  restSec?: number;
  /** Comentario libre del ejercicio en esta sesión. */
  notes?: string;
  sets: SessionPerformSet[];
};

/** Sesión en curso (local hasta finalizar y crear en API). */
export type ActiveWorkoutSession = {
  workoutId: string;
  workoutTitle: string;
  startedAt: string;
  blocks: SessionPerformBlock[];
  notes: string;
  /** Tiempo acumulado en pausa (ms). */
  totalPausedMs?: number;
  /** Si está definido, el cronómetro de sesión está pausado. */
  pausedAt?: string | null;
};
