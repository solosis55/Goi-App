const R = 16;
const INSET = 1.5;

function dims(w: number, h: number, r: number, inset: number) {
  const x0 = inset;
  const y0 = inset;
  const iw = w - 2 * inset;
  const ih = h - 2 * inset;
  const ri = Math.max(4, r - inset * 0.25);
  return { x0, y0, iw, ih, ri };
}

/** Arriba → derecha → esquina inferior derecha (sin borde inferior ni izquierdo). */
export function postCardGoldBeamPath(w: number, h: number): string {
  const { x0, y0, iw, ih, ri } = dims(w, h, R, INSET);
  if (iw < 2 * ri || ih < 2 * ri) {
    return `M ${x0} ${y0} L ${x0 + iw} ${y0} L ${x0 + iw} ${y0 + ih}`;
  }
  return [
    `M ${x0 + ri} ${y0}`,
    `H ${x0 + iw - ri}`,
    `Q ${x0 + iw} ${y0} ${x0 + iw} ${y0 + ri}`,
    `V ${y0 + ih - ri}`,
    `Q ${x0 + iw} ${y0 + ih} ${x0 + iw - ri} ${y0 + ih}`,
  ].join(" ");
}

export function postCardGoldBeamPathLength(w: number, h: number): number {
  const { iw, ih, ri } = dims(w, h, R, INSET);
  if (iw < 2 * ri || ih < 2 * ri) return iw + ih;
  const top = iw - 2 * ri;
  const right = ih - 2 * ri;
  return top + right + Math.PI * ri;
}

export function postCardGoldBeamPointAt(
  distance: number,
  w: number,
  h: number
): { x: number; y: number } {
  const { x0, y0, iw, ih, ri } = dims(w, h, R, INSET);
  const len = postCardGoldBeamPathLength(w, h);
  const s = Math.min(len, Math.max(0, distance));

  if (iw < 2 * ri || ih < 2 * ri) {
    const edges = [iw, ih];
    const corners = [
      { x: x0, y: y0 },
      { x: x0 + iw, y: y0 },
      { x: x0 + iw, y: y0 + ih },
    ];
    let d = s;
    for (let i = 0; i < 2; i++) {
      if (d <= edges[i]) {
        const a = corners[i]!;
        const b = corners[i + 1]!;
        const t = edges[i] > 0 ? d / edges[i] : 0;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
      d -= edges[i]!;
    }
    return { x: x0 + iw, y: y0 + ih };
  }

  const top = iw - 2 * ri;
  const corner = (Math.PI * ri) / 2;
  const right = ih - 2 * ri;
  let d = s;

  if (d <= top) return { x: x0 + ri + d, y: y0 };
  d -= top;

  if (d <= corner) {
    const angle = -Math.PI / 2 + (d / corner) * (Math.PI / 2);
    return {
      x: x0 + iw - ri + ri * Math.cos(angle),
      y: y0 + ri + ri * Math.sin(angle),
    };
  }
  d -= corner;

  if (d <= right) return { x: x0 + iw, y: y0 + ri + d };
  d -= right;

  if (d <= corner) {
    const angle = (d / corner) * (Math.PI / 2);
    return {
      x: x0 + iw - ri + ri * Math.cos(angle),
      y: y0 + ih - ri + ri * Math.sin(angle),
    };
  }

  return { x: x0 + iw - ri, y: y0 + ih };
}

/** Tramo del brillo: % del perímetro acotado para cards altas y bajas. */
export function postCardGoldBeamGlowLength(w: number, h: number): number {
  const pathLen = postCardGoldBeamPathLength(w, h);
  return Math.min(200, Math.max(104, pathLen * 0.26));
}

/** Fracción inicial del recorrido en la que el brillo crece desde la esquina. */
const REVEAL_PROGRESS = 0.07;
/** Fracción final en la que el brillo se desvanece en la esquina inferior derecha. */
const FADE_OUT_START = 0.88;

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export type PostCardGoldBeamGlowFrame = {
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 0→1 al salir de la esquina (evita aparición brusca). */
  opacity: number;
};

/** Segmento visible del brillo (sin strokeDashoffset; fiable en Android). */
export function postCardGoldBeamGlowPath(
  progress: number,
  w: number,
  h: number
): PostCardGoldBeamGlowFrame {
  const pathLen = postCardGoldBeamPathLength(w, h);
  const fullGlowLen = postCardGoldBeamGlowLength(w, h);
  const p = Math.min(1, Math.max(0, progress));

  let start: number;
  let glowLen: number;
  let opacity: number;

  if (p < REVEAL_PROGRESS) {
    const reveal = smoothstep(p / REVEAL_PROGRESS);
    start = 0;
    glowLen = fullGlowLen * reveal;
    opacity = reveal;
  } else {
    const travel = (p - REVEAL_PROGRESS) / (1 - REVEAL_PROGRESS);
    const maxStart = Math.max(0, pathLen - fullGlowLen);
    start = travel * maxStart;
    glowLen = fullGlowLen;
    opacity = 1;

    if (p >= FADE_OUT_START) {
      const fadeOut = 1 - smoothstep((p - FADE_OUT_START) / (1 - FADE_OUT_START));
      opacity *= fadeOut;
      glowLen = fullGlowLen * (0.35 + 0.65 * fadeOut);
      start = Math.min(start, Math.max(0, pathLen - glowLen));
    }
  }

  if (glowLen < 3 || opacity < 0.02) {
    return { d: "", x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 };
  }

  const endDist = Math.min(pathLen, start + glowLen);
  const span = endDist - start;
  if (span < 3) {
    return { d: "", x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 };
  }

  const steps = Math.max(10, Math.ceil(span / 7));
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const dist = start + (span * i) / steps;
    points.push(postCardGoldBeamPointAt(dist, w, h));
  }

  const d = points
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
    .join(" ");

  const first = points[0]!;
  const last = points[points.length - 1]!;
  return { d, x1: first.x, y1: first.y, x2: last.x, y2: last.y, opacity };
}
