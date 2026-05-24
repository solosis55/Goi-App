import { useCallback } from "react";
import { useScrollInteractionGuard } from "../context/ScrollInteractionGuard";

/** Envuelve callbacks para no ejecutarlos mientras el ScrollView padre está en scroll. */
export function usePressGuard(enabled?: boolean) {
  const scrollGuard = useScrollInteractionGuard();

  return useCallback(
    <T extends () => void>(fn: T): T => {
      if (!enabled || !scrollGuard) return fn;
      return (() => {
        if (scrollGuard.isScrolling()) return;
        fn();
      }) as T;
    },
    [enabled, scrollGuard]
  );
}
