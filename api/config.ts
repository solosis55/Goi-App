import { Platform } from "react-native";

const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

/**
 * URL base de la API (incluye el segmento `/api`), misma convención que `VITE_API_URL` en Goi Web.
 *
 * - **Emulador Android → backend en tu PC:** por defecto `http://10.0.2.2:4000/api`.
 * - **iOS simulador / web:** `http://localhost:4000/api` o `http://127.0.0.1:4000/api`.
 * - **Dispositivo físico:** define `EXPO_PUBLIC_API_URL` (ej. `http://192.168.1.20:4000/api`).
 */
function defaultDevApiBase(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000/api";
  }
  return "http://127.0.0.1:4000/api";
}

export const API_BASE_URL = (envUrl && envUrl.length > 0 ? envUrl : defaultDevApiBase()).replace(
  /\/$/,
  ""
);

/** Origen del servidor sin `/api` (p. ej. `http://127.0.0.1:4000`) para rutas estáticas `/uploads/...`. */
export function getApiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/i, "");
}

/** Convierte URL relativa del backend en absoluta; deja `data:` y `http(s):` intactas. */
export function resolveMediaUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("data:") || u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${getApiOrigin()}${u}`;
  return u;
}
