import { Pressable, StyleSheet, Text } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type ExerciseBlockMenuButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

export function ExerciseBlockMenuButton({ disabled, onPress }: ExerciseBlockMenuButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, styles.btnRaised, pressed ? workoutScreenStyles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel="Opciones del ejercicio"
    >
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        ⋯
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnRaised: {
    zIndex: 5,
    elevation: 5,
  },
  text: {
    color: AUTH.steel,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: -2,
  },
});
