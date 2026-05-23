import type { ExerciseLastPerformance } from "./exerciseLastPerformance";
import { formatExerciseLastPerformanceLine } from "./exerciseLastPerformance";
import type { PerformSetSubStep, SessionPerformSet } from "../types/workoutSessionPerform";

export type PerformSetAntColumn = {
  line: string;
  fromHistory: boolean;
  copy: { reps: string; weight: string } | null;
};

type LastDoneSnapshot = { reps: string; weight: string };

export function lastDoneInSession(sets: SessionPerformSet[], beforeIndex: number): LastDoneSnapshot | null {
  for (let i = beforeIndex - 1; i >= 0; i--) {
    const prev = sets[i];
    if (!prev?.done) continue;
    return {
      reps: prev.actualReps.trim() || prev.planned.reps || "—",
      weight: prev.actualWeight.trim() || prev.planned.weight || "—",
    };
  }
  return null;
}

function antFromRepsWeight(reps: string, weight: string, fromHistory: boolean): PerformSetAntColumn {
  const r = reps.trim() || "—";
  const w = weight.trim();
  const hasWeight = w && w !== "—";
  return {
    line: hasWeight ? `${r} · ${w}` : r,
    fromHistory,
    copy: {
      reps: r === "—" ? "" : r,
      weight: !w || w === "—" ? "" : w,
    },
  };
}

/** Columna «Últ.» de una serie normal en la sesión. */
export function antColumnForSet(
  sets: SessionPerformSet[],
  setIndex: number,
  lastPerformance?: ExerciseLastPerformance
): PerformSetAntColumn {
  const prev = lastDoneInSession(sets, setIndex);
  if (prev) {
    return antFromRepsWeight(prev.reps, prev.weight, false);
  }
  if (lastPerformance) {
    return {
      line: formatExerciseLastPerformanceLine(lastPerformance),
      fromHistory: true,
      copy: {
        reps: lastPerformance.reps,
        weight: lastPerformance.weight === "—" ? "" : lastPerformance.weight,
      },
    };
  }
  return { line: "—", fromHistory: false, copy: null };
}

/** «Últ.» para una subserie: tramo anterior en la misma serie o historial del ejercicio. */
export function antColumnForSubStep(
  blockSets: SessionPerformSet[],
  setIndex: number,
  subIndex: number,
  mainRow: SessionPerformSet,
  extras: PerformSetSubStep[],
  lastPerformance?: ExerciseLastPerformance
): PerformSetAntColumn {
  if (subIndex > 0) {
    const prev = extras[subIndex - 1];
    if (prev && (prev.reps.trim() || prev.weight.trim())) {
      return antFromRepsWeight(prev.reps, prev.weight, false);
    }
  }

  const mainReps = mainRow.actualReps.trim() || mainRow.planned.reps;
  const mainWeight = mainRow.actualWeight.trim() || mainRow.planned.weight;
  if (subIndex === 0 && (mainReps.trim() || mainWeight.trim())) {
    return antFromRepsWeight(mainReps, mainWeight, false);
  }

  return antColumnForSet(blockSets, setIndex, lastPerformance);
}
