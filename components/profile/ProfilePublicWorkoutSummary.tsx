import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { ProfileLastSession } from "../../hooks/useProfileStats";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { WorkoutWeekSparkline } from "../workouts/WorkoutWeekSparkline";

type ProfilePublicWorkoutSummaryProps = {
  loading?: boolean;
  lastSession: ProfileLastSession | null;
  recentRoutineTitles: string[];
  streakWeeks: number;
  sparklineCounts: number[];
};

function formatLastSession(iso: string | undefined): string {
  if (!iso) return "Sin sesiones registradas";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Sesión reciente";
  const diff = Date.now() - t;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Última sesión: hoy";
  if (days === 1) return "Última sesión: ayer";
  if (days < 7) return `Última sesión: hace ${days} días`;
  return `Última sesión: ${new Date(t).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`;
}

export function ProfilePublicWorkoutSummary({
  loading,
  lastSession,
  recentRoutineTitles,
  streakWeeks,
  sparklineCounts,
}: ProfilePublicWorkoutSummaryProps) {
  if (loading) {
    return <ActivityIndicator color={AUTH.gold} size="small" style={styles.loader} />;
  }

  const hasAny =
    lastSession != null || recentRoutineTitles.length > 0 || streakWeeks >= 2 || sparklineCounts.some((n) => n > 0);
  if (!hasAny) return null;

  return (
    <View style={styles.card} accessibilityLabel="Actividad de entrenamiento">
      <View style={styles.titleRow}>
        <TabDumbbellIcon size={18} color={AUTH.gold} filled />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Actividad de entreno
        </Text>
      </View>
      <Text style={styles.lastLine} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {formatLastSession(lastSession?.performedAt)}
      </Text>
      {lastSession?.workoutTitle ? (
        <Text style={styles.lastTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {lastSession.workoutTitle}
        </Text>
      ) : null}
      {streakWeeks >= 2 ? (
        <Text style={styles.streak} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          🔥 {streakWeeks} semanas seguidas entrenando
        </Text>
      ) : null}
      <WorkoutWeekSparkline counts={sparklineCounts} />
      {recentRoutineTitles.length > 0 ? (
        <View style={styles.routines}>
          {recentRoutineTitles.map((title) => (
            <View key={title} style={styles.routineChip}>
              <Text style={styles.routineText} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {title}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginVertical: 8,
  },
  card: {
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.75)",
    backgroundColor: "rgba(18, 18, 20, 0.85)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
  },
  lastLine: {
    color: AUTH.muted,
    fontSize: 13,
  },
  lastTitle: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  streak: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  routines: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  routineChip: {
    maxWidth: "100%",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    backgroundColor: "rgba(35, 32, 22, 0.5)",
  },
  routineText: {
    color: AUTH.steel,
    fontSize: 11,
    fontWeight: "600",
  },
});
