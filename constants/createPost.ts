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
