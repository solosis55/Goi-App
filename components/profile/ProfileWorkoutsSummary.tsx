import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useWorkoutHubData } from "../../hooks/useWorkoutHubData";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";

type ProfileWorkoutsSummaryProps = {
  goal?: string;
};

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {value}
      </Text>
      <Text style={styles.statLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
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
          Registra rutinas y sesiones completadas. El detalle completo está en la pestaña Entrenar.
        </Text>
      </View>

      {goal?.trim() ? (
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Objetivo actual
          </Text>
          <Text style={styles.goalValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {goal.trim()}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={AUTH.gold} style={{ marginVertical: 8 }} />
      ) : (
        <View style={styles.statsRow}>
          <SummaryStat label="Sesiones" value={String(hub.stats.totalSessions)} />
          <SummaryStat label="Esta semana" value={String(hub.stats.sessionsThisWeek)} />
          <SummaryStat label="Rutinas" value={String(hub.stats.routineCount)} />
        </View>
      )}

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
    gap: 10,
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
    backgroundColor: "rgba(23, 23, 23, 0.5)",
    gap: 4,
  },
  statValue: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: AUTH.faint,
    fontSize: 10,
    textAlign: "center",
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
