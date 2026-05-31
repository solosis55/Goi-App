import { resolveMediaUrl } from "../api/config";

const DATA_URL_PREFIX = "data:";

export function isPostMediaDataUrl(url: string): boolean {
  return url.trim().toLowerCase().startsWith(DATA_URL_PREFIX);
}

/** Hash corto para recyclingKey sin meter el base64 entero. */
function hashMediaUrl(url: string): string {
  let hash = 0;
  const sample = url.length > 2048 ? url.slice(0, 2048) : url;
  for (let i = 0; i < sample.length; i++) {
    hash = (hash * 31 + sample.charCodeAt(i)) | 0;
  }
  return String(hash >>> 0);
}

/**
 * URL usable en el feed (HTTP, ruta `/uploads` o data URL legacy del store).
 */
export function resolveFeedPostMediaUrl(url: string): string | null {
  const u = url.trim();
  if (!u) return null;

  if (isPostMediaDataUrl(u)) {
    return u;
  }

  const resolved = resolveMediaUrl(u);
  return resolved.trim() ? resolved : null;
}

/** Clave estable para caché / recycling de expo-image en el feed. */
export function feedPostMediaRecyclingKey(url: string, suffix = ""): string {
  const u = url.trim();
  const base = isPostMediaDataUrl(u)
    ? `data-${u.length}-${hashMediaUrl(u)}`
    : (resolveFeedPostMediaUrl(u) ?? u);
  return suffix ? `feed-media-${suffix}-${base}` : `feed-media-${base}`;
}

/** Si conviene omitir width/height en source (data URLs muy largas). */
export function feedPostMediaUsesInlineData(url: string): boolean {
  return isPostMediaDataUrl(url);
}
