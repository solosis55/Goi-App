import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutExercisesListHeaderProps = {
  count: number;
  max: number;
  collapseAll: boolean;
  onToggleCollapseAll?: () => void;
  compactSeriesOnly?: boolean;
  onToggleCompactSeriesOnly?: () => void;
  fullBleed?: boolean;
};

export function WorkoutExercisesListHeader({
  count,
  max,
  collapseAll,
  onToggleCollapseAll,
  compactSeriesOnly,
  onToggleCompactSeriesOnly,
  fullBleed,
}: WorkoutExercisesListHeaderProps) {
  return (
    <View style={[styles.wrap, fullBleed ? workoutScreenStyles.exerciseBlocksList : null]}>
      <View style={styles.row}>
        <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Ejercicios · {count}/{max}
        </Text>
        <View style={styles.actions}>
          {onToggleCompactSeriesOnly && count > 0 ? (
            <Pressable
              onPress={onToggleCompactSeriesOnly}
              style={({ pressed }) => [workoutScreenStyles.ghostBtn, pressed ? workoutScreenStyles.pressed : null]}
            >
              <Text style={workoutScreenStyles.ghostBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {compactSeriesOnly ? "Config." : "Solo series"}
              </Text>
            </Pressable>
          ) : null}
          {onToggleCollapseAll && count > 0 ? (
            <Pressable
              onPress={onToggleCollapseAll}
              style={({ pressed }) => [workoutScreenStyles.ghostBtn, pressed ? workoutScreenStyles.pressed : null]}
            >
              <Text style={workoutScreenStyles.ghostBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {collapseAll ? "Expandir" : "Minimizar"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(82, 82, 82, 0.5)",
    backgroundColor: "rgba(10, 10, 12, 0.85)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
});
