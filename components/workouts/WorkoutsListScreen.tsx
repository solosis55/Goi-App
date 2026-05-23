import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteWorkout } from "../../api/workouts";
import { deleteWorkoutSession } from "../../api/workoutSessions";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useWorkoutHubData } from "../../hooks/useWorkoutHubData";
import type { Workout } from "../../types/workout";
import { blocksFromLegacy } from "../../utils/workoutBlocks";
import { formatSessionPerformedAt } from "../../utils/workoutSessionDate";
import { getErrorMessage } from "../../utils/errorMessages";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import { sortWorkouts, type WorkoutListSort } from "../../constants/workoutListSort";
import { seedDuplicateWorkoutDraft } from "../../utils/duplicateWorkoutDraft";
import { workoutHapticLight } from "../../utils/workoutHaptics";
import { AnimatedGoldButton } from "../auth/AnimatedGoldButton";
import { WorkoutDraftResumeBanner } from "./WorkoutDraftResumeBanner";
import { WorkoutHubHero } from "./WorkoutHubHero";
import { WorkoutListSkeleton } from "./WorkoutListSkeleton";
import { WorkoutRowMenuSheet } from "./WorkoutRowMenuSheet";
import { WorkoutSortBar } from "./WorkoutSortBar";
import { WorkoutStatPills } from "./WorkoutStatPills";
import { WorkoutSessionsList } from "./WorkoutSessionsList";
import { WorkoutsSubTabBar, type WorkoutsSubTab } from "./WorkoutsSubTabBar";

function confirmDeleteRoutine(onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof globalThis.confirm === "function" && globalThis.confirm("¿Eliminar esta rutina?")) {
      onConfirm();
    }
    return;
  }
  Alert.alert("Eliminar rutina", "Esta acción no se puede deshacer.", [
    { text: "Cancelar", style: "cancel" },
    { text: "Eliminar", style: "destructive", onPress: onConfirm },
  ]);
}

type WorkoutRowProps = {
  workout: Workout;
  exerciseNames: string[];
  sessionCount: number;
  lastSessionAt: string | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStartWorkout: () => void;
};

function WorkoutRow({
  workout,
  exerciseNames,
  sessionCount,
  lastSessionAt,
  onEdit,
  onDuplicate,
  onDelete,
  onStartWorkout,
}: WorkoutRowProps) {
  const canTrain = exerciseNames.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <View style={styles.cardTop}>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {workout.title}
            </Text>
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

        {exerciseNames.length > 0 ? (
          <Text style={styles.cardExList} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {exerciseNames.join(" · ")}
          </Text>
        ) : null}

        <View style={styles.ctaWrap}>
          <AnimatedGoldButton
            label={canTrain ? "Comenzar entrenamiento" : "Añade ejercicios"}
            loadingLabel="…"
            loading={false}
            disabled={!canTrain}
            onPress={() => {
              workoutHapticLight();
              onStartWorkout();
            }}
            accessibilityLabel={canTrain ? `Entrenar ${workout.title}` : `${workout.title} sin ejercicios`}
          />
        </View>

        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [styles.editLink, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${workout.title}`}
        >
          <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Editar rutina
          </Text>
        </Pressable>
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

export function WorkoutsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const hub = useWorkoutHubData(user?.id);
  const [subTab, setSubTab] = useState<WorkoutsSubTab>("routines");
  const [query, setQuery] = useState("");
  const [sessionQuery, setSessionQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<WorkoutListSort>("recent");

  useFocusEffect(
    useCallback(() => {
      hub.setLoading(true);
      void hub.load().finally(() => hub.setLoading(false));
    }, [hub.load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await hub.load();
    setRefreshing(false);
  }, [hub]);

  const catalogById = useMemo(() => new Map(hub.catalog.map((e) => [e.id, e.name])), [hub.catalog]);

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
            (catalogById.get(b.exerciseId) ?? "").toLowerCase().includes(q)
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
        (b) => catalogById.get(b.exerciseId) ?? "Ejercicio"
      ),
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
      <WorkoutHubHero compact />

      <WorkoutStatPills
        compact
        items={[
          { label: "Rutinas", value: String(hub.stats.routineCount) },
          { label: "Entrenos", value: String(hub.stats.totalSessions) },
          { label: "Semana", value: String(hub.stats.sessionsThisWeek) },
        ]}
      />

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

  if (subTab === "sessions") {
    return (
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: fabBottom + 24 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={AUTH.gold} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {header}
          <TextInput
            value={sessionQuery}
            onChangeText={setSessionQuery}
            placeholder="Buscar en el historial…"
            placeholderTextColor={AUTH.faint}
            style={styles.search}
            accessibilityLabel="Buscar sesiones"
          />
          <WorkoutSessionsList
            sessions={filteredSessions}
            loading={hub.loading}
            onDelete={(id) => {
              void deleteWorkoutSession(id)
                .then(() => hub.setSessions((prev) => prev.filter((s) => s.id !== id)))
                .catch((e) => hub.setError(getErrorMessage(e, "No se pudo eliminar")));
            }}
          />
        </ScrollView>
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
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const st = hub.sessionStatsByWorkoutId.get(item.id);
            return (
              <WorkoutRow
                workout={item}
                exerciseNames={exerciseNamesFor(item)}
                sessionCount={st?.sessionCount ?? 0}
                lastSessionAt={st?.lastSessionPerformedAt ?? null}
                onEdit={() => router.push({ pathname: "/rutina/[id]", params: { id: item.id } })}
                onDuplicate={() => {
                  void seedDuplicateWorkoutDraft(item).then(() => router.push("/rutina/nueva"));
                }}
                onDelete={() => {
                  confirmDeleteRoutine(() => {
                    void deleteWorkout(item.id)
                      .then(() => hub.setWorkouts((prev) => prev.filter((w) => w.id !== item.id)))
                      .catch((e) => hub.setError(getErrorMessage(e, "No se pudo eliminar")));
                  });
                }}
                onStartWorkout={() => startWorkout(item.id)}
              />
            );
          }}
          ListHeaderComponent={
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
          }
          ListEmptyComponent={
            hub.loading ? null : (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  ▣
                </Text>
                <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {query.trim() ? "Sin coincidencias" : "Aún no tienes rutinas"}
                </Text>
                <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {query.trim() ? "Prueba otro término." : "Crea tu primera plantilla y empieza a entrenar."}
                </Text>
                {!query.trim() ? (
                  <View style={styles.emptyCta}>
                    <AnimatedGoldButton
                      label="Crear primera rutina"
                      loadingLabel="…"
                      loading={false}
                      onPress={() => router.push("/rutina/nueva")}
                      accessibilityLabel="Crear primera rutina"
                    />
                  </View>
                ) : null}
              </View>
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
  ctaWrap: {
    marginTop: 4,
  },
  editLink: {
    alignSelf: "flex-start",
    paddingVertical: 6,
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
  cardExList: {
    color: AUTH.faint,
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  emptyIcon: {
    fontSize: 40,
    color: AUTH.faint,
    opacity: 0.6,
  },
  emptyCta: {
    alignSelf: "stretch",
    width: "100%",
    marginTop: 8,
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
