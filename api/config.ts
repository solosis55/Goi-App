import Constants from "expo-constants";
import { Platform } from "react-native";

const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const API_PORT = 4000;

const DEV_LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * En Expo Go (dev), Metro expone `hostUri` (ej. `192.168.1.31:8081`). Usamos la misma IP para la API
 * en el móvil físico, sin depender de un `.env` manual.
 */
function apiBaseFromExpoDevHost(): string | null {
  if (!__DEV__) return null;

  const hostUri = Constants.expoConfig?.hostUri?.trim();
  if (!hostUri) return null;

  try {
    const withScheme = hostUri.includes("://") ? hostUri : `http://${hostUri}`;
    const { hostname } = new URL(withScheme);
    if (!hostname || DEV_LOOPBACK_HOSTS.has(hostname.toLowerCase())) return null;
    return `http://${hostname}:${API_PORT}/api`;
  } catch {
    const hostname = hostUri.split(":")[0]?.trim();
    if (!hostname || DEV_LOOPBACK_HOSTS.has(hostname.toLowerCase())) return null;
    return `http://${hostname}:${API_PORT}/api`;
  }
}

/**
 * URL base de la API (incluye `/api`), misma convención que `VITE_API_URL` en Goi Web.
 *
 * - **Emulador Android:** `http://10.0.2.2:4000/api` (o `.env`).
 * - **Móvil físico + Expo Go:** IP de `hostUri` si arrancas con `npm start` / QR en LAN.
 * - **Override:** `EXPO_PUBLIC_API_URL` en `.env` (reinicia Metro).
 */
function resolveDevApiBase(): string {
  if (envUrl && envUrl.length > 0) return envUrl.replace(/\/$/, "");

  const fromExpoHost = apiBaseFromExpoDevHost();
  if (fromExpoHost) return fromExpoHost;

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}/api`;
  }
  return `http://127.0.0.1:${API_PORT}/api`;
}

export const API_BASE_URL = resolveDevApiBase();

/** Origen del servidor sin `/api` (p. ej. `http://127.0.0.1:4000`) para rutas estáticas `/uploads/...`. */
export function getApiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/i, "");
}

/**
 * Convierte URL del backend en absoluta usable en el dispositivo.
 * - Rutas `/uploads/...` → origen de la API actual.
 * - URLs con `localhost` del backend en PC se reescriben al origen del dispositivo.
 */
export function resolveMediaUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("data:")) return u;

  const origin = getApiOrigin();

  if (u.startsWith("http://") || u.startsWith("https://")) {
    try {
      const parsed = new URL(u);
      const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      if (DEV_LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())) {
        return `${origin}${path}`;
      }
      return u;
    } catch {
      return u;
    }
  }

  if (u.startsWith("/")) return `${origin}${u}`;
  return u;
}
