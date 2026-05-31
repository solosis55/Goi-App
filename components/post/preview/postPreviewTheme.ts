import { AUTH } from "../../../constants/authUi";
import type { PostFormat } from "../../../constants/postFormat";

/** Estilo compartido de tarjeta en previews (sin variantes por formato). */
export const POST_PREVIEW_CARD = {
  border: "rgba(82, 82, 82, 0.55)",
  background: "#0a0a0c",
  fadeEnd: "#0a0a0c",
  chooserClipBg: "#0a0a0c",
  metaColor: AUTH.faint,
  placeholder: {
    gradStart: "#161618",
    gradMid: "#121214",
    gradEnd: "#0c0c0e",
    ring: "rgba(115, 115, 115, 0.2)",
    ringBorder: "rgba(115, 115, 115, 0.35)",
    label: "Tu foto aquí",
  },
} as const;

/** Layout por formato (misma piel; distinta estructura). */
export const POST_PREVIEW_LAYOUT: Record<
  PostFormat,
  { mediaAspectRatio: number; showMediaPlaceholder: boolean }
> = {
  standard: { mediaAspectRatio: 1, showMediaPlaceholder: true },
  training: { mediaAspectRatio: 4 / 5, showMediaPlaceholder: false },
};

export function previewMediaHeight(
  width: number,
  format: PostFormat,
  compact: boolean,
  options?: { fullBleed?: boolean; maxHeight?: number }
): number {
  const ratio = POST_PREVIEW_LAYOUT[format].mediaAspectRatio;
  const natural = width / ratio;
  if (options?.maxHeight != null) return Math.min(natural, options.maxHeight);
  if (!compact) return natural;
  const cap = format === "training" ? 168 : 200;
  return Math.min(cap, natural);
}

export function shouldShowPreviewMediaPlaceholder(format: PostFormat, hasMedia: boolean): boolean {
  if (hasMedia) return false;
  return POST_PREVIEW_LAYOUT[format].showMediaPlaceholder;
}
