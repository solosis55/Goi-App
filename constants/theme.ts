import { useColorScheme, type ColorSchemeName } from "react-native";

/** Modo de color que usa la app (si el sistema no informa, se asume claro). */
export type GoiColorScheme = "light" | "dark";

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

/**
 * Escala tipográfica. En RN los tamaños son numéricos (unidad lógica ~dp).
 * `fontFamily.sans` usa la fuente del sistema hasta cargar una custom.
 */
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

/** Paleta Goi: fondos neutros, primario azul (confianza), acento verde (progreso/salud). */
export const colors = {
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    border: "#E2E8F0",
    text: "#0F172A",
    textMuted: "#64748B",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    accent: "#16A34A",
    danger: "#DC2626",
    warning: "#D97706",
    success: "#15803D",
  },
  dark: {
    background: "#020617",
    surface: "#0F172A",
    surfaceMuted: "#1E293B",
    border: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    primary: "#3B82F6",
    primaryForeground: "#FFFFFF",
    accent: "#4ADE80",
    danger: "#F87171",
    warning: "#FBBF24",
    success: "#4ADE80",
  },
} as const;

export type GoiPalette = (typeof colors)[GoiColorScheme];

export function resolveGoiColorScheme(
  scheme: ColorSchemeName | null | undefined
): GoiColorScheme {
  return scheme === "dark" ? "dark" : "light";
}

export function getGoiPalette(scheme: GoiColorScheme): GoiPalette {
  return colors[scheme];
}

/**
 * Tema de aplicación según el modo del sistema (`useColorScheme` de React Native).
 * Úsalo en pantallas para leer colores / tipografía / espaciado propios de Goi.
 */
export function useGoiTheme() {
  const systemScheme = useColorScheme();
  const colorScheme = resolveGoiColorScheme(systemScheme);
  const palette = getGoiPalette(colorScheme);

  return {
    colorScheme,
    palette,
    spacing,
    typography,
    isDark: colorScheme === "dark",
  };
}
