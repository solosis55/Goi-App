import { useCallback, useMemo, useState } from "react";
import { getExercises } from "../api/exercises";
import { getWorkoutSessions } from "../api/workoutSessions";
import { getWorkouts } from "../api/workouts";
import type { Exercise } from "../types/exercise";
import type { Workout } from "../types/workout";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { countSessionsInRollingWeek, computeSessionStatsByWorkoutId } from "../utils/workoutSessionStats";
import { getErrorMessage } from "../utils/errorMessages";

export function useWorkoutHubData(userId: string | undefined) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<WorkoutSessionWithTitle[]>([]);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setWorkouts([]);
      setSessions([]);
      setCatalog([]);
      return;
    }
    try {
      const [allWorkouts, sessionList, exercises] = await Promise.all([
        getWorkouts(),
        getWorkoutSessions(),
        getExercises().catch(() => [] as Exercise[]),
      ]);
      setWorkouts(allWorkouts.filter((w) => w.userId === userId));
      setSessions(sessionList);
      setCatalog(exercises);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "No se pudieron cargar los entrenamientos"));
    }
  }, [userId]);

  const sessionStatsByWorkoutId = useMemo(
    () => computeSessionStatsByWorkoutId(sessions),
    [sessions]
  );
  const stats = useMemo(
    () => ({
      routineCount: workouts.length,
      totalSessions: sessions.length,
      sessionsThisWeek: countSessionsInRollingWeek(sessions),
    }),
    [workouts.length, sessions]
  );

  return {
    workouts,
    sessions,
    catalog,
    loading,
    error,
    stats,
    sessionStatsByWorkoutId,
    load,
    setLoading,
    setSessions,
    setWorkouts,
    setError,
  };
}
