import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { FeedHeartIcon } from "./FeedHeartIcon";

type DoubleTapHeartBurstProps = {
  trigger: number;
};

export function DoubleTapHeartBurst({ trigger }: DoubleTapHeartBurstProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (trigger <= 0) return;
    opacity.value = 1;
    scale.value = 0.4;
    scale.value = withSequence(
      withSpring(1.15, { damping: 10, stiffness: 220 }),
      withTiming(1, { duration: 120 }),
      withTiming(0.85, { duration: 200 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 280 })
    );
  }, [trigger, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (trigger <= 0) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      <FeedHeartIcon filled size={72} color="#d4af37" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
});
