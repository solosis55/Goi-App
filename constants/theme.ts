import { AUTH } from "./authUi";

/**
 * Espaciados base (múltiplos de 4). Úsalos en `padding`, `margin`, `gap`, etc.
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export type SpacingKey = keyof typeof spacing;

export const typography = {
  fontFamily: {
    sans: "System",
    mono: "monospace",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.35,
    relaxed: 1.5,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

/**
 * Paleta única de la app móvil: alineada con Goi Web oscuro y pantallas de auth/login.
 * No depende del modo claro del sistema.
 */
export const goiAppPalette = {
  background: AUTH.bg,
  surface: "#0a0a0c",
  surfaceMuted: "#141416",
  border: AUTH.fieldBorder,
  cardBorder: AUTH.cardBorder,
  text: AUTH.neutral100,
  textMuted: AUTH.muted,
  textSteel: AUTH.steel,
  primary: AUTH.gold,
  primaryForeground: AUTH.bg,
  accent: AUTH.gold,
  danger: AUTH.danger,
  warning: "#fbbf24",
  success: AUTH.success,
  fieldBg: AUTH.fieldBg,
  fieldBorderFocus: AUTH.fieldBorderFocus,
} as const;

export type GoiPalette = typeof goiAppPalette;

/** @deprecated Solo referencia histórica; la app usa siempre `goiAppPalette`. */
export const colors = {
  light: goiAppPalette,
  dark: goiAppPalette,
} as const;

export type GoiColorScheme = "dark";

/**
 * Tema visual de Goi App (oscuro + dorado, como login y Goi Web).
 */
export function useGoiTheme() {
  return {
    colorScheme: "dark" as const,
    palette: goiAppPalette,
    spacing,
    typography,
    isDark: true,
  };
}
