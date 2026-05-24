import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

const FEED_TOP_GLOW_ID = "goiFeedTopGlow";

/** Resplandor más corto y suave que login — zona superior del feed. */
export function FeedTopGlow({ width, windowHeight }: { width: number; windowHeight: number }) {
  const h = Math.max(1, Math.round(windowHeight));
  const cx = width / 2;
  const cy = -0.04 * h;
  const rx = width * 0.38;
  const ry = h * 0.42;

  return (
    <View style={[styles.wrap, { height: h }]} pointerEvents="none">
      <Svg width={width} height={h} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="goiFeedBgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0c0b09" stopOpacity={1} />
            <Stop offset="18%" stopColor="#050505" stopOpacity={1} />
            <Stop offset="55%" stopColor="#000000" stopOpacity={1} />
            <Stop offset="100%" stopColor="#030303" stopOpacity={1} />
          </LinearGradient>
          <RadialGradient
            id={FEED_TOP_GLOW_ID}
            cx={cx}
            cy={cy}
            fx={cx}
            fy={cy}
            rx={rx}
            ry={ry}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#d4af37" stopOpacity={0.22} />
            <Stop offset="40%" stopColor="#d4af37" stopOpacity={0.08} />
            <Stop offset="72%" stopColor="#d4af37" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="goiFeedBottomVignette" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0.35} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={h} fill="url(#goiFeedBgGrad)" />
        <Rect x={0} y={0} width={width} height={h} fill={`url(#${FEED_TOP_GLOW_ID})`} />
        <Rect x={0} y={h * 0.72} width={width} height={h * 0.28} fill="url(#goiFeedBottomVignette)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
