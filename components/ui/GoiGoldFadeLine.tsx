import { useId } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { AUTH } from "../../constants/authUi";

/**
 * Línea superior dorada que se desvanece hacia la derecha (Goi Web:
 * `from-goi-gold/85 via-goi-gold/40 to-transparent`).
 *
 * Dónde usarla:
 * - Shell: barra superior del feed (`FeedTopBar`).
 * - Paneles: bloques cuenta/sugerencias/perfil (`ProfileSectionSurface`), sheets modales.
 * - Feed: brillo en tarjeta central (`PostCardGoldBeam`).
 *
 * Evitar: tabs, chips, separadores de día, tab bar.
 */
const GRADIENT_STOPS = {
  default: [
    { offset: "0%", opacity: 0.85 },
    { offset: "45%", opacity: 0.4 },
    { offset: "100%", opacity: 0 },
  ],
  subtle: [
    { offset: "0%", opacity: 0.38 },
    { offset: "50%", opacity: 0.12 },
    { offset: "100%", opacity: 0 },
  ],
  /** Tarjetas del feed: visible al desplazarse con el scroll. */
  shimmer: [
    { offset: "0%", opacity: 0.95 },
    { offset: "28%", opacity: 0.55 },
    { offset: "62%", opacity: 0.18 },
    { offset: "100%", opacity: 0 },
  ],
} as const;

export type GoiGoldFadeLineVariant = keyof typeof GRADIENT_STOPS;

export function GoiGoldFadeLine({
  thickness = 2,
  style,
  variant = "default",
  direction = "horizontal",
  reverse = false,
}: {
  /** Grosor de la línea (altura si horizontal, ancho si vertical). */
  thickness?: number;
  style?: StyleProp<ViewStyle>;
  variant?: GoiGoldFadeLineVariant;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
}) {
  const gradId = useId().replace(/:/g, "");
  const stops = GRADIENT_STOPS[variant];
  const isVertical = direction === "vertical";

  const x1 = reverse ? (isVertical ? "0%" : "100%") : "0%";
  const y1 = reverse ? (isVertical ? "100%" : "0%") : "0%";
  const x2 = reverse ? (isVertical ? "0%" : "0%") : isVertical ? "0%" : "100%";
  const y2 = reverse ? (isVertical ? "0%" : "0%") : isVertical ? "100%" : "0%";

  return (
    <View
      style={[
        styles.wrap,
        isVertical ? styles.wrapVertical : styles.wrapHorizontal,
        isVertical ? { width: thickness } : { height: thickness },
        style,
      ]}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradId} x1={x1} y1={y1} x2={x2} y2={y2}>
            {stops.map((s) => (
              <Stop key={s.offset} offset={s.offset} stopColor={AUTH.gold} stopOpacity={s.opacity} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  wrapHorizontal: {
    width: "100%",
  },
  wrapVertical: {
    flex: 1,
    alignSelf: "stretch",
    minHeight: 8,
  },
});
