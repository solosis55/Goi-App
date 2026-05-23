import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UsePerformSetCountdownOptions = {
  onComplete?: () => void;
};

/**
 * Cuenta atrás local para AMRAP/Tempo (no compartir con el timer de descanso de sesión).
 */
export function usePerformSetCountdown(options?: UsePerformSetCountdownOptions) {
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;

  const [secondsLeft, setSecondsLeft] = useState(0);
  const secondsLeftRef = useRef(0);
  const totalStartedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsLeft(0);
    totalStartedRef.current = 0;
  }, [clearTimer]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      const total = Math.max(1, Math.floor(seconds));
      totalStartedRef.current = total;
      setSecondsLeft(total);
      secondsLeftRef.current = total;
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearTimer();
            totalStartedRef.current = 0;
            if (s === 1) {
              queueMicrotask(() => onCompleteRef.current?.());
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [clearTimer]
  );

  /** Detiene y devuelve segundos transcurridos (null si no estaba en marcha). */
  const stopEarly = useCallback((): number | null => {
    const total = totalStartedRef.current;
    if (total <= 0 || secondsLeftRef.current <= 0) {
      reset();
      return null;
    }
    const elapsed = total - secondsLeftRef.current;
    reset();
    return Math.max(0, elapsed);
  }, [reset]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const running = secondsLeft > 0;

  return useMemo(
    () => ({
      secondsLeft,
      running,
      start,
      stopEarly,
      reset,
    }),
    [secondsLeft, running, start, stopEarly, reset]
  );
}
