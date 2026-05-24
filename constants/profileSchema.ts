import { z } from "zod";

const sectionVisibilitySchema = z.enum(["public", "followers", "private"]);
const statsVisibilitySchema = z.enum(["public", "followers", "hidden"]);

/** Validación alineada con `updateProfile` del servidor Goi Web. */
export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Usuario: mínimo 3 caracteres")
    .max(24, "Usuario: máximo 24 caracteres"),
  bio: z.string().trim().max(200, "Bio: máximo 200 caracteres"),
  goal: z.string().trim().max(60, "Objetivo: máximo 60 caracteres"),
  location: z.string().trim().max(80, "Ubicación: máximo 80 caracteres"),
  websiteUrl: z.string().trim(),
  instagramUrl: z.string().trim(),
  stravaUrl: z.string().trim(),
  profileVisibility: z.enum(["public", "followers", "private", "request"]),
  profileSections: z.object({
    bio: sectionVisibilitySchema,
    stats: statsVisibilitySchema,
    sessions: sectionVisibilitySchema,
    socialLists: statsVisibilitySchema,
  }),
  discoverable: z.boolean(),
  requireAuthToView: z.boolean(),
  defaultPostVisibility: z.enum(["public", "followers", "private"]),
  bannerShowInFeed: z.boolean(),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;
