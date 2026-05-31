/**
 * Scroll necesario para completar el recorrido del brillo.
 * Valores más bajos = el beam avanza más por píxel de scroll (más ligado al dedo).
 */
export function postCardGoldBeamTravelPx(winHeight: number, cardHeight: number): number {
  const byCard = cardHeight * 0.55;
  const byScreen = winHeight * 0.28;
  return Math.max(byScreen, byCard, 220);
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
