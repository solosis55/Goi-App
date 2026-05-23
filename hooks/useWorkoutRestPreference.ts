import { useCallback, useEffect, useState } from "react";
import { WORKOUT_DEFAULT_REST_SEC } from "../constants/workoutRest";
import { readWorkoutRestPreference, writeWorkoutRestPreference } from "../utils/workoutRestPreference";

export function useWorkoutRestPreference() {
  const [restSeconds, setRestSeconds] = useState(WORKOUT_DEFAULT_REST_SEC);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readWorkoutRestPreference().then((sec) => {
      if (!cancelled) {
        setRestSeconds(sec);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    void writeWorkoutRestPreference(seconds);
  }, []);

  return { restSeconds, setPreference, ready };
}
