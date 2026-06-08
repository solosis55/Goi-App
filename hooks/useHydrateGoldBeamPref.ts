import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";

/** Hidrata la preferencia del beam dorado al entrar en pantalla. */
export function useHydrateGoldBeamPref() {
  const hydrateGoldBeam = useFeedPrefsStore((s) => s.hydrateGoldBeam);

  useFocusEffect(
    useCallback(() => {
      void hydrateGoldBeam();
    }, [hydrateGoldBeam])
  );
}
