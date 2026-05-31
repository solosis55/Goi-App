import type { PostFormat } from "../../../constants/postFormat";
import { POST_PREVIEW_LAYOUT, previewMediaHeight } from "./postPreviewTheme";

/** Training: foto insertada (no full-bleed), para no parecer publicación clásica. */
export const TRAINING_INSET_MEDIA = {
  widthRatio: 0.9,
  horizontalPad: 14,
  borderRadius: 12,
  maxHeightRatio: 0.36,
} as const;

/** Foto insertada en posts Training del feed (más compacta que el editor). */
export const TRAINING_FEED_INSET = {
  widthRatio: 0.82,
  maxHeight: 220,
} as const;

export function trainingInsetMediaWidth(cardWidth: number): number {
  return Math.round(cardWidth * TRAINING_INSET_MEDIA.widthRatio);
}

export function trainingInsetMediaHeight(
  insetWidth: number,
  options?: { maxHeight?: number }
): number {
  const natural = previewMediaHeight(insetWidth, "training", false);
  const cap = options?.maxHeight ?? Math.round(insetWidth * 1.15);
  return Math.min(natural, cap);
}

export function trainingFeedInsetWidth(cardWidth: number): number {
  return Math.round(cardWidth * TRAINING_FEED_INSET.widthRatio);
}

export function trainingFeedInsetHeight(insetWidth: number): number {
  const natural = Math.round(insetWidth * 0.85);
  return Math.min(natural, TRAINING_FEED_INSET.maxHeight);
}

export function standardMediaWidth(cardWidth: number): number {
  return cardWidth;
}

export function standardMediaHeight(
  width: number,
  compact: boolean,
  options?: { maxHeight?: number }
): number {
  return previewMediaHeight(width, "standard", compact, options);
}

export function usesInsetTrainingMedia(format: PostFormat, hasMedia: boolean): boolean {
  return format === "training" && hasMedia;
}
