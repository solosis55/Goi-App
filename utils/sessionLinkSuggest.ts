import { getWorkoutSessions } from "../api/workoutSessions";

/** Sesión más reciente del usuario (p. ej. tras completar un entreno). */
export async function getLatestSessionIdForUser(userId: string): Promise<{
  sessionId: string | null;
  workoutTitle: string | null;
  performedAt: string | null;
  notes: string | null;
  snapshot: import("../types/workoutSessionSnapshot").WorkoutSessionSnapshot | null;
}> {
  try {
    const sessions = await getWorkoutSessions();
    const latest = sessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0];
    if (!latest) {
      return { sessionId: null, workoutTitle: null, performedAt: null, notes: null, snapshot: null };
    }
    return {
      sessionId: latest.id,
      workoutTitle: latest.workoutTitle ?? null,
      performedAt: latest.performedAt,
      notes: latest.notes ?? null,
      snapshot: latest.snapshot ?? null,
    };
  } catch {
    return { sessionId: null, workoutTitle: null, performedAt: null, notes: null, snapshot: null };
  }
}

/** Si llega workoutId legacy, usa la sesión más reciente de esa rutina. */
export async function resolveSessionIdFromWorkoutId(
  userId: string,
  workoutId: string
): Promise<string | null> {
  try {
    const sessions = await getWorkoutSessions();
    const match = sessions
      .filter((s) => s.userId === userId && s.workoutId === workoutId)
      .sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0];
    return match?.id ?? null;
  } catch {
    return null;
  }
}
