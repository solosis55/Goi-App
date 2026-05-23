import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";
import { formatSessionPerformedAt } from "../../utils/workoutSessionDate";
import { groupSessionsByDay } from "../../utils/workoutSessionGroups";
import { WorkoutHubEmptyState } from "./WorkoutHubEmptyState";

type WorkoutSessionsListProps = {
  sessions: WorkoutSessionWithTitle[];
  loading?: boolean;
  onDelete: (id: string) => void;
};

export function WorkoutSessionsList({ sessions, loading, onDelete }: WorkoutSessionsListProps) {
  const { showAlert } = useGoiAlert();

  const confirmDelete = useCallback(
    (onConfirm: () => void) => {
      showAlert({
        title: "Quitar entrenamiento",
        message: "Se eliminará del historial.",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          { text: "Quitar", style: "destructive", onPress: onConfirm },
        ],
      });
    },
    [showAlert]
  );

  const groups = groupSessionsByDay(sessions);

  if (loading && sessions.length === 0) {
    return <ActivityIndicator color={AUTH.gold} style={{ marginVertical: 24 }} />;
  }

  if (sessions.length === 0) {
    return (
      <WorkoutHubEmptyState
        title="Sin sesiones completadas"
        body="Ve a Rutinas y pulsa «Entrenar» en una plantilla para realizar tu primer entreno."
      />
    );
  }

  return (
    <View style={styles.list} accessibilityRole="list">
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={styles.timelineDot} />
            <Text style={styles.groupLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {group.label}
            </Text>
          </View>
          <View style={styles.groupBody}>
            <View style={styles.timelineLine} />
            <View style={styles.groupCards}>
              {group.sessions.map((session) => (
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
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 2,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AUTH.gold,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
  },
  groupLabel: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },
  groupBody: {
    flexDirection: "row",
    gap: 12,
    paddingLeft: 5,
  },
  timelineLine: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
    marginTop: 4,
    marginBottom: 4,
  },
  groupCards: {
    flex: 1,
    gap: 10,
    minWidth: 0,
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
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.35)",
    justifyContent: "center",
  },
  deleteText: {
    color: AUTH.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
