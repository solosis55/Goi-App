import { getApiOrigin } from "../api/config";

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_URL?.trim().replace(/\/$/, "");

/** Texto y URL para compartir el perfil (deep link web cuando exista ruta pública). */
export function buildProfileShareContent(username: string, userId: string) {
  const handle = username.trim() || "usuario";
  const webBase = WEB_APP_URL || getApiOrigin();
  const profilePath = `/perfil/${encodeURIComponent(userId)}`;
  const url = webBase ? `${webBase}${profilePath}` : undefined;

  const message = url
    ? `Mi perfil en Goi: @${handle}\n${url}`
    : `Mi perfil en Goi: @${handle}\n\nAbre la app Goi para ver mi perfil.`;

  return {
    title: `@${handle} en Goi`,
    message,
    url,
  };
}
