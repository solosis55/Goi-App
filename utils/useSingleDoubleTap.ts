import { useCallback, useRef } from "react";

const DEFAULT_DELAY_MS = 280;

/**
 * Diferencia un toque (p. ej. abrir lightbox) de un doble toque (p. ej. like).
 */
export function useSingleDoubleTap(onSingle: () => void, onDouble: () => void, delayMs = DEFAULT_DELAY_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delayMs) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastTapRef.current = 0;
      onDouble();
      return;
    }

    lastTapRef.current = now;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onSingle();
    }, delayMs);
  }, [delayMs, onDouble, onSingle]);
}
