export type ProfileBadge = { id: string; label: string };

/** Badges de perfil alineados con Goi Web (`ProfilePage`). */
export function computeProfileBadges(input: {
  sessionsThisWeek: number;
  totalSessions: number;
  routinesCount: number;
  postsCount: number;
}): ProfileBadge[] {
  const badges: ProfileBadge[] = [];
  if (input.sessionsThisWeek >= 3) badges.push({ id: "week", label: "Constancia semanal" });
  if (input.totalSessions >= 1) badges.push({ id: "first", label: "Entrenando" });
  if (input.routinesCount >= 3) badges.push({ id: "routines", label: "Varias rutinas" });
  if (input.postsCount >= 1) badges.push({ id: "voice", label: "Publicando" });
  return badges;
}
