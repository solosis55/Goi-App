import { useEffect, useRef, type ReactNode } from "react";
import { Animated, StyleSheet } from "react-native";

type WorkoutBlockHighlightWrapProps = {
  active?: boolean;
  children: ReactNode;
};

/** Pulso dorado breve al añadir un ejercicio a la rutina. */
export function WorkoutBlockHighlightWrap({ active, children }: WorkoutBlockHighlightWrapProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }
    pulse.setValue(0);
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 240,
        useNativeDriver: false,
      }),
      Animated.timing(pulse, {
        toValue: 0,
        duration: 720,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active, pulse]);

  const borderLeftColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(82, 82, 82, 0.2)", "rgba(212, 175, 55, 0.9)"],
  });

  const backgroundColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(10, 10, 12, 0)", "rgba(48, 44, 28, 0.5)"],
  });

  return (
    <Animated.View style={[styles.wrap, { borderLeftColor, backgroundColor }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 3,
  },
});
