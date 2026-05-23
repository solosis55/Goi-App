import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { formatProfileStatCount } from "../../utils/profileStatsFormat";

type ProfileWorkoutStatsRowProps = {
  totalSessions: number | null;
  sessionsThisWeek: number | null;
  routinesCount: number | null;
  loading?: boolean;
};

function StatCell({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.cell} accessibilityLabel={`${value} ${label}`}>
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

function formatCount(n: number | null): string {
  if (n === null) return "…";
  return String(n);
}

/** Entrenos totales, esta semana y rutinas (alineado con Goi Web). */
export function ProfileWorkoutStatsRow({
  totalSessions,
  sessionsThisWeek,
  routinesCount,
  loading,
}: ProfileWorkoutStatsRowProps) {
  return (
    <View style={styles.wrap}>
      {loading ? (
        <ActivityIndicator color={AUTH.gold} size="small" style={styles.loader} />
      ) : (
        <>
          <StatCell value={formatProfileStatCount(totalSessions)} label="entrenos" />
          <View style={styles.divider} />
          <StatCell value={formatProfileStatCount(sessionsThisWeek)} label="esta semana" accent />
          <View style={styles.divider} />
          <StatCell value={formatProfileStatCount(routinesCount)} label="rutinas" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
    backgroundColor: "rgba(10, 10, 12, 0.35)",
  },
  loader: {
    flex: 1,
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  value: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  valueAccent: {
    color: AUTH.gold,
  },
  label: {
    color: AUTH.muted,
    fontSize: 11,
    textAlign: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "rgba(64, 64, 64, 0.8)",
  },
});
