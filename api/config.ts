import Constants from "expo-constants";
import { Platform } from "react-native";

const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const authEnvUrl = process.env.EXPO_PUBLIC_AUTH_API_URL?.trim();
const API_PORT = 4000;

const DEV_LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Hosts de túnel Expo/ngrok: no usar :4000 derivado del bundler. */
function isDevTunnelHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h.includes("ngrok") ||
    h.endsWith(".loca.lt") ||
    h.endsWith(".exp.direct") ||
    h.includes("expo.dev")
  );
}

/**
 * En Expo Go (dev), Metro expone `hostUri` (ej. `192.168.1.31:8081`). Usamos la misma IP para la API
 * en el móvil físico, sin depender de un `.env` manual.
 */
function expoDevHostUri(): string | null {
  const fromConfig = Constants.expoConfig?.hostUri?.trim();
  if (fromConfig) return fromConfig;

  const debuggerHost = Constants.expoGoConfig?.debuggerHost?.trim();
  if (debuggerHost) return debuggerHost;

  return null;
}

function apiBaseFromExpoDevHost(): string | null {
  if (!__DEV__) return null;

  const hostUri = expoDevHostUri();
  if (!hostUri) return null;

  try {
    const withScheme = hostUri.includes("://") ? hostUri : `http://${hostUri}`;
    const { hostname } = new URL(withScheme);
    if (!hostname || DEV_LOOPBACK_HOSTS.has(hostname.toLowerCase())) return null;
    if (isDevTunnelHost(hostname)) return null;
    return `http://${hostname}:${API_PORT}/api`;
  } catch {
    const hostname = hostUri.split(":")[0]?.trim();
    if (!hostname || DEV_LOOPBACK_HOSTS.has(hostname.toLowerCase())) return null;
    if (isDevTunnelHost(hostname)) return null;
    return `http://${hostname}:${API_PORT}/api`;
  }
}

/**
 * URL base de la API (incluye `/api`), misma convención que `VITE_API_URL` en Goi Web.
 *
 * - **Override explícito:** `EXPO_PUBLIC_API_URL` en `.env` (p. ej. Render `https://…`) tiene prioridad.
 * - **Móvil físico + Expo Go sin .env:** IP de `hostUri` → `:4000/api` en LAN.
 * - **Emulador Android:** `http://10.0.2.2:4000/api` si no hay override.
 */
function envPointsToDeviceLoopback(url: string): boolean {
  try {
    const withScheme = url.includes("://") ? url : `http://${url}`;
    const { hostname } = new URL(withScheme);
    return DEV_LOOPBACK_HOSTS.has(hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** `.env` con URL remota (Render, etc.): no sustituir por IP LAN de Metro. */
function isExplicitRemoteEnvUrl(url: string): boolean {
  try {
    const withScheme = url.includes("://") ? url : `https://${url}`;
    const { protocol, hostname } = new URL(withScheme);
    if (protocol === "https:") return true;
    if (DEV_LOOPBACK_HOSTS.has(hostname.toLowerCase())) return false;
    return hostname.includes(".");
  } catch {
    return false;
  }
}

function resolveDevApiBase(): string {
  if (envUrl && envUrl.length > 0) {
    const normalized = envUrl.replace(/\/$/, "");
    if (
      isExplicitRemoteEnvUrl(normalized) ||
      Platform.OS === "web" ||
      !envPointsToDeviceLoopback(normalized)
    ) {
      return normalized;
    }
  }

  const fromExpoHost = apiBaseFromExpoDevHost();
  if (fromExpoHost) return fromExpoHost;

  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}/api`;
  }
  return `http://127.0.0.1:${API_PORT}/api`;
}

/** Misma base que la API principal (Goi Server :4000). Override con EXPO_PUBLIC_AUTH_API_URL si hace falta. */
function resolveDevAuthApiBase(): string {
  if (authEnvUrl && authEnvUrl.length > 0) return authEnvUrl.replace(/\/$/, "");
  return resolveDevApiBase();
}

export const API_BASE_URL = resolveDevApiBase();
export const AUTH_API_BASE_URL = resolveDevAuthApiBase();

if (__DEV__) {
  console.log(`[Goi] API_BASE_URL → ${API_BASE_URL}`);
  if (AUTH_API_BASE_URL !== API_BASE_URL) {
    console.log(`[Goi] AUTH_API_BASE_URL → ${AUTH_API_BASE_URL}`);
  }
}

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
