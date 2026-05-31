import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { AUTH } from "../../../constants/authUi";

/** Viñeta bajo el hero hacia el fondo de pantalla. */
export function SessionDetailHeroFade() {
  const { width } = useWindowDimensions();
  const h = 40;
  return (
    <View style={[styles.wrap, { width, height: h }]} pointerEvents="none">
      <Svg width={width} height={h}>
        <Defs>
          <LinearGradient id="sessionHeroFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={AUTH.bg} stopOpacity={0} />
            <Stop offset="100%" stopColor={AUTH.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={h} fill="url(#sessionHeroFade)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    marginTop: -20,
    marginBottom: -8,
  },
});
