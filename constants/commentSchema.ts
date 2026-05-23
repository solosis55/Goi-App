import { z } from "zod";

/** Misma longitud que el servidor (`createComment`: 1–180). */
export const commentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escribe un comentario")
    .max(180, "Máximo 180 caracteres"),
});

export type CommentForm = z.infer<typeof commentFormSchema>;
