import { POST_BODY_MAX, POST_BODY_MIN } from "../constants/createPost";

export type CreatePostValidation = {
  canSubmit: boolean;
  hint: string;
  charCount: number;
};

export function validateCreatePost(content: string, imageCount: number): CreatePostValidation {
  const trimmed = content.trim();
  const charCount = trimmed.length;

  if (imageCount === 0 && charCount < POST_BODY_MIN) {
    const need = POST_BODY_MIN - charCount;
    return {
      canSubmit: false,
      hint: `Escribe al menos ${need} caracteres más o adjunta una foto.`,
      charCount,
    };
  }

  if (charCount > POST_BODY_MAX) {
    return {
      canSubmit: false,
      hint: `Te pasaste por ${charCount - POST_BODY_MAX} caracteres.`,
      charCount,
    };
  }

  return { canSubmit: true, hint: "", charCount };
}
