import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { VsLastTrend } from "../../utils/workoutVsLastSummary";

type WorkoutVsLastChipProps = {
  label: string;
  trend: VsLastTrend;
};

export function WorkoutVsLastChip({ label, trend }: WorkoutVsLastChipProps) {
  return (
    <View
      style={[
        styles.chip,
        trend === "up" ? styles.chipUp : null,
        trend === "down" ? styles.chipDown : null,
        trend === "same" ? styles.chipSame : null,
      ]}
    >
      <Text style={styles.text} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
  chipUp: {
    borderColor: "rgba(134, 239, 172, 0.45)",
    backgroundColor: "rgba(22, 40, 28, 0.45)",
  },
  chipDown: {
    borderColor: "rgba(251, 191, 36, 0.4)",
    backgroundColor: "rgba(48, 40, 22, 0.45)",
  },
  chipSame: {
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  text: {
    color: AUTH.steel,
    fontSize: 11,
    fontWeight: "600",
  },
});
