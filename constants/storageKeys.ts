/** Misma clave que Goi Web (`src/constants/storageKeys.ts`) para JSON `{ token, user }` (web y migración). */
export const AUTH_STORAGE_KEY = "goi-auth";

/** En nativo la sesión vive en SecureStore con esta clave; en web se sigue usando `AUTH_STORAGE_KEY`. */
export const AUTH_SECURE_STORAGE_KEY = "goi-auth";

/** Si está activo, al arrancar con sesión guardada se pide biometría antes de usar el token. */
export const BIOMETRIC_UNLOCK_KEY = "goi-biometric-unlock";

/** Último email usado en login (solo conveniencia en el dispositivo; no es secreto). */
export const LAST_LOGIN_EMAIL_KEY = "goi-last-login-email";

/** Si es "1", el usuario ya vio el aviso inicial de la pantalla de inicio (logo / acceso). */
export const INDEX_START_HINT_SEEN_KEY = "goi-index-start-hint-seen";
