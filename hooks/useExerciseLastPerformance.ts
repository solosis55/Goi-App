import { useEffect, useState } from "react";
import {
  readExerciseLastPerformanceMap,
  type ExerciseLastPerformance,
} from "../utils/exerciseLastPerformance";

export function useExerciseLastPerformance() {
  const [map, setMap] = useState<Record<string, ExerciseLastPerformance>>({});

  useEffect(() => {
    let cancelled = false;
    void readExerciseLastPerformanceMap().then((data) => {
      if (!cancelled) setMap(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return map;
}
