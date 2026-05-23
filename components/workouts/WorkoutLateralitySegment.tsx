import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutLateralitySegmentProps = {
  value: "bilateral" | "unilateral";
  disabled?: boolean;
  onChange: (value: "bilateral" | "unilateral") => void;
  /** Con barra u otros materiales solo bilaterales, ocultar unilateral. */
  unilateralAllowed?: boolean;
};

export function WorkoutLateralitySegment({
  value,
  disabled,
  onChange,
  unilateralAllowed = true,
}: WorkoutLateralitySegmentProps) {
  const isBilateral = (value ?? "bilateral") === "bilateral";

  if (!unilateralAllowed) {
    return (
      <View style={styles.bilateralOnly} accessibilityRole="text">
        <Text style={styles.bilateralOnlyText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Bilateral
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.segment} accessibilityRole="tablist">
      <Pressable
        onPress={() => onChange("bilateral")}
        disabled={disabled}
        style={({ pressed }) => [
          styles.option,
          styles.optionLeft,
          isBilateral ? styles.optionActive : null,
          pressed ? workoutScreenStyles.pressed : null,
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: isBilateral }}
      >
        <Text
          style={[styles.optionText, isBilateral ? styles.optionTextActive : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          Bilateral
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("unilateral")}
        disabled={disabled}
        style={({ pressed }) => [
          styles.option,
          styles.optionRight,
          !isBilateral ? styles.optionActive : null,
          pressed ? workoutScreenStyles.pressed : null,
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: !isBilateral }}
      >
        <Text
          style={[styles.optionText, !isBilateral ? styles.optionTextActive : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          Unilateral
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    alignSelf: "flex-start",
    maxWidth: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    overflow: "hidden",
    backgroundColor: "rgba(10, 10, 12, 0.6)",
  },
  option: {
    flexGrow: 0,
    flexShrink: 0,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: AUTH.fieldBorder,
  },
  optionRight: {},
  optionActive: {
    backgroundColor: "rgba(35, 32, 22, 0.96)",
  },
  optionText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  optionTextActive: {
    color: AUTH.gold,
  },
  bilateralOnly: {
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(35, 32, 22, 0.96)",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  bilateralOnlyText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
});
