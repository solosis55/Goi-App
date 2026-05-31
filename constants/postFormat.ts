/** Formato visual en el feed. */
export type PostFormat = "standard" | "training";

export const POST_FORMAT_LABELS: Record<PostFormat, string> = {
  standard: "Publicación",
  training: "Training",
};

export function parsePostFormat(raw: string | undefined, fallback: PostFormat = "standard"): PostFormat {
  if (raw === "training" || raw === "standard") return raw;
  return fallback;
}
