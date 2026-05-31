import { AUTH } from "./authUi";

/** Tokens mínimos para el compositor de comentarios (evita pasar `palette` completo al feed). */
export const POST_CARD_COMPOSER_THEME = {
  textMuted: AUTH.muted,
  textSteel: AUTH.steel,
  border: AUTH.fieldBorder,
  fieldBg: "#141416",
  primary: AUTH.gold,
} as const;
