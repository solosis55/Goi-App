import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { POST_PREVIEW_CARD } from "./postPreviewTheme";

type PreviewBottomFadeProps = {
  width: number;
  height?: number;
  gradientId?: string;
};

/** Degradado inferior para recortar preview sin sensación de corte brusco. */
export function PreviewBottomFade({
  width,
  height = 56,
  gradientId = "previewBottomFadeGrad",
}: PreviewBottomFadeProps) {
  const fadeEnd = POST_PREVIEW_CARD.fadeEnd;
  return (
    <View style={[styles.wrap, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={fadeEnd} stopOpacity={0} />
            <Stop offset="45%" stopColor={fadeEnd} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={fadeEnd} stopOpacity={0.98} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
