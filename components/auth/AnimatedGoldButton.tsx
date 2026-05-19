import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER, authScreenStyles } from "../../constants/authUi";

type Props = {
  label: string;
  loadingLabel: string;
  loading: boolean;
  /** Desactiva el botón sin animación de carga (p. ej. rate limit). */
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function AnimatedGoldButton({
  label,
  loadingLabel,
  loading,
  disabled = false,
  onPress,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const blocked = loading || disabled;

  useEffect(() => {
    if (blocked) {
      scale.setValue(1);
      translateY.setValue(0);
    }
  }, [blocked, scale, translateY]);

  const onPressIn = useCallback(() => {
    if (blocked || reduceMotion) return;
    scale.stopAnimation();
    translateY.stopAnimation();
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.045,
          duration: 32,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -3,
          duration: 32,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 55,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 5,
          duration: 55,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [blocked, reduceMotion, scale, translateY]);

  const onPressOut = useCallback(() => {
    if (reduceMotion) return;
    scale.stopAnimation();
    translateY.stopAnimation();
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reduceMotion, scale, translateY]);

  return (
    <Animated.View
      style={[authScreenStyles.ctaWrap, { transform: [{ translateY }, { scale }] }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? (loading ? loadingLabel : label)}
        accessibilityState={{ disabled: blocked }}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={blocked}
        {...(Platform.OS === "android"
          ? { android_ripple: { color: "rgba(255, 255, 255, 0.28)", borderless: false } }
          : {})}
        style={({ pressed }) => [
          authScreenStyles.cta,
          blocked ? authScreenStyles.ctaDisabled : null,
          Platform.OS === "ios" && pressed && !blocked ? authScreenStyles.ctaPressedIos : null,
        ]}
      >
        <View style={authScreenStyles.ctaShine} pointerEvents="none" />
        <Text style={authScreenStyles.ctaLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {loading ? loadingLabel : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
