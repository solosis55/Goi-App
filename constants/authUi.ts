import { Platform, StyleSheet } from "react-native";

/** Paleta y layout compartidos con Goi Web (`AuthPage` oscuro + `.goi-field`). */
export const AUTH = {
  bg: "#000000",
  gold: "#d4af37",
  steel: "#c8c4d4",
  muted: "#a3a3a3",
  faint: "#737373",
  neutral100: "#f5f5f5",
  danger: "#f87171",
  success: "#86efac",
  cardBg: "rgba(10, 10, 12, 0.97)",
  cardBorder: "rgba(212, 175, 55, 0.15)",
  fieldBorder: "#525252",
  fieldBorderFocus: "rgba(212, 175, 55, 0.88)",
  fieldBg: "#000000",
  label: "#e5e5e5",
} as const;

export const AUTH_PAD = 18;

/** Límite de escala de fuente del sistema en textos de auth (evita que rompan el layout). */
export const AUTH_MAX_FONT_MULTIPLIER = 1.35;

/** Cabeceras de Stack en feed, perfil, nueva publicación (mismo look que auth). */
export const APP_STACK_SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: AUTH.bg },
  headerShadowVisible: false,
  headerTintColor: AUTH.gold,
  headerTitleStyle: { color: AUTH.neutral100, fontWeight: "600" as const, fontSize: 17 },
} as const;

/** Fondo de pantallas en el Stack nativo (evita flash blanco al volver atrás en Android). */
export const APP_STACK_CONTENT_STYLE = { backgroundColor: AUTH.bg } as const;

export const APP_CARD_STACK_OPTIONS = {
  animation: "slide_from_right" as const,
  presentation: "card" as const,
  contentStyle: APP_STACK_CONTENT_STYLE,
};

/** Detalle de publicación desde perfil: slide suave y gesto atrás. */
export const APP_PROFILE_POST_STACK_OPTIONS = {
  ...APP_CARD_STACK_OPTIONS,
  animation: "slide_from_right" as const,
  animationDuration: 320,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

export function collectFieldErrors(
  issues: ReadonlyArray<{ readonly path: readonly PropertyKey[]; message: string }>
) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_root");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const authScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: AUTH_PAD,
    paddingTop: 12,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  headerLink: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    position: "relative",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
    backgroundColor: AUTH.cardBg,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 22 },
        shadowOpacity: 0.55,
        shadowRadius: 28,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  cardGlowLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  cardTitle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  passwordToggleHit: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginRight: -4,
  },
  label: {
    color: AUTH.label,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: AUTH.fieldBg,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: AUTH.steel,
    fontSize: 16,
  },
  fieldError: {
    marginTop: 6,
    color: AUTH.danger,
    fontSize: 12,
  },
  errorBox: {
    marginBottom: 14,
  },
  submitError: {
    color: AUTH.danger,
    fontSize: 14,
    fontWeight: "500",
  },
  submitErrorDetail: {
    marginTop: 4,
    color: AUTH.muted,
    fontSize: 12,
  },
  successBox: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(22, 40, 28, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.25)",
  },
  successText: {
    color: AUTH.success,
    fontSize: 14,
    lineHeight: 20,
  },
  monoHint: {
    marginTop: 10,
    color: AUTH.muted,
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  ctaWrap: {
    marginTop: 4,
    alignSelf: "stretch",
  },
  cta: {
    position: "relative",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
    backgroundColor: "rgba(35, 32, 22, 0.96)",
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  ctaDisabled: {
    opacity: 0.65,
  },
  ctaPressedIos: {
    backgroundColor: "rgba(48, 44, 28, 0.98)",
    borderColor: "rgba(212, 175, 55, 0.62)",
  },
  ctaShine: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    zIndex: 1,
  },
  ctaLabel: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "600",
    zIndex: 2,
  },
  linkWrap: {
    alignSelf: "center",
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  linkWrapTight: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  linkPressed: {
    opacity: 0.75,
  },
  linkText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(212, 175, 55, 0.45)",
  },
  linkTextMuted: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "500",
  },
});
