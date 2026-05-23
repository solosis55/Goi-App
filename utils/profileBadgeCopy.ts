import type { ProfileBadge } from "./profileBadges";

export const PROFILE_BADGE_COPY: Record<
  string,
  { label: string; description: string }
> = {
  week: {
    label: "Constancia semanal",
    description: "Ha completado 3 o más sesiones de entreno en los últimos 7 días.",
  },
  first: {
    label: "Primer entreno",
    description: "Ha registrado al menos una sesión de entrenamiento en GoI.",
  },
  routines: {
    label: "Varias rutinas",
    description: "Tiene 3 o más rutinas creadas en su biblioteca.",
  },
  voice: {
    label: "En el feed",
    description: "Ha publicado al menos una vez en la comunidad.",
  },
};

export function badgesWithCopy(badges: ProfileBadge[]): Array<ProfileBadge & { description: string }> {
  return badges.map((b) => ({
    ...b,
    label: PROFILE_BADGE_COPY[b.id]?.label ?? b.label,
    description: PROFILE_BADGE_COPY[b.id]?.description ?? b.label,
  }));
}
