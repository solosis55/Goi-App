import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ExerciseBlockIndexBadgeProps = {
  label: string | number;
  done?: boolean;
};

/** Badge dorado sobre la foto (editor y entrenar). */
export function ExerciseBlockIndexBadge({ label, done }: ExerciseBlockIndexBadgeProps) {
  return (
    <View style={[styles.badge, done ? styles.badgeDone : null]}>
      <Text style={[styles.text, done ? styles.textDone : null]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDone: {
    borderColor: "rgba(134, 239, 172, 0.75)",
    backgroundColor: "rgba(22, 40, 28, 0.95)",
  },
  text: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  textDone: {
    color: "rgba(134, 239, 172, 0.95)",
  },
});
