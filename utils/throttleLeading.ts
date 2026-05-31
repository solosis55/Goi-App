/** Invoca `fn` como máximo una vez cada `intervalMs` (leading edge). */
export function throttleLeading<T extends (...args: never[]) => void>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const invoke = () => {
    if (!lastArgs) return;
    const args = lastArgs;
    lastArgs = null;
    lastCall = Date.now();
    fn(...args);
  };

  return (...args: Parameters<T>) => {
    lastArgs = args;
    const now = Date.now();
    const elapsed = now - lastCall;

    if (elapsed >= intervalMs) {
      if (trailingTimer) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
      }
      invoke();
      return;
    }

    if (trailingTimer) return;

    trailingTimer = setTimeout(() => {
      trailingTimer = null;
      invoke();
    }, intervalMs - elapsed);
  };
}
