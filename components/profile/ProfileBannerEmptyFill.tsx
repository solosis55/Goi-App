import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { GoiGoldFadeLine } from "../ui/GoiGoldFadeLine";

type ProfileBannerEmptyFillProps = {
  height: number;
  style?: StyleProp<ViewStyle>;
};

/** Fondo de banner por defecto: degradado oscuro + línea gold inferior. */
export function ProfileBannerEmptyFill({ height, style }: ProfileBannerEmptyFillProps) {
  return (
    <View style={[styles.wrap, { height }, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="profileBannerEmptyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#141416" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0a0a0c" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#profileBannerEmptyGrad)" />
      </Svg>
      <GoiGoldFadeLine variant="subtle" thickness={1} style={styles.goldLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    overflow: "hidden",
  },
  goldLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
