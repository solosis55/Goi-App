import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PublicProfileSession } from "../../types/publicProfile";
import { formatPostRelative } from "../../utils/feedPostDate";

type ProfilePublicSessionsSectionProps = {
  sessions: PublicProfileSession[];
  loading?: boolean;
};

export function ProfilePublicSessionsSection({ sessions, loading }: ProfilePublicSessionsSectionProps) {
  if (loading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.muted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Cargando sesiones…
        </Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sin sesiones públicas
        </Text>
        <Text style={styles.muted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Cuando registre entrenos, aparecerán aquí.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {sessions.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {s.workoutTitle}
          </Text>
          <Text style={styles.meta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {formatPostRelative(s.performedAt)}
          </Text>
          {s.notes?.trim() ? (
            <Text style={styles.notes} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {s.notes.trim()}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.4)",
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
    backgroundColor: "rgba(23, 23, 23, 0.85)",
    gap: 4,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  notes: {
    color: AUTH.muted,
    fontSize: 13,
    marginTop: 4,
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  muted: {
    color: AUTH.muted,
    fontSize: 13,
  },
});
