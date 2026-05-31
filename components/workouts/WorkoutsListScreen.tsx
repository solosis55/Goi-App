import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteWorkout } from "../../api/workouts";
import { deleteWorkoutSession } from "../../api/workoutSessions";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { useWorkoutHubData } from "../../hooks/useWorkoutHubData";
import type { Workout } from "../../types/workout";
import { blocksFromLegacy } from "../../utils/workoutBlocks";
import { buildWorkoutHubHeroCopy } from "../../utils/workoutHubHeroCopy";
import { formatSessionPerformedAt } from "../../utils/workoutSessionDate";
import { getRoutineTrainStatus, routineStatusAccentColor } from "../../utils/workoutRoutineStatus";
import { sessionsPerDayLast7 } from "../../utils/workoutWeekSparkline";
import { getErrorMessage } from "../../utils/errorMessages";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import { sortWorkouts, type WorkoutListSort } from "../../constants/workoutListSort";
import { seedDuplicateWorkoutDraft } from "../../utils/duplicateWorkoutDraft";
import { workoutHapticLight } from "../../utils/workoutHaptics";
import { AnimatedGoldButton } from "../auth/AnimatedGoldButton";
import { ExerciseImageSlot } from "./ExerciseImageSlot";
import { WorkoutDraftResumeBanner } from "./WorkoutDraftResumeBanner";
import { WorkoutExerciseChips } from "./WorkoutExerciseChips";
import { WorkoutHubEmptyState } from "./WorkoutHubEmptyState";
import { WorkoutHubHero } from "./WorkoutHubHero";
import { WorkoutListSkeleton } from "./WorkoutListSkeleton";
import { WorkoutRoutineStatusBadge } from "./WorkoutRoutineStatusBadge";
import { WorkoutRowMenuSheet } from "./WorkoutRowMenuSheet";
import { WorkoutSortBar } from "./WorkoutSortBar";
import { WorkoutStatPills } from "./WorkoutStatPills";
import { WorkoutSessionsList } from "./WorkoutSessionsList";
import { WorkoutWeekSparkline } from "./WorkoutWeekSparkline";
import { WorkoutsSubTabBar, type WorkoutsSubTab } from "./WorkoutsSubTabBar";

type WorkoutRowProps = {
  workout: Workout;
  exerciseNames: string[];
  firstExerciseImageUrl?: string | null;
  sessionCount: number;
  lastSessionAt: string | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStartWorkout: () => void;
};

function WorkoutRowInner({
  workout,
  exerciseNames,
  firstExerciseImageUrl,
  sessionCount,
  lastSessionAt,
  onEdit,
  onDuplicate,
  onDelete,
  onStartWorkout,
}: WorkoutRowProps) {
  const canTrain = exerciseNames.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const trainStatus = getRoutineTrainStatus(lastSessionAt, sessionCount);
  const statusAccent = routineStatusAccentColor(trainStatus);
  const cardAccent =
    trainStatus === "this_week"
      ? { borderColor: "rgba(212, 175, 55, 0.42)" }
      : trainStatus === "never"
        ? null
        : { borderLeftWidth: 3, borderLeftColor: statusAccent };

  return (
    <>
      <View style={[styles.card, cardAccent]}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <View style={styles.cardTop}>
          {firstExerciseImageUrl || exerciseNames.length > 0 ? (
            <View style={styles.cardThumb}>
              <ExerciseImageSlot
                imageUri={firstExerciseImageUrl ? resolveMediaUrl(firstExerciseImageUrl) : null}
                size={44}
              />
            </View>
          ) : null}
          <View style={styles.cardTitleCol}>
            <View style={styles.titleRow}>
              <WorkoutRoutineStatusBadge compact lastSessionAt={lastSessionAt} sessionCount={sessionCount} />
              <Text style={styles.cardTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER} numberOfLines={2}>
                {workout.title}
              </Text>
            </View>
            {workout.description?.trim() ? (
              <Text style={styles.cardDesc} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {workout.description.trim()}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
            style={({ pressed }) => [styles.menuBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Opciones de ${workout.title}`}
          >
            <Text style={styles.menuBtnText}>⋯</Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <WorkoutRoutineStatusBadge lastSessionAt={lastSessionAt} sessionCount={sessionCount} />
          <Text style={styles.cardMeta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {exerciseNames.length} ejercicio{exerciseNames.length === 1 ? "" : "s"}
          </Text>
          {sessionCount > 0 ? (
            <Text style={styles.cardMetaMuted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              · {sessionCount} entreno{sessionCount === 1 ? "" : "s"}
            </Text>
          ) : null}
          {lastSessionAt ? (
            <Text style={styles.cardMetaMuted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              · {formatSessionPerformedAt(lastSessionAt)}
            </Text>
          ) : null}
        </View>

        {exerciseNames.length > 0 ? <WorkoutExerciseChips names={exerciseNames} /> : null}

        <View style={styles.cardActions}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.editBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${workout.title}`}
          >
            <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Editar
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!canTrain) return;
              workoutHapticLight();
              onStartWorkout();
            }}
            disabled={!canTrain}
            style={({ pressed }) => [
              styles.trainBtn,
              !canTrain ? styles.trainBtnDisabled : null,
              pressed && canTrain ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={canTrain ? `Entrenar ${workout.title}` : `${workout.title} sin ejercicios`}
          >
            <Text style={[styles.trainBtnText, !canTrain ? styles.trainBtnTextDisabled : null]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {canTrain ? "▶ Entrenar" : "Sin ejercicios"}
            </Text>
          </Pressable>
        </View>
      </View>

      <WorkoutRowMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </>
  );
}

const WorkoutRow = memo(WorkoutRowInner, (prev, next) => {
  return (
    prev.workout === next.workout &&
    prev.exerciseNames === next.exerciseNames &&
    prev.firstExerciseImageUrl === next.firstExerciseImageUrl &&
    prev.sessionCount === next.sessionCount &&
    prev.lastSessionAt === next.lastSessionAt
  );
});

export function WorkoutsListScreen() {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const hub = useWorkoutHubData(user?.id);
  const [subTab, setSubTab] = useState<WorkoutsSubTab>("routines");
  const [query, setQuery] = useState("");
  const [sessionQuery, setSessionQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<WorkoutListSort>("recent");
  const hubSnapshotRef = useRef({ workouts: 0, sessions: 0 });
  hubSnapshotRef.current = { workouts: hub.workouts.length, sessions: hub.sessions.length };
  const hubLastLoadRef = useRef(0);
  const HUB_FOCUS_STALE_MS = 30_000;

  useFocusEffect(
    useCallback(() => {
      const hasData =
        hubSnapshotRef.current.workouts > 0 || hubSnapshotRef.current.sessions > 0;
      const stale = Date.now() - hubLastLoadRef.current > HUB_FOCUS_STALE_MS;
      if (!hasData) hub.setLoading(true);
      if (!hasData || stale) {
        void hub.load().finally(() => {
          hubLastLoadRef.current = Date.now();
          if (!hasData) hub.setLoading(false);
        });
      }
    }, [hub.load, hub.setLoading])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await hub.load();
    setRefreshing(false);
  }, [hub]);

  const catalogById = useMemo(() => new Map(hub.catalog.map((e) => [e.id, e])), [hub.catalog]);

  const weekSparkCounts = useMemo(() => sessionsPerDayLast7(hub.sessions), [hub.sessions]);

  const heroCopy = useMemo(() => buildWorkoutHubHeroCopy(hub.stats), [hub.stats]);

  const sessionCountMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const [id, st] of hub.sessionStatsByWorkoutId) {
      m.set(id, st.sessionCount);
    }
    return m;
  }, [hub.sessionStatsByWorkoutId]);

  const lastSessionMap = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const [id, st] of hub.sessionStatsByWorkoutId) {
      m.set(id, st.lastSessionPerformedAt);
    }
    return m;
  }, [hub.sessionStatsByWorkoutId]);

  const filteredWorkouts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = hub.workouts;
    if (q) {
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          blocksFromLegacy(w.exerciseIds, w.exerciseBlocks).some((b) =>
            (catalogById.get(b.exerciseId)?.name ?? "").toLowerCase().includes(q)
          )
      );
    }
    return sortWorkouts(list, sort, sessionCountMap, lastSessionMap);
  }, [hub.workouts, query, catalogById, sort, sessionCountMap, lastSessionMap]);

  const filteredSessions = useMemo(() => {
    const q = sessionQuery.trim().toLowerCase();
    if (!q) return hub.sessions;
    return hub.sessions.filter(
      (s) =>
        s.workoutTitle.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q) ||
        formatSessionPerformedAt(s.performedAt).toLowerCase().includes(q)
    );
  }, [hub.sessions, sessionQuery]);

  const exerciseNamesFor = useCallback(
    (w: Workout) =>
      blocksFromLegacy(w.exerciseIds, w.exerciseBlocks).map(
        (b) => catalogById.get(b.exerciseId)?.name ?? "Ejercicio"
      ),
    [catalogById]
  );

  const firstExerciseImageFor = useCallback(
    (w: Workout): string | null => {
      const blocks = blocksFromLegacy(w.exerciseIds, w.exerciseBlocks);
      for (const b of blocks) {
        const ex = catalogById.get(b.exerciseId);
        if (ex?.imageUrl?.trim()) return ex.imageUrl;
      }
      return null;
    },
    [catalogById]
  );

  const startWorkout = useCallback(
    (workoutId: string) => {
      router.push({ pathname: "/entrenar/[workoutId]", params: { workoutId } });
    },
    [router]
  );

  const header = (
    <View style={styles.listHeader}>
      <WorkoutHubHero compact title={heroCopy.title} body={heroCopy.body} />

      <WorkoutStatPills
        compact
        items={[
          { label: "Rutinas", value: String(hub.stats.routineCount) },
          { label: "Entrenos", value: String(hub.stats.totalSessions) },
          { label: "Semana", value: String(hub.stats.sessionsThisWeek), accent: hub.stats.sessionsThisWeek > 0 },
          {
            label: "Racha",
            value: `${weekSparkCounts.filter((n) => n > 0).length}d`,
            accent: weekSparkCounts.filter((n) => n > 0).length >= 3,
          },
        ]}
      />

      {hub.stats.totalSessions > 0 ? <WorkoutWeekSparkline counts={weekSparkCounts} /> : null}

      <WorkoutDraftResumeBanner />

      <WorkoutsSubTabBar
        active={subTab}
        onChange={setSubTab}
        routineCount={hub.stats.routineCount}
        sessionCount={hub.stats.totalSessions}
      />

      {hub.error ? (
        <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {hub.error}
        </Text>
      ) : null}
    </View>
  );

  const fabBottom = insets.bottom + 20;

  const renderWorkoutRow = useCallback(
    ({ item }: { item: Workout }) => {
      const st = hub.sessionStatsByWorkoutId.get(item.id);
      return (
        <WorkoutRow
          workout={item}
          exerciseNames={exerciseNamesFor(item)}
          firstExerciseImageUrl={firstExerciseImageFor(item)}
          sessionCount={st?.sessionCount ?? 0}
          lastSessionAt={st?.lastSessionPerformedAt ?? null}
          onEdit={() => router.push({ pathname: "/rutina/[id]", params: { id: item.id } })}
          onDuplicate={() => {
            void seedDuplicateWorkoutDraft(item).then(() => router.push("/rutina/nueva"));
          }}
          onDelete={() => {
            showAlert({
              title: "Eliminar rutina",
              message: "Esta acción no se puede deshacer.",
              buttons: [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: () => {
                    void deleteWorkout(item.id)
                      .then(() => hub.setWorkouts((prev) => prev.filter((w) => w.id !== item.id)))
                      .catch((e) => hub.setError(getErrorMessage(e, "No se pudo eliminar")));
                  },
                },
              ],
            });
          }}
          onStartWorkout={() => startWorkout(item.id)}
        />
      );
    },
    [
      hub.sessionStatsByWorkoutId,
      hub.setWorkouts,
      hub.setError,
      exerciseNamesFor,
      firstExerciseImageFor,
      router,
      showAlert,
      startWorkout,
    ]
  );

  const workoutsListHeader = useMemo(
    () => (
      <>
        {header}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar rutina…"
          placeholderTextColor={AUTH.faint}
          style={styles.search}
          accessibilityLabel="Buscar rutinas"
        />
        <WorkoutSortBar value={sort} onChange={setSort} />
      </>
    ),
    [header, query, sort]
  );

  if (subTab === "sessions") {
    const sessionsHeader = (
      <>
        {header}
        <TextInput
          value={sessionQuery}
          onChangeText={setSessionQuery}
          placeholder="Buscar en el historial…"
          placeholderTextColor={AUTH.faint}
          style={styles.search}
          accessibilityLabel="Buscar sesiones"
        />
      </>
    );

    return (
      <View style={styles.root}>
        <WorkoutSessionsList
          sessions={filteredSessions}
          loading={hub.loading}
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          contentPaddingBottom={fabBottom + 24}
          ListHeaderComponent={sessionsHeader}
          onDelete={(id) => {
            void deleteWorkoutSession(id)
              .then(() => hub.setSessions((prev) => prev.filter((s) => s.id !== id)))
              .catch((e) => hub.setError(getErrorMessage(e, "No se pudo eliminar")));
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {hub.loading && hub.workouts.length === 0 ? (
        <View style={[styles.loaderWrap, { paddingHorizontal: AUTH_PAD, paddingTop: 8 }]}>
          <WorkoutListSkeleton count={3} />
        </View>
      ) : (
        <FlashList
          style={styles.list}
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkoutRow}
          ListHeaderComponent={workoutsListHeader}
          ListEmptyComponent={
            hub.loading ? null : (
              <WorkoutHubEmptyState
                title={query.trim() ? "Sin coincidencias" : "Aún no tienes rutinas"}
                body={
                  query.trim()
                    ? "Prueba otro término de búsqueda."
                    : "Crea tu primera plantilla y empieza a entrenar serie a serie."
                }
                cta={
                  !query.trim() ? (
                    <AnimatedGoldButton
                      label="Crear primera rutina"
                      loadingLabel="…"
                      loading={false}
                      onPress={() => router.push("/rutina/nueva")}
                      accessibilityLabel="Crear primera rutina"
                    />
                  ) : undefined
                }
              />
            )
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: fabBottom + 72 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={AUTH.gold} />
          }
        />
      )}

      <Pressable
        onPress={() => router.push("/rutina/nueva")}
        style={({ pressed }) => [styles.fabRound, { bottom: fabBottom }, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Crear nueva rutina"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WORKOUT_UI.bg,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: AUTH_PAD,
  },
  listContent: {
    paddingHorizontal: AUTH_PAD,
    gap: 12,
  },
  list: {
    flex: 1,
  },
  listHeader: {
    gap: 10,
    paddingBottom: 8,
  },
  menuBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuBtnText: {
    color: AUTH.muted,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  cardThumb: {
    flexShrink: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  editBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  trainBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: WORKOUT_UI.goldGlow,
  },
  trainBtnDisabled: {
    opacity: 0.45,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.6)",
  },
  trainBtnText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "700",
  },
  trainBtnTextDisabled: {
    color: AUTH.muted,
    fontWeight: "600",
  },
  search: {
    ...authScreenStyles.input,
    marginBottom: 12,
    color: AUTH.steel,
    fontSize: 16,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
  },
  card: {
    ...workoutScreenStyles.listCard,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  cardTitleCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardTitle: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  cardDesc: {
    color: AUTH.steel,
    fontSize: 14,
    lineHeight: 20,
  },
  sessionChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: WORKOUT_UI.chipBg,
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
  },
  sessionChipText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  cardMeta: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  cardMetaMuted: {
    color: AUTH.faint,
    fontSize: 12,
  },
  fabRound: {
    position: "absolute",
    right: AUTH_PAD,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
    backgroundColor: "rgba(35, 32, 22, 0.96)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  fabText: {
    color: AUTH.gold,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },
  pressed: workoutScreenStyles.pressed,
});
