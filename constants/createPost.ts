import type { CreatePostInput } from "../types/post";

/** Alineado con Goi Web / servidor. */
export const POST_IMAGE_MAX_FILES = 4;
export const POST_BODY_MIN = 4;
export const POST_BODY_MAX = 280;

export type PostVisibility = NonNullable<CreatePostInput["visibility"]>;

export const POST_VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: "public", label: "Público" },
  { value: "followers", label: "Seguidores" },
  { value: "private", label: "Solo yo" },
];

export const POST_VISIBILITY_CHIPS = POST_VISIBILITY_OPTIONS.map((o) => ({
  id: o.value,
  label: o.label,
}));

export function visibilityDescription(visibility: PostVisibility): string {
  if (visibility === "followers") return "Solo quienes te siguen";
  if (visibility === "private") return "Nadie más en el feed";
  return "Visible para toda la comunidad";
}
