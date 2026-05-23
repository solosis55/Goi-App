import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  getRoutineTrainStatus,
  routineStatusAccentColor,
  routineStatusLabel,
} from "../../utils/workoutRoutineStatus";

type WorkoutRoutineStatusBadgeProps = {
  lastSessionAt: string | null;
  sessionCount: number;
  compact?: boolean;
};

export function WorkoutRoutineStatusBadge({
  lastSessionAt,
  sessionCount,
  compact,
}: WorkoutRoutineStatusBadgeProps) {
  const status = getRoutineTrainStatus(lastSessionAt, sessionCount);
  const color = routineStatusAccentColor(status);

  if (compact) {
    return (
      <View
        style={[styles.dot, { backgroundColor: color }]}
        accessibilityLabel={routineStatusLabel(status)}
      />
    );
  }

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {routineStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    color: AUTH.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
