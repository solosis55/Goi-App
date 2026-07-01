import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { InteractionManager } from "react-native";

export type FocusStaleRefreshMeta = {
  isFirstFocus: boolean;
  stale: boolean;
  focusCount: number;
};

type UseFocusStaleRefreshOptions = {
  enabled?: boolean;
  staleMs: number;
  /** Si devuelve true, se considera que hay caché válida (salvo forceRefresh). */
  hasData?: () => boolean;
  onRefresh: (meta: FocusStaleRefreshMeta) => void | Promise<void>;
  /** Side effects en cada foco (p. ej. prefs locales, badge) sin depender del stale del fetch principal. */
  onEveryFocus?: (meta: FocusStaleRefreshMeta) => void;
  /** Ejecutar onEveryFocus/onRefresh tras InteractionManager.runAfterInteractions. */
  deferUntilInteractions?: boolean;
  /** Fuerza onRefresh aunque los datos sigan frescos. */
  forceRefresh?: (meta: FocusStaleRefreshMeta) => boolean;
  /** No incrementa el contador de foco este ciclo (p. ej. refresh post-publicar). */
  skipFocusIncrement?: () => boolean;
  /** Side effects síncronos al entrar en foco; puede devolver cleanup al salir. */
  onFocusEnter?: () => void | (() => void);
};

/**
 * Refresca datos al volver a una pantalla si no hay caché o pasó staleMs desde el último refresh.
 */
export function useFocusStaleRefresh({
  enabled = true,
  staleMs,
  hasData,
  onRefresh,
  onEveryFocus,
  deferUntilInteractions = false,
  forceRefresh,
  skipFocusIncrement,
  onFocusEnter,
}: UseFocusStaleRefreshOptions) {
  const focusCountRef = useRef(0);
  const lastRefreshAtRef = useRef(0);

  const onRefreshRef = useRef(onRefresh);
  const onEveryFocusRef = useRef(onEveryFocus);
  const hasDataRef = useRef(hasData);
  const forceRefreshRef = useRef(forceRefresh);
  const skipFocusIncrementRef = useRef(skipFocusIncrement);
  const onFocusEnterRef = useRef(onFocusEnter);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
    onEveryFocusRef.current = onEveryFocus;
    hasDataRef.current = hasData;
    forceRefreshRef.current = forceRefresh;
    skipFocusIncrementRef.current = skipFocusIncrement;
    onFocusEnterRef.current = onFocusEnter;
  });

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      const skipIncrement = skipFocusIncrementRef.current?.() ?? false;
      if (!skipIncrement) {
        focusCountRef.current += 1;
      }

      const focusCount = focusCountRef.current;
      const isFirstFocus = focusCount === 1;
      const now = Date.now();
      const stale = now - lastRefreshAtRef.current > staleMs;
      const dataReady = hasDataRef.current?.() ?? false;
      const meta: FocusStaleRefreshMeta = { isFirstFocus, stale, focusCount };
      const forced = forceRefreshRef.current?.(meta) ?? false;

      const run = () => {
        onEveryFocusRef.current?.(meta);
        if (!forced && !isFirstFocus && dataReady && !stale) return;
        void Promise.resolve(onRefreshRef.current(meta)).then(() => {
          lastRefreshAtRef.current = Date.now();
        });
      };

      const focusCleanup = onFocusEnterRef.current?.();

      let deferredCleanup: (() => void) | undefined;
      if (deferUntilInteractions) {
        const task = InteractionManager.runAfterInteractions(run);
        deferredCleanup = () => task.cancel();
      } else {
        run();
      }

      return () => {
        focusCleanup?.();
        deferredCleanup?.();
      };
    }, [enabled, staleMs, deferUntilInteractions])
  );
}
