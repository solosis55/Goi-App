import { getWorkoutSessionsPicker } from "../api/workoutSessions";

/** Sesión más reciente sin publicar del usuario (p. ej. tras completar un entreno). */
export async function getLatestSessionIdForUser(userId: string): Promise<{
  sessionId: string | null;
  workoutTitle: string | null;
  performedAt: string | null;
  notes: string | null;
  snapshot: import("../types/workoutSessionSnapshot").WorkoutSessionSnapshot | null;
}> {
  try {
    const page = await getWorkoutSessionsPicker({ limit: 15, includeLinked: true });
    const latest = page.sessions.find((s) => s.userId === userId && !s.linkedPostId);
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

/** Si llega workoutId legacy, usa la sesión más reciente sin publicar de esa rutina. */
export async function resolveSessionIdFromWorkoutId(
  userId: string,
  workoutId: string
): Promise<string | null> {
  try {
    const page = await getWorkoutSessionsPicker({ workoutId, limit: 10, includeLinked: true });
    const match = page.sessions.find((s) => s.userId === userId && !s.linkedPostId);
    return match?.id ?? null;
  } catch {
    return null;
  }
}
