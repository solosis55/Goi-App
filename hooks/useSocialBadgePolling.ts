import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useSocialHub } from "../context/SocialHubContext";

const POLL_FAST_MS = 90_000;
const POLL_SLOW_MS = 180_000;
const BADGE_FOCUS_MIN_MS = 12_000;

type SocialBadgePollingOptions = {
  /** Intervalo más corto cuando el usuario está en Social activo. */
  fast?: boolean;
};

/**
 * Refresca badges de Social/Actividad periódicamente con la app activa.
 */
export function useSocialBadgePolling(enabled = true, options?: SocialBadgePollingOptions) {
  const { refreshBadge } = useSocialHub();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fastRef = useRef(options?.fast ?? false);
  const lastFocusRefreshRef = useRef(0);

  fastRef.current = options?.fast ?? false;

  const pollMs = useCallback(() => (fastRef.current ? POLL_FAST_MS : POLL_SLOW_MS), []);

  const start = useCallback(() => {
    if (!enabled) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      void refreshBadge();
    }, pollMs());
  }, [enabled, refreshBadge, pollMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      const now = Date.now();
      if (now - lastFocusRefreshRef.current >= BADGE_FOCUS_MIN_MS) {
        lastFocusRefreshRef.current = now;
        void refreshBadge();
      }
      start();
      return stop;
    }, [enabled, refreshBadge, start, stop])
  );

  useEffect(() => {
    if (!enabled) return;
    const onChange = (state: AppStateStatus) => {
      if (state === "active") {
        void refreshBadge();
        start();
      } else {
        stop();
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => {
      sub.remove();
      stop();
    };
  }, [enabled, refreshBadge, start, stop]);

  useEffect(() => {
    if (!enabled) return;
    start();
    return stop;
  }, [options?.fast, enabled, start, stop]);
}
