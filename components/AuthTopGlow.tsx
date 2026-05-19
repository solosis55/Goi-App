import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const AUTH_TOP_GLOW_ID = "goiAuthTopGlow";

/**
 * Resplandor dorado superior (misma lógica que el splash de Goi Web / pantalla inicio).
 */
export function AuthTopGlow({ width, windowHeight }: { width: number; windowHeight: number }) {
  const h = Math.max(1, Math.round(windowHeight));
  const cx = width / 2;
  const cy = -0.08 * h;
  const rx = width * 0.46;
  const ry = h * 0.92;

  return (
    <View style={[styles.glowWrap, { height: h }]} pointerEvents="none">
      <Svg width={width} height={h} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id={AUTH_TOP_GLOW_ID}
            cx={cx}
            cy={cy}
            fx={cx}
            fy={cy}
            rx={rx}
            ry={ry}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#d4af37" stopOpacity={0.34} />
            <Stop offset="32%" stopColor="#d4af37" stopOpacity={0.15} />
            <Stop offset="52%" stopColor="#d4af37" stopOpacity={0.072} />
            <Stop offset="72%" stopColor="#d4af37" stopOpacity={0.024} />
            <Stop offset="88%" stopColor="#d4af37" stopOpacity={0} />
            <Stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={h} fill={`url(#${AUTH_TOP_GLOW_ID})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
});
