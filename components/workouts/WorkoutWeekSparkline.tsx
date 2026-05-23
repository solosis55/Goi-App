import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { WORKOUT_UI } from "../../constants/workoutScreenUi";
import { last7DayLabels } from "../../utils/workoutWeekSparkline";

type WorkoutWeekSparklineProps = {
  /** 7 valores: hace 6 días → hoy. */
  counts: number[];
};

export function WorkoutWeekSparkline({ counts }: WorkoutWeekSparklineProps) {
  const max = Math.max(1, ...counts);
  const todayIdx = 6;
  const dayLabels = last7DayLabels();

  return (
    <View style={styles.wrap} accessibilityLabel="Actividad de la última semana">
      <Text style={styles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Últimos 7 días
      </Text>
      <View style={styles.barsRow}>
        {counts.map((n, i) => {
          const h = Math.max(4, Math.round((n / max) * 28));
          const isToday = i === todayIdx;
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: h },
                    n > 0 ? (isToday ? styles.barFillToday : styles.barFillActive) : null,
                  ]}
                />
              </View>
              <Text
                style={[styles.dayLabel, isToday ? styles.dayLabelToday : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {dayLabels[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WORKOUT_UI.borderSubtle,
    backgroundColor: "rgba(10, 10, 12, 0.45)",
  },
  kicker: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barTrack: {
    height: 32,
    width: "100%",
    maxWidth: 22,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "72%",
    minWidth: 6,
    borderRadius: 4,
    backgroundColor: "rgba(64, 64, 64, 0.65)",
  },
  barFillActive: {
    backgroundColor: "rgba(212, 175, 55, 0.55)",
  },
  barFillToday: {
    backgroundColor: AUTH.gold,
  },
  dayLabel: {
    color: AUTH.faint,
    fontSize: 9,
    fontWeight: "700",
  },
  dayLabelToday: {
    color: AUTH.gold,
  },
});
