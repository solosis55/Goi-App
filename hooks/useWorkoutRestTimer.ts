import { useCallback, useEffect, useRef, useState } from "react";

type UseWorkoutRestTimerOptions = {
  onComplete?: () => void;
};

export function useWorkoutRestTimer(options?: UseWorkoutRestTimerOptions) {
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const active = secondsLeft > 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      const total = Math.max(1, Math.floor(seconds));
      setTotalSeconds(total);
      setSecondsLeft(total);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearTimer();
            setTotalSeconds(0);
            if (s === 1) onCompleteRef.current?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [clearTimer]
  );

  const skip = useCallback(() => {
    clearTimer();
    setSecondsLeft(0);
    setTotalSeconds(0);
  }, [clearTimer]);

  const addSeconds = useCallback(
    (delta: number) => {
      setSecondsLeft((s) => {
        const next = Math.max(0, s + delta);
        if (next === 0 && s > 0) {
          clearTimer();
          setTotalSeconds(0);
          queueMicrotask(() => onCompleteRef.current?.());
        }
        return next;
      });
    },
    [clearTimer]
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  const progress =
    totalSeconds > 0 && secondsLeft > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;

  return { secondsLeft, totalSeconds, progress, active, start, skip, addSeconds };
}
