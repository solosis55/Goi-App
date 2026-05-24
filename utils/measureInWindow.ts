export type WindowRect = { x: number; y: number; width: number; height: number };

type MeasurableHost = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
};

export function measureViewInWindow(
  view: MeasurableHost | null | undefined,
  onResult: (rect: WindowRect | null) => void
): void {
  if (!view?.measureInWindow) {
    onResult(null);
    return;
  }

  view.measureInWindow((x, y, width, height) => {
    if (width <= 0 || height <= 0) {
      onResult(null);
      return;
    }
    onResult({ x, y, width, height });
  });
}
