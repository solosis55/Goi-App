/** Ancho de tarjeta en previews del editor / chooser. */
export function resolvePreviewCardWidth(
  windowWidth: number,
  opts?: { fullBleed?: boolean; layoutWidth?: number }
): number {
  const fullBleed = opts?.fullBleed ?? true;
  if (opts?.layoutWidth != null) return opts.layoutWidth;
  return fullBleed ? windowWidth : windowWidth - 32;
}
