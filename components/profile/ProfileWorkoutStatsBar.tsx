import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { formatProfileStatCount } from "../../utils/profileStatsFormat";

export type ProfileWorkoutStatsBarProps = {
  totalSessions: number | null;
  sessionsThisWeek: number | null;
  routinesCount: number | null;
  loading?: boolean;
};

function MiniStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.item} accessibilityLabel={`${value} ${label}`}>
      <Text
        style={[styles.value, accent ? styles.valueAccent : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {value}
      </Text>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

/** Barra compacta de entreno (debajo de la bio, no junto al @). */
export function ProfileWorkoutStatsBar({
  totalSessions,
  sessionsThisWeek,
  routinesCount,
  loading,
}: ProfileWorkoutStatsBarProps) {
  if (loading) {
    return <ActivityIndicator color={AUTH.gold} size="small" style={{ marginVertical: 6 }} />;
  }

  return (
    <View style={styles.wrap} accessibilityLabel="Estadísticas de entrenamiento">
      <MiniStat value={formatProfileStatCount(totalSessions)} label="entrenos" />
      <View style={styles.dot} />
      <MiniStat value={formatProfileStatCount(sessionsThisWeek)} label="esta semana" accent />
      <View style={styles.dot} />
      <MiniStat value={formatProfileStatCount(routinesCount)} label="rutinas" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(23, 23, 23, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.55)",
  },
  item: {
    alignItems: "center",
    minWidth: 64,
    gap: 2,
  },
  value: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  valueAccent: {
    color: AUTH.gold,
  },
  label: {
    color: AUTH.faint,
    fontSize: 10,
    textTransform: "lowercase",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(82, 82, 82, 0.9)",
  },
});
