import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  isMeaningfulWorkoutCreateDraft,
  readWorkoutCreateDraft,
} from "../utils/workoutCreateDraft";
import {
  isMeaningfulWorkoutEditDraft,
  readWorkoutEditDraft,
} from "../utils/workoutEditDraft";
import { subscribeWorkoutDraftChanged } from "../utils/workoutDraftEvents";
import { hasActiveWorkoutSession } from "../utils/workoutSessionPerform";

export type WorkoutTabBadgeState = {
  visible: boolean;
  /** Sesión en curso (entrenar), no solo borrador de editor. */
  liveSession: boolean;
};

/** Distintivo en tab Entrenar: borrador y/o sesión en curso. */
export function useWorkoutTabBadge(): WorkoutTabBadgeState {
  const [state, setState] = useState<WorkoutTabBadgeState>({ visible: false, liveSession: false });

  const refresh = useCallback(() => {
    void Promise.all([
      readWorkoutCreateDraft(),
      readWorkoutEditDraft(),
      hasActiveWorkoutSession(),
    ]).then(([create, edit, live]) => {
      const draft =
        isMeaningfulWorkoutCreateDraft(create) || isMeaningfulWorkoutEditDraft(edit);
      setState({
        visible: live || draft,
        liveSession: live,
      });
    });
  }, []);

  useEffect(() => {
    refresh();
    return subscribeWorkoutDraftChanged(refresh);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return state;
}
