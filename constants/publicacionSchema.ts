import { z } from "zod";

/** Publicación de texto (equivalente a “Note” del enunciado). */
export const publicacionTextoSchema = z.object({
  tipo: z.literal("texto"),
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres"),
  contenido: z.string().min(1, "El contenido no puede estar vacío"),
});

/** Lista dinámica de ítems (equivalente a “ChecklistNote”). */
export const publicacionListaSchema = z.object({
  tipo: z.literal("lista"),
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres"),
  items: z
    .array(z.string())
    .min(1, "Añade al menos un ítem")
    .refine(
      (arr) => arr.some((s) => s.trim().length > 0),
      "Los ítems no pueden estar todos vacíos"
    ),
});

/** Idea con color y etiquetas (equivalente a “IdeaNote”). */
export const publicacionIdeaSchema = z.object({
  tipo: z.literal("idea"),
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres"),
  color: z.string().min(1, "Elige un color"),
  tags: z
    .string()
    .min(1, "Indica al menos una etiqueta (separadas por comas)"),
});

export const publicacionSchema = z.discriminatedUnion("tipo", [
  publicacionTextoSchema,
  publicacionListaSchema,
  publicacionIdeaSchema,
]);

export type PublicacionForm = z.infer<typeof publicacionSchema>;

const POST_BODY_MIN = 4;
const POST_BODY_MAX = 280;

/**
 * Convierte el formulario de prácticas en el campo `content` que espera Goi Web (`POST /posts`).
 * Sin imágenes, el servidor exige longitud entre 4 y 280 caracteres (tras `trim` en servidor).
 */
export function buildPostContentForApi(data: PublicacionForm): string {
  switch (data.tipo) {
    case "texto":
      return `${data.titulo.trim()}\n\n${data.contenido.trim()}`;
    case "lista": {
      const lines = data.items.map((s) => s.trim()).filter(Boolean);
      return `${data.titulo.trim()}\n\n${lines.map((l) => `• ${l}`).join("\n")}`;
    }
    case "idea":
      return `${data.titulo.trim()}\nEtiquetas: ${data.tags.trim()}\nColor: ${data.color}`;
    default:
      return "";
  }
}

export function validatePostBodyLength(content: string): string | null {
  const len = content.trim().length;
  if (len < POST_BODY_MIN) {
    return `El texto publicado debe tener al menos ${POST_BODY_MIN} caracteres (requisito del servidor).`;
  }
  if (len > POST_BODY_MAX) {
    return `El texto no puede superar ${POST_BODY_MAX} caracteres. Acorta título o cuerpo.`;
  }
  return null;
}
