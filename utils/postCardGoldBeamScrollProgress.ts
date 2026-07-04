/** Scroll necesario para completar el recorrido del brillo (más corto = más visible al desplazar). */
export function postCardGoldBeamTravelPx(winHeight: number, cardHeight: number): number {
  const byCard = cardHeight * 0.42;
  const byScreen = winHeight * 0.2;
  return Math.max(byScreen, byCard, 140);
}

/** Progreso 0→1 a partir del desplazamiento del feed. */
export function postCardGoldBeamProgressFromScroll(
  contentOffsetY: number,
  anchorScrollY: number,
  anchorProgress: number,
  winHeight: number,
  cardHeight: number
): number {
  const travel = postCardGoldBeamTravelPx(winHeight, cardHeight);
  const delta = contentOffsetY - anchorScrollY;
  const t = anchorProgress + delta / travel;
  return Math.min(1, Math.max(0, t));
}
