import { StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type Pill = { label: string; value: string; accent?: boolean };

type WorkoutStatPillsProps = {
  items: Pill[];
  compact?: boolean;
};

export function WorkoutStatPills({ items, compact }: WorkoutStatPillsProps) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={[workoutScreenStyles.statPill, compact ? styles.pillCompact : null]}>
          <Text
            style={[
              item.accent ? workoutScreenStyles.statPillValueAccent : workoutScreenStyles.statPillValue,
              compact ? styles.valueCompact : null,
            ]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {item.value}
          </Text>
          <Text
            style={[workoutScreenStyles.statPillLabel, compact ? styles.labelCompact : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  pillCompact: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 2,
  },
  valueCompact: {
    fontSize: 15,
    fontWeight: "700",
  },
  labelCompact: {
    fontSize: 9,
  },
});
