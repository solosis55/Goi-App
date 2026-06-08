import { useCallback, useState } from "react";
import { getWorkouts } from "../api/workouts";

export function useFeedWorkoutTitles(userId: string | undefined) {
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>({});

  const refreshWorkoutTitles = useCallback(async () => {
    if (!userId) return;
    try {
      const all = await getWorkouts();
      const map: Record<string, string> = {};
      for (const w of all) {
        if (w.userId === userId) map[w.id] = w.title;
      }
      setWorkoutTitles(map);
    } catch {
      /* opcional */
    }
  }, [userId]);

  return { workoutTitles, refreshWorkoutTitles };
}
