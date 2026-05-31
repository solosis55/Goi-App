import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedActivityNudgeProps = {
  unreadCount: number;
  onPress: () => void;
};

export function FeedActivityNudge({ unreadCount, onPress }: FeedActivityNudgeProps) {
  if (unreadCount <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel="Ver actividad sin leer"
    >
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {unreadCount === 1
          ? "Tienes 1 notificación sin leer"
          : `Tienes ${unreadCount} notificaciones sin leer`}
      </Text>
      <Text style={styles.link} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Ver actividad →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    backgroundColor: "rgba(35, 32, 22, 0.45)",
    gap: 4,
  },
  text: {
    color: AUTH.neutral100,
    fontSize: 13,
    fontWeight: "600",
  },
  link: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  pressed: {
    opacity: 0.88,
  },
});
