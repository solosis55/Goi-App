const REVEAL_PROGRESS = 0.07;
const FADE_OUT_START = 0.88;

function smoothstep(t: number): number {
  "worklet";
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export type BeamDashState = {
  dash1: number;
  dash2: number;
  dashOffset: number;
  opacity: number;
};

/** Estado de trazo para animar el brillo sobre un path SVG estático (UI thread). */
export function beamDashFromProgress(
  progress: number,
  pathLen: number,
  fullGlowLen: number
): BeamDashState {
  "worklet";
  const p = Math.min(1, Math.max(0, progress));

  let start = 0;
  let glowLen = 0;
  let opacity = 0;

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
    return { dash1: 0, dash2: pathLen, dashOffset: 0, opacity: 0 };
  }

  return {
    dash1: glowLen,
    dash2: Math.max(0.01, pathLen - glowLen),
    dashOffset: -start,
    opacity,
  };
}

export function beamProgressFromScrollDelta(delta: number, travelPx: number): number {
  "worklet";
  if (travelPx <= 0) return 0;
  return Math.min(1, Math.max(0, delta / travelPx));
}
