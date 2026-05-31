import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";

const FADE_IN_MS = 280;
const HOLD_MS = 2400;
const FADE_OUT_MS = 650;

type CreatePostDraftRecoveredBannerProps = {
  active: boolean;
  onDismiss: () => void;
};

export function CreatePostDraftRecoveredBanner({
  active,
  onDismiss,
}: CreatePostDraftRecoveredBannerProps) {
  const opacity = useSharedValue(0);
  const [visible, setVisible] = useState(active);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishDismiss = useCallback(() => {
    setVisible(false);
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return;

    setVisible(true);
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: FADE_IN_MS });

    dismissTimerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
        if (finished) runOnJS(finishDismiss)();
      });
    }, FADE_IN_MS + HOLD_MS);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [active, finishDismiss, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, animStyle]} pointerEvents="none">
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Borrador recuperado
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(35, 32, 22, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  text: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
});
