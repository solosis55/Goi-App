import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";
import { formatSessionPerformedAt } from "../../utils/workoutSessionDate";

type WorkoutSessionsListProps = {
  sessions: WorkoutSessionWithTitle[];
  loading?: boolean;
  onDelete: (id: string) => void;
};

function confirmDelete(onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof globalThis.confirm === "function" && globalThis.confirm("¿Quitar este entrenamiento del historial?")) {
      onConfirm();
    }
    return;
  }
  Alert.alert("Quitar entrenamiento", "Se eliminará del historial.", [
    { text: "Cancelar", style: "cancel" },
    { text: "Quitar", style: "destructive", onPress: onConfirm },
  ]);
}

export function WorkoutSessionsList({ sessions, loading, onDelete }: WorkoutSessionsListProps) {
  if (loading && sessions.length === 0) {
    return <ActivityIndicator color={AUTH.gold} style={{ marginVertical: 24 }} />;
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sin sesiones completadas
        </Text>
        <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Ve a Rutinas y pulsa «Entrenar» en una plantilla para realizar tu primer entreno.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list} accessibilityRole="list">
      {sessions.map((session) => (
        <View key={session.id} style={styles.card}>
          <View style={workoutScreenStyles.cardGlowLine} />
          <View style={styles.cardBody}>
            <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {session.workoutTitle}
            </Text>
            <Text style={styles.when} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {formatSessionPerformedAt(session.performedAt)}
            </Text>
            {session.notes?.trim() ? (
              <Text style={styles.notes} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {session.notes.trim()}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => confirmDelete(() => onDelete(session.id))}
            style={({ pressed }) => [styles.deleteBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Quitar entrenamiento ${session.workoutTitle}`}
          >
            <Text style={styles.deleteText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Quitar
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    ...workoutScreenStyles.listCard,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  when: {
    color: AUTH.faint,
    fontSize: 12,
    fontWeight: "600",
  },
  notes: {
    color: AUTH.steel,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.35)",
  },
  deleteText: {
    color: AUTH.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  empty: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.88,
  },
});
