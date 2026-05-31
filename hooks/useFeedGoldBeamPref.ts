import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";

/** Facade sobre `useFeedPrefsStore` — ver `stores/useFeedPrefsStore.ts`. */
export function useFeedGoldBeamPref() {
  const enabled = useFeedPrefsStore((s) => s.goldBeamEnabled);
  const hydrateGoldBeam = useFeedPrefsStore((s) => s.hydrateGoldBeam);
  const setGoldBeamEnabled = useFeedPrefsStore((s) => s.setGoldBeamEnabled);

  const reload = useCallback(async () => {
    await hydrateGoldBeam();
  }, [hydrateGoldBeam]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return { enabled, setEnabledPref: setGoldBeamEnabled, reload };
}
