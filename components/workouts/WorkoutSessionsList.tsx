import { useCallback, useMemo, type ReactElement } from "react";
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";
import { formatSessionPerformedAt } from "../../utils/workoutSessionDate";
import {
  buildWorkoutSessionListItems,
  type WorkoutSessionListItem,
} from "../../utils/workoutSessionListItems";
import { WorkoutHubEmptyState } from "./WorkoutHubEmptyState";

type WorkoutSessionsListProps = {
  sessions: WorkoutSessionWithTitle[];
  loading?: boolean;
  onDelete: (id: string) => void;
  ListHeaderComponent?: ReactElement | null;
  contentPaddingBottom?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
};

function SessionDayHeader({ label }: { label: string }) {
  return (
    <View style={styles.groupHeader}>
      <View style={styles.timelineDot} />
      <Text style={styles.groupLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSessionWithTitle;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();

  const confirmDelete = useCallback(() => {
    showAlert({
      title: "Quitar entrenamiento",
      message: "Se eliminará del historial.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Quitar", style: "destructive", onPress: () => onDelete(session.id) },
      ],
    });
  }, [onDelete, session.id, showAlert]);

  return (
    <View style={styles.groupBody}>
      <View style={styles.timelineLine} />
      <View style={styles.card}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/sesion/[id]",
              params: { id: session.id },
            })
          }
          style={({ pressed }) => [styles.cardBody, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ver sesión ${session.workoutTitle}`}
        >
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {session.workoutTitle}
          </Text>
          <Text style={styles.when} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {formatSessionPerformedAt(session.performedAt)}
          </Text>
          {session.notes?.trim() ? (
            <Text style={styles.notes} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {session.notes.trim()}
            </Text>
          ) : null}
          <Text style={styles.openHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ver entreno completo ›
          </Text>
        </Pressable>
        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Quitar entrenamiento ${session.workoutTitle}`}
        >
          <Text style={styles.deleteText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Quitar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function WorkoutSessionsList({
  sessions,
  loading,
  onDelete,
  ListHeaderComponent,
  contentPaddingBottom = 24,
  refreshing,
  onRefresh,
}: WorkoutSessionsListProps) {
  const listItems = useMemo(() => buildWorkoutSessionListItems(sessions), [sessions]);

  const renderItem = useCallback(
    ({ item }: { item: WorkoutSessionListItem }) => {
      if (item.kind === "sectionHeader") {
        return <SessionDayHeader label={item.label} />;
      }
      return <SessionCard session={item.session} onDelete={onDelete} />;
    },
    [onDelete]
  );

  if (loading && sessions.length === 0) {
    return <ActivityIndicator color={AUTH.gold} style={{ marginVertical: 24 }} />;
  }

  return (
    <FlashList
      data={listItems}
      keyExtractor={(item) => item.key}
      getItemType={(item) => item.kind}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <WorkoutHubEmptyState
          title="Sin sesiones completadas"
          body="Ve a Rutinas y pulsa «Entrenar» en una plantilla para realizar tu primer entreno."
        />
      }
      contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={AUTH.gold} />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 2,
    marginTop: 8,
    marginBottom: 8,
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
    marginBottom: 10,
  },
  timelineLine: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
    marginTop: 4,
    marginBottom: 4,
  },
  card: {
    ...workoutScreenStyles.listCard,
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
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
  openHint: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
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
