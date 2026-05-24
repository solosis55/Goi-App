/**
 * Scroll necesario para completar el recorrido.
 * Escala con la altura de la card para que el gesto se sienta similar en todas.
 */
export function postCardGoldBeamTravelPx(winHeight: number, cardHeight: number): number {
  const byCard = cardHeight * 0.78;
  const byScreen = winHeight * 0.42;
  return Math.max(byScreen, byCard);
}

/** Progreso 0→1 a partir del desplazamiento del feed (fiable en Android). */
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
