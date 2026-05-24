import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedNewPostsBannerProps = {
  count: number;
  onPress: () => void;
};

export function FeedNewPostsBanner({ count, onPress }: FeedNewPostsBannerProps) {
  if (count <= 0) return null;

  const label = count === 1 ? "1 publicación nueva" : `${count} publicaciones nuevas`;

  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(160)} style={styles.wrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Toca para ver arriba.`}
        style={({ pressed }) => [styles.btn, pressed ? styles.btnPressed : null]}
      >
        <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          ↑ {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 12,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  btn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(22, 20, 14, 0.96)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressed: {
    opacity: 0.9,
  },
  text: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "700",
  },
});
