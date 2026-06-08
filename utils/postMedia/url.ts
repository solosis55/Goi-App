import { Platform } from "react-native";
import { resolveMediaUrl } from "../../api/config";

const DATA_URL_PREFIX = "data:";

export function isDataUrl(url: string): boolean {
  return url.trim().toLowerCase().startsWith(DATA_URL_PREFIX);
}

function hashMediaUrl(url: string): string {
  let hash = 0;
  const sample = url.length > 2048 ? url.slice(0, 2048) : url;
  for (let i = 0; i < sample.length; i++) {
    hash = (hash * 31 + sample.charCodeAt(i)) | 0;
  }
  return String(hash >>> 0);
}

/** URL usable en el feed (HTTP o `/uploads`). En móvil nunca devuelve data URLs. */
export function resolveUrl(url: string): string | null {
  const u = url.trim();
  if (!u) return null;

  if (isDataUrl(u)) {
    return Platform.OS === "web" ? u : null;
  }

  const resolved = resolveMediaUrl(u);
  return resolved.trim() ? resolved : null;
}

/** Clave estable para caché / recycling de expo-image en el feed. */
export function recyclingKey(url: string, suffix = ""): string {
  const u = url.trim();
  const base = isDataUrl(u) ? `data-${u.length}-${hashMediaUrl(u)}` : (resolveUrl(u) ?? u);
  return suffix ? `feed-media-${suffix}-${base}` : `feed-media-${base}`;
}
