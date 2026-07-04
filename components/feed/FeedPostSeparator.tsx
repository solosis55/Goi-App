import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AUTH } from "../../constants/authUi";
import { GoiGoldFadeLine } from "../ui/GoiGoldFadeLine";

type FeedPostSeparatorProps = {
  active?: boolean;
};

/** Ritmo visual entre publicaciones; rombo central con pulso suave. */
export function FeedPostSeparator({ active = false }: FeedPostSeparatorProps) {
  const idlePulse = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      cancelAnimation(idlePulse);
      idlePulse.value = 1;
      return;
    }
    idlePulse.value = withRepeat(
      withSequence(withTiming(1.28, { duration: 850 }), withTiming(1, { duration: 850 })),
      -1,
      false
    );
    return () => cancelAnimation(idlePulse);
  }, [active, idlePulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.88 : 0.42,
    transform: [{ rotate: "45deg" }, { scale: active ? idlePulse.value : 1 }],
  }));

  const lineVariant = active ? "default" : "subtle";

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.gutter} />
      <View style={styles.beamRow}>
        <View style={styles.beam}>
          <GoiGoldFadeLine variant={lineVariant} thickness={1} reverse />
        </View>
        <Animated.View style={pulseStyle}>
          <View style={styles.pulse} />
        </Animated.View>
        <View style={styles.beam}>
          <GoiGoldFadeLine variant={lineVariant} thickness={1} />
        </View>
      </View>
      <View style={styles.gutter} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: "#030303",
  },
  gutter: {
    height: 14,
  },
  beamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  beam: {
    flex: 1,
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: AUTH.gold,
  },
});
