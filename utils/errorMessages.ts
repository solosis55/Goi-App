import { ApiError } from "../api/client";

/** Misma tabla que `Goi Web` (`src/utils/errorMessages.ts`) para textos de API en español. */
const codeMessageMap: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Email o contraseña incorrectos.",
  AUTH_EMAIL_IN_USE: "Ese email ya está registrado.",
  AUTH_REGISTER_INVALID_INPUT: "Revisa usuario, email y contraseña (mínimo 6 caracteres).",
  AUTH_LOGIN_INVALID_INPUT: "Debes introducir email y contraseña.",
  AUTH_UNAUTHORIZED: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
  AUTH_TOKEN_INVALID: "Tu sesión no es válida. Vuelve a iniciar sesión.",
  AUTH_SESSION_STALE:
    "Tu sesión ya no coincide con el servidor (los datos locales se reiniciaron o otro entorno). Cierra sesión e inicia sesión otra vez.",
  AUTH_FORBIDDEN: "No tienes permisos para realizar esta acción.",
  AUTH_PROFILE_INVALID_INPUT: "Revisa los datos del perfil y vuelve a intentarlo.",
  AUTH_RATE_LIMITED: "Demasiados intentos. Espera unos minutos antes de reintentar.",
  AUTH_JWT_NOT_CONFIGURED:
    "El servidor no tiene configurada la variable JWT_SECRET. Añádela en el entorno del backend y reinicia.",
  AUTH_FORGOT_PASSWORD_INVALID_INPUT: "Introduce un correo electrónico válido.",
  AUTH_RESET_INVALID_INPUT: "La contraseña debe tener al menos 6 caracteres y el enlace debe ser válido.",
  AUTH_RESET_TOKEN_INVALID: "El enlace de restablecimiento no es válido o ha caducado. Solicita uno nuevo.",
  AUTH_USER_NOT_FOUND: "El usuario no existe.",
  API_NETWORK_ERROR:
    "No se pudo conectar con la API. Revisa la red o EXPO_PUBLIC_API_URL y que el servidor Goi Web esté en marcha.",
  API_INVALID_RESPONSE: "La API devolvió un formato inesperado. Revisa la URL del backend.",
  COMMENT_INVALID_INPUT: "El comentario debe tener entre 1 y 180 caracteres.",
  POST_NOT_FOUND: "La publicación ya no existe.",
  POST_FORBIDDEN: "No puedes interactuar con esta publicación.",
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return codeMessageMap[error.code] ?? error.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
