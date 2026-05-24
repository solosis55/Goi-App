/** Progreso 0→1 lineal y lento según el top de la tarjeta en pantalla (reversible al bajar). */
export function postCardGoldBeamProgress(
  cardTop: number,
  cardHeight: number,
  winHeight: number
): number {
  const cardBottom = cardTop + cardHeight;
  if (cardBottom <= 0 || cardTop >= winHeight) return 0;

  const startTop = winHeight * 0.92;
  const endTop = winHeight * 0.06;

  if (cardTop >= startTop) return 0;

  const t = (startTop - cardTop) / (startTop - endTop);
  return Math.min(1, Math.max(0, t));
}

export function isCardOnScreen(cardTop: number, cardHeight: number, winHeight: number): boolean {
  return cardTop + cardHeight > 4 && cardTop < winHeight - 4;
}
