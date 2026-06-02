import { API_BASE_URL } from "./config";
import { emitAuthExpired } from "./authEvents";
import { clearStoredAuth, getAuthToken } from "./session";

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function shouldExpireSession(status: number, code: string) {
  return (
    status === 401 ||
    code === "AUTH_UNAUTHORIZED" ||
    code === "AUTH_TOKEN_INVALID" ||
    code === "AUTH_SESSION_STALE"
  );
}

function fallbackMessageForFailedRequest(status: number): string {
  if (status === 404) {
    return "No se encontró la API en esta dirección (404). Revisa EXPO_PUBLIC_API_URL y que Goi Server esté en marcha (npm run dev en :4000).";
  }
  if (status >= 500) {
    return `Error en el servidor (${status}). Inténtalo más tarde o revisa los logs del backend.`;
  }
  if (status === 401) {
    return "Sesión caducada o no reconocida. Inicia sesión de nuevo.";
  }
  if (status === 403) {
    return "No tienes permiso para esta acción (403).";
  }
  if (status === 0) {
    return `No se pudo conectar con la API (${API_BASE_URL}). Comprueba que Goi Server esté en marcha (npm run dev) y, en móvil físico, EXPO_PUBLIC_API_URL o npm start con la IP del PC.`;
  }
  return `La API respondió con un error (${status}).`;
}

/** Mensaje cuando el cuerpo JSON no trae `message` útil. */
function fallbackMessageForErrorCode(code: string, status: number): string | null {
  switch (code) {
    case "AUTH_UNAUTHORIZED":
    case "AUTH_TOKEN_INVALID":
    case "AUTH_SESSION_STALE":
      return "Tu sesión ha caducado o el token no es válido. Inicia sesión de nuevo.";
    case "API_NETWORK_ERROR":
      return null;
    case "POST_INVALID_INPUT":
      return "Los datos enviados no cumplen las reglas del servidor (contenido, visibilidad, etc.).";
    default:
      return status === 401 || status === 403
        ? "La petición no fue aceptada. Revisa sesión y permisos."
        : null;
  }
}

function resolveErrorMessage(status: number, code: string, serverMessage: string | undefined): string {
  const trimmed = typeof serverMessage === "string" ? serverMessage.trim() : "";
  if (trimmed.length > 0) return trimmed;
  const byCode = fallbackMessageForErrorCode(code, status);
  if (byCode) return byCode;
  return fallbackMessageForFailedRequest(status);
}

async function handleSessionExpired(code?: string) {
  await clearStoredAuth();
  emitAuthExpired({ code });
}

export type ApiFetchOptions = RequestInit & {
  baseUrl?: string;
  timeoutMs?: number;
};

const API_TIMEOUT_MS = 12_000;

function mergeAbortSignal(
  userSignal: AbortSignal | null | undefined,
  timeoutMs: number
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (userSignal) {
    if (userSignal.aborted) controller.abort();
    else userSignal.addEventListener("abort", onAbort);
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (userSignal) userSignal.removeEventListener("abort", onAbort);
    },
  };
}

/**
 * GET/POST JSON contra la API (`/api/...`).
 * Añade `Authorization: Bearer` si hay token guardado.
 */
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { baseUrl, timeoutMs, ...fetchOptions } = options ?? {};
  const token = await getAuthToken();
  const root = baseUrl ?? API_BASE_URL;
  const url = `${root}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(fetchOptions?.headers as Record<string, string> | undefined),
  };

  const isFormData =
    typeof FormData !== "undefined" && fetchOptions?.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  const requestTimeout = timeoutMs ?? API_TIMEOUT_MS;
  const { signal, cleanup } = mergeAbortSignal(fetchOptions?.signal, requestTimeout);
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    const hint = aborted
      ? "La API tardó demasiado en responder (timeout). Comprueba Goi Server (:4000) y Neon; en Goi Server ejecuta npm run db:setup si ves errores de columnas."
      : err instanceof TypeError
        ? "No se pudo conectar con la API (red, URL o servidor apagado)."
        : "No se pudo conectar con la API.";
    throw new ApiError(hint, 0, "API_NETWORK_ERROR");
  } finally {
    cleanup();
  }

  const rawText = await response.text();
  let parsed: unknown;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = undefined;
    }
  }

  const data = (parsed && typeof parsed === "object" ? parsed : {}) as T & ApiErrorBody;

  if (!response.ok) {
    const hasServerCode = typeof data.code === "string" && data.code.trim().length > 0;
    const code = hasServerCode ? data.code!.trim() : "API_ERROR";
    const message = resolveErrorMessage(response.status, code, data.message);
    const apiError = new ApiError(message, response.status, code);
    if (shouldExpireSession(apiError.status, apiError.code)) {
      await handleSessionExpired(apiError.code);
    }
    throw apiError;
  }

  if (response.status === 204 || !rawText) {
    return {} as T;
  }

  if (parsed === undefined) {
    throw new ApiError(
      "El servidor devolvió algo que no es JSON.",
      response.status,
      "API_INVALID_RESPONSE"
    );
  }

  return parsed as T;
}
