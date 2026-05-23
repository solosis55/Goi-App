import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useWorkoutHubData } from "../../hooks/useWorkoutHubData";
import { sessionsPerDayLast7 } from "../../utils/workoutWeekSparkline";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { WorkoutWeekSparkline } from "../workouts/WorkoutWeekSparkline";

type ProfileWorkoutsSummaryProps = {
  goal?: string;
};

function formatLastSession(iso: string | undefined): string {
  if (!iso) return "Aún no hay sesiones registradas.";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Sesión reciente";
  const diff = Date.now() - t;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Última sesión: hoy";
  if (days === 1) return "Última sesión: ayer";
  if (days < 7) return `Última sesión: hace ${days} días`;
  return `Última sesión: ${new Date(t).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`;
}

export function ProfileWorkoutsSummary({ goal }: ProfileWorkoutsSummaryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const hub = useWorkoutHubData(user?.id);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void hub.load().finally(() => setLoading(false));
    }, [hub.load])
  );

  const lastSession = useMemo(() => {
    const sorted = [...hub.sessions].sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1));
    return sorted[0];
  }, [hub.sessions]);

  const sparkCounts = useMemo(() => sessionsPerDayLast7(hub.sessions), [hub.sessions]);

  const recentRoutines = useMemo(() => {
    const seen = new Set<string>();
    const out: { id: string; title: string }[] = [];
    const sorted = [...hub.sessions].sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1));
    for (const s of sorted) {
      if (!s.workoutId || seen.has(s.workoutId)) continue;
      seen.add(s.workoutId);
      const title = hub.workouts.find((w) => w.id === s.workoutId)?.title ?? s.workoutTitle ?? "Rutina";
      out.push({ id: s.workoutId, title });
      if (out.length >= 4) break;
    }
    return out;
  }, [hub.sessions, hub.workouts]);

  return (
    <View style={styles.wrap}>
      <View style={styles.heroCard}>
        <View style={styles.iconRing}>
          <TabDumbbellIcon size={32} color={AUTH.gold} filled />
        </View>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Tu actividad de entreno
        </Text>
        <Text style={styles.cardBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {loading ? "Cargando…" : formatLastSession(lastSession?.performedAt)}
        </Text>
        {lastSession?.workoutTitle ? (
          <Text style={styles.lastTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {lastSession.workoutTitle}
          </Text>
        ) : null}
      </View>

      {goal?.trim() ? (
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Tu objetivo
          </Text>
          <Text style={styles.goalValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {goal.trim()}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={AUTH.gold} style={{ marginVertical: 8 }} />
      ) : (
        <WorkoutWeekSparkline counts={sparkCounts} />
      )}

      {recentRoutines.length > 0 ? (
        <View style={styles.chipsWrap}>
          <Text style={styles.chipsKicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Rutinas recientes
          </Text>
          <View style={styles.chipsRow}>
            {recentRoutines.map((r) => (
              <View key={r.id} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {r.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push("/(tabs)/entrenamientos")}
        style={({ pressed }) => [styles.cta, pressed ? styles.ctaPressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Ver todo en Entrenamientos"
      >
        <Text style={styles.ctaText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Ver todo en Entrenamientos
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 14,
  },
  heroCard: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: "rgba(23, 23, 23, 0.65)",
    gap: 8,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  cardBody: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  lastTitle: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  goalCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.6)",
    gap: 4,
  },
  goalLabel: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  goalValue: {
    color: AUTH.steel,
    fontSize: 15,
    lineHeight: 21,
  },
  chipsWrap: {
    gap: 8,
  },
  chipsKicker: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    maxWidth: "48%",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.85)",
    backgroundColor: "rgba(23, 23, 23, 0.7)",
  },
  chipText: {
    color: AUTH.steel,
    fontSize: 12,
    fontWeight: "600",
  },
  cta: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
    backgroundColor: "rgba(35, 32, 22, 0.96)",
    alignItems: "center",
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
});
