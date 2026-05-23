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

/** Mapa userId → firma de slides vistas (misma clave que Goi Web). */
export const STORY_SEEN_STORAGE_KEY = "goi:storySeen:v1";

/** Lista de cuentas guardadas en el dispositivo (`{ activeUserId, accounts[] }`) — web / legacy. */
export const ACCOUNTS_VAULT_STORAGE_KEY = "goi-accounts-vault";

/** Misma bóveda en SecureStore (nativo). */
export const ACCOUNTS_VAULT_SECURE_KEY = "goi-accounts-vault-secure";

/** Borrador de rutina en creación (misma clave que Goi Web `sessionStorage`). */
export const WORKOUT_CREATE_DRAFT_KEY = "goi:workoutCreateDraft";

/** Borrador de rutina en edición (solo app móvil; un borrador activo). */
export const WORKOUT_EDIT_DRAFT_KEY = "goi:workoutEditDraft";

/** Sesión de entreno en curso (realizar rutina antes de registrar en API). */
export const ACTIVE_WORKOUT_SESSION_KEY = "goi:activeWorkoutSession";

/** Segundos de descanso preferidos entre series al entrenar. */
export const WORKOUT_REST_PREF_KEY = "goi:workoutRestPrefSec";

/** Último rendimiento registrado por ejercicio (mapa JSON en AsyncStorage). */
export const EXERCISE_LAST_PERFORMANCE_KEY = "goi:exerciseLastPerformance:v1";

/** "1" = sonido al terminar descanso; "0" = solo vibración. */
export const WORKOUT_REST_SOUND_KEY = "goi:workoutRestSound";
