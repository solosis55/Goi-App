import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { WORKOUT_LIST_SORT_OPTIONS, type WorkoutListSort } from "../../constants/workoutListSort";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutSortBarProps = {
  value: WorkoutListSort;
  onChange: (sort: WorkoutListSort) => void;
};

export function WorkoutSortBar({ value, onChange }: WorkoutSortBarProps) {
  return (
    <View style={styles.wrap}>
      {WORKOUT_LIST_SORT_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={({ pressed }) => [
              workoutScreenStyles.chip,
              active ? workoutScreenStyles.chipActive : null,
              pressed ? workoutScreenStyles.pressed : null,
            ]}
          >
            <Text
              style={[workoutScreenStyles.chipText, active ? workoutScreenStyles.chipTextActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
});
