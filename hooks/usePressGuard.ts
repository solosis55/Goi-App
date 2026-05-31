import { useCallback } from "react";
import { useScrollInteractionGuard } from "../context/ScrollInteractionGuard";

/**
 * Envuelve callbacks para ignorarlos mientras un `GuardedScrollView` padre está en scroll.
 * Usar solo con `guardScrollPresses` en detalle de post — no en el feed (`FlashList`).
 */
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

/** Aplica `usePressGuard` solo cuando `scrollGuarded` es true. */
export function useOptionalPressGuard(scrollGuarded: boolean) {
  const press = usePressGuard(scrollGuarded);
  return useCallback(
    <T extends () => void>(fn: T): T => (scrollGuarded ? press(fn) : fn),
    [scrollGuarded, press]
  );
}
