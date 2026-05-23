import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedScrollToTopFabProps = {
  visible: boolean;
  onPress: () => void;
};

export function FeedScrollToTopFab({ visible, onPress }: FeedScrollToTopFabProps) {
  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(180)} style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.fab, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Volver arriba"
      >
        <Text style={styles.icon} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          ↑
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 18, 20, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  icon: {
    color: AUTH.gold,
    fontSize: 20,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
