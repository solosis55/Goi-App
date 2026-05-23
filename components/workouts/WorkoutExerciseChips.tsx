import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { WORKOUT_UI } from "../../constants/workoutScreenUi";

const MAX_VISIBLE = 3;

type WorkoutExerciseChipsProps = {
  names: string[];
};

export function WorkoutExerciseChips({ names }: WorkoutExerciseChipsProps) {
  if (names.length === 0) return null;

  const visible = names.slice(0, MAX_VISIBLE);
  const extra = names.length - visible.length;

  return (
    <View style={styles.row}>
      {visible.map((name) => (
        <View key={name} style={styles.chip}>
          <Text style={styles.chipText} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {name}
          </Text>
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.chip, styles.chipMore]}>
          <Text style={styles.chipTextMore} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    maxWidth: "46%",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
    backgroundColor: WORKOUT_UI.chipBg,
  },
  chipMore: {
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: WORKOUT_UI.chipBgActive,
  },
  chipText: {
    color: AUTH.steel,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextMore: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "700",
  },
});
