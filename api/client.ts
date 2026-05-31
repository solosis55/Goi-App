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
    return "No se encontró la API en esta dirección (404). Revisa EXPO_PUBLIC_API_URL y que el servidor Goi Web esté en marcha.";
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
    return `No se pudo conectar con la API (${API_BASE_URL}). Comprueba que el servidor Goi Web esté en marcha y, en móvil físico, EXPO_PUBLIC_API_URL o npm start con la IP del PC.`;
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

/**
 * GET/POST JSON contra la misma API que consume Goi Web (`/api/...`).
 * Añade `Authorization: Bearer` si hay token guardado.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  const isFormData =
    typeof FormData !== "undefined" && options?.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const hint =
      err instanceof TypeError
        ? "No se pudo conectar con la API (red, URL o servidor apagado)."
        : "No se pudo conectar con la API.";
    throw new ApiError(hint, 0, "API_NETWORK_ERROR");
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

  if (parsed === undefined) {
    if (!rawText) return {} as T;
    throw new ApiError(
      "El servidor devolvió algo que no es JSON.",
      response.status,
      "API_INVALID_RESPONSE"
    );
  }

  return parsed as T;
}
