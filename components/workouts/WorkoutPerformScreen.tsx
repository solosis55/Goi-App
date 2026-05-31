import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { AppScreenShell } from "../AppScreenShell";
import { workoutScreenStyles, WORKOUT_UI } from "../../constants/workoutScreenUi";
import { WORKOUT_SESSION_NOTES_MAX } from "../../constants/workoutSessions";
import { useExerciseLastPerformance } from "../../hooks/useExerciseLastPerformance";
import { useWorkoutPerform } from "../../hooks/useWorkoutPerform";
import { useWorkoutRestTimer } from "../../hooks/useWorkoutRestTimer";
import type { Workout } from "../../types/workout";
import type { SessionPerformSet } from "../../types/workoutSessionPerform";
import { firstIncompleteBlockIndex, estimateSessionVolumeKg } from "../../utils/workoutPerformHelpers";
import { blockRestSec } from "../../utils/performBlockRest";
import {
  formatSessionElapsed,
  isSessionTimerPaused,
  sessionElapsedMs,
} from "../../utils/workoutSessionTimer";
import {
  playRestCompleteFeedback,
  readWorkoutRestSoundEnabled,
  writeWorkoutRestSoundEnabled,
} from "../../utils/workoutRestSound";
import { workoutHapticLight, workoutHapticSuccess } from "../../utils/workoutHaptics";
import { AnimatedGoldButton } from "../auth/AnimatedGoldButton";
import { useWorkoutScreenHeader } from "../../hooks/useWorkoutScreenHeader";
import { WorkoutStatPills } from "./WorkoutStatPills";
import { ExerciseCatalogModal } from "./ExerciseCatalogModal";
import { SessionPerformExerciseCard } from "./SessionPerformExerciseCard";
import { WorkoutKeepAwake } from "./WorkoutKeepAwake";
import { WorkoutSessionTimerIcon } from "./WorkoutSessionTimerIcon";
import { WorkoutRestTimerBar } from "./WorkoutRestTimerBar";
import { WorkoutNotesIcon } from "./WorkoutPerformIcons";
import { WorkoutSessionNotesSheet } from "./WorkoutSessionNotesSheet";
import { WorkoutHubEmptyState } from "./WorkoutHubEmptyState";
import {
  ShareWorkoutPromptSheet,
  type ShareWorkoutPromptStats,
} from "../post/ShareWorkoutPromptSheet";

type WorkoutPerformScreenProps = {
  workout: Workout;
};

export function WorkoutPerformScreen({ workout }: WorkoutPerformScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useGoiAlert();
  const perform = useWorkoutPerform(workout);
  const [collapseAll, setCollapseAll] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [finishNotes, setFinishNotes] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [blockKeys, setBlockKeys] = useState<string[]>([]);
  const [restSoundEnabled, setRestSoundEnabled] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [sharePrompt, setSharePrompt] = useState<{
    sessionId: string;
    stats: ShareWorkoutPromptStats;
  } | null>(null);
  const restWarned3sRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const blocksTopYRef = useRef(0);
  const blockOffsetsRef = useRef<Record<number, number>>({});
  const prevActiveBlockRef = useRef(-1);
  const [restExerciseLabel, setRestExerciseLabel] = useState<string | null>(null);
  const lastPerformanceMap = useExerciseLastPerformance();
  const restTimer = useWorkoutRestTimer({
    onComplete: () => {
      void playRestCompleteFeedback(restSoundEnabled);
      setRestExerciseLabel(null);
    },
  });

  useEffect(() => {
    void readWorkoutRestSoundEnabled().then(setRestSoundEnabled);
  }, []);

  const blocks = perform.session?.blocks ?? [];

  useEffect(() => {
    const n = blocks.length;
    setBlockKeys((prev) => {
      if (prev.length === n && prev.every(Boolean)) return prev;
      const next = prev.slice(0, n);
      while (next.length < n) {
        next.push(`pk-${Date.now()}-${next.length}`);
      }
      return next;
    });
  }, [blocks.length]);

  const confirmAbandon = useCallback(() => {
    const run = async () => {
      await perform.abandonSession();
      router.back();
    };
    showAlert({
      title: "Descartar entrenamiento",
      message: "Se borrará el progreso de esta sesión. No se guardará en tu historial.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Descartar", style: "destructive", onPress: () => void run() },
      ],
    });
  }, [perform, router, showAlert]);

  const handleBack = useCallback(() => {
    const leave = () => router.back();
    showAlert({
      title: "Entrenamiento en curso",
      message: "Tu progreso queda guardado. ¿Qué quieres hacer?",
      buttons: [
        { text: "Seguir entrenando", style: "cancel" },
        { text: "Salir", onPress: leave },
        { text: "Descartar", style: "destructive", onPress: () => void confirmAbandon() },
      ],
    });
  }, [router, confirmAbandon, showAlert]);

  const openFinish = useCallback(() => {
    if (!perform.allSetsDone) {
      const pending = perform.progress.totalSets - perform.progress.completedSets;
      showAlert({
        title: "Series pendientes",
        message: `Aún faltan ${pending} series por marcar. ¿Quieres finalizar el entrenamiento igualmente?`,
        buttons: [
          { text: "Seguir", style: "cancel" },
          {
            text: "Finalizar",
            onPress: () => {
              setFinishNotes(perform.session?.notes ?? "");
              setFinishModalOpen(true);
            },
          },
        ],
      });
      return;
    }
    setFinishNotes(perform.session?.notes ?? "");
    setFinishModalOpen(true);
  }, [perform.allSetsDone, perform.progress, perform.session?.notes, showAlert]);

  const progressPct = useMemo(() => {
    if (perform.progress.totalSets === 0) return 0;
    return Math.round((perform.progress.completedSets / perform.progress.totalSets) * 100);
  }, [perform.progress]);

  const activeBlockIndex = useMemo(() => firstIncompleteBlockIndex(blocks), [blocks]);

  const volumeKg = useMemo(() => estimateSessionVolumeKg(blocks), [blocks]);

  const confirmFinish = useCallback(async () => {
    const sessionId = await perform.finishSession(finishNotes);
    if (sessionId) {
      workoutHapticSuccess();
      setFinishModalOpen(false);
      const vol = estimateSessionVolumeKg(blocks);
      const pct =
        perform.progress.totalSets === 0
          ? 0
          : Math.round((perform.progress.completedSets / perform.progress.totalSets) * 100);
      setSharePrompt({
        sessionId,
        stats: {
          setsLabel: `${perform.progress.completedSets}/${perform.progress.totalSets}`,
          exercisesLabel: `${perform.progress.completedExercises}/${perform.progress.totalExercises}`,
          progressPct: pct,
          volumeKg: vol > 0 ? vol : undefined,
        },
      });
    }
  }, [perform, finishNotes, blocks]);

  useEffect(() => {
    if (activeBlockIndex < 0 || activeBlockIndex === prevActiveBlockRef.current) return;
    prevActiveBlockRef.current = activeBlockIndex;
    const blockY = blockOffsetsRef.current[activeBlockIndex];
    if (blockY == null) return;
    const targetY = Math.max(0, blocksTopYRef.current + blockY - 72);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [activeBlockIndex]);

  useEffect(() => {
    if (restTimer.secondsLeft === 3) {
      if (!restWarned3sRef.current) {
        restWarned3sRef.current = true;
        workoutHapticLight();
      }
    } else if (restTimer.secondsLeft <= 0) {
      restWarned3sRef.current = false;
    }
  }, [restTimer.secondsLeft]);

  const [timerTick, setTimerTick] = useState(0);
  useEffect(() => {
    if (!perform.session) return;
    const id = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [perform.session?.startedAt, perform.session?.pausedAt]);

  const sessionPaused = perform.session ? isSessionTimerPaused(perform.session) : false;

  const timerLabel = useMemo(() => {
    if (!perform.session) return "";
    void timerTick;
    return formatSessionElapsed(sessionElapsedMs(perform.session));
  }, [perform.session, perform.session?.pausedAt, perform.session?.totalPausedMs, timerTick]);

  const headerStatus = useMemo(() => {
    const parts: string[] = [];
    if (sessionPaused) parts.push("Pausado");
    parts.push(timerLabel);
    if (volumeKg > 0) parts.push(`${volumeKg} kg`);
    return parts.filter(Boolean).join(" · ");
  }, [timerLabel, volumeKg, sessionPaused]);

  const handleSetComplete = useCallback(
    (blockIndex: number, setIndex: number, patch: Partial<SessionPerformSet>) => {
      const block = blocks[blockIndex];
      if (patch.done === true && block) {
        const sec = blockRestSec(block);
        if (sec > 0) {
          workoutHapticLight();
          const name = perform.catalogById.get(block.exerciseId)?.name;
          setRestExerciseLabel(name?.trim() || "Ejercicio");
          restTimer.start(sec);
        }
      } else if (patch.done === false) {
        restTimer.skip();
        setRestExerciseLabel(null);
      }
      perform.patchSet(blockIndex, setIndex, patch);
    },
    [blocks, perform, restTimer]
  );

  const handleSkipRest = useCallback(() => {
    restTimer.skip();
    setRestExerciseLabel(null);
  }, [restTimer]);

  useWorkoutScreenHeader({
    title: perform.session?.workoutTitle ?? "Entrenando",
    statusLabel: headerStatus,
    onBack: handleBack,
  });

  if (!perform.hydrated || !perform.session) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  const session = perform.session;
  const sessionNotes = session.notes ?? "";

  return (
    <AppScreenShell>
    <WorkoutKeepAwake />
    <View style={workoutScreenStyles.screenRoot}>
      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          <Text style={styles.progressPct} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {progressPct}%
          </Text>
          <View style={styles.progressBarFlex}>
            <View style={workoutScreenStyles.progressTrack}>
              <View style={[workoutScreenStyles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
        </View>
        <View style={styles.headerMainRow}>
          <View style={styles.headerPills}>
            <WorkoutStatPills
              compact
              items={[
                { label: "Series", value: `${perform.progress.completedSets}/${perform.progress.totalSets}` },
                { label: "Tiempo", value: timerLabel, accent: sessionPaused },
                {
                  label: "Volumen",
                  value: volumeKg > 0 ? `${volumeKg} kg` : "—",
                  accent: volumeKg > 0,
                },
              ]}
            />
          </View>
          <View style={styles.headerIconActions}>
            <Pressable
              onPress={() => setNotesOpen(true)}
              style={({ pressed }) => [
                styles.headerIconBtn,
                sessionNotes.length > 0 ? styles.headerIconBtnActive : null,
                pressed ? workoutScreenStyles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notas de sesión"
            >
              <WorkoutNotesIcon size={18} />
            </Pressable>
            <Pressable
              onPress={() => perform.togglePause()}
              style={({ pressed }) => [
                styles.headerIconBtn,
                sessionPaused ? styles.headerIconBtnActive : null,
                pressed ? workoutScreenStyles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={sessionPaused ? "Reanudar cronómetro" : "Pausar cronómetro"}
            >
              <WorkoutSessionTimerIcon paused={sessionPaused} size={18} />
            </Pressable>
          </View>
        </View>
        {sessionPaused ? (
          <Text style={styles.pausedBanner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cronómetro en pausa
          </Text>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollFlex}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 + (restTimer.secondsLeft > 0 ? 96 : 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {perform.error ? (
          <Text style={workoutScreenStyles.errorBanner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {perform.error}
          </Text>
        ) : null}

        <View style={styles.sessionBar}>
          <Text style={styles.sessionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ejercicios
          </Text>
          {blocks.length > 0 ? (
            <Pressable
              onPress={() => setCollapseAll((c) => !c)}
              style={({ pressed }) => [styles.sessionBarBtn, pressed ? workoutScreenStyles.pressed : null]}
            >
              <Text style={styles.sessionBarBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {collapseAll ? "Expandir" : "Minimizar"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {blocks.length === 0 ? (
          <WorkoutHubEmptyState
            title="Sin ejercicios en la sesión"
            body="Pulsa «+ Ejercicio» abajo para abrir el catálogo."
          />
        ) : (
          <View
            style={styles.blocks}
            onLayout={(e) => {
              blocksTopYRef.current = e.nativeEvent.layout.y;
            }}
          >
            {blocks.map((block, index) => (
              <View
                key={blockKeys[index] ?? `${block.exerciseId}-${index}`}
                onLayout={(e) => {
                  blockOffsetsRef.current[index] = e.nativeEvent.layout.y;
                }}
              >
              <SessionPerformExerciseCard
                index={index}
                block={block}
                exercise={perform.catalogById.get(block.exerciseId)}
                disabled={perform.finishing}
                isActive={index === activeBlockIndex}
                collapseAll={collapseAll}
                lastPerformance={lastPerformanceMap[block.exerciseId]}
                onPatchSet={(setIndex, patch) => handleSetComplete(index, setIndex, patch)}
                onPatchPlanned={(setIndex, patch) => perform.patchPlannedSet(index, setIndex, patch)}
                onPatchBlock={(patch) => perform.patchBlock(index, patch)}
                onAddSet={() => perform.addSet(index, false)}
                onRemoveSet={(setIndex) => perform.removeSet(index, setIndex)}
              />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ExerciseCatalogModal
        visible={catalogOpen}
        catalog={perform.catalog}
        loading={perform.catalogLoading}
        selectedIds={perform.selectedExerciseIds}
        slotsLeft={perform.slotsLeft}
        onClose={() => setCatalogOpen(false)}
        onPick={(id) => perform.addExercise(id)}
        onPickMany={(ids) => perform.addExercises(ids)}
        keepOpenOnPick
      />

      <WorkoutSessionNotesSheet
        visible={notesOpen}
        notes={sessionNotes}
        disabled={perform.finishing}
        onChangeNotes={perform.setNotes}
        onClose={() => setNotesOpen(false)}
      />

      <View style={styles.footerDock}>
        <WorkoutRestTimerBar
          secondsLeft={restTimer.secondsLeft}
          totalSeconds={restTimer.totalSeconds}
          progress={restTimer.progress}
          exerciseLabel={restExerciseLabel}
          onSkip={handleSkipRest}
          onSub15={() => restTimer.addSeconds(-15)}
          onAdd15={() => restTimer.addSeconds(15)}
          soundEnabled={restSoundEnabled}
          onToggleSound={() => {
            setRestSoundEnabled((on) => {
              const next = !on;
              void writeWorkoutRestSoundEnabled(next);
              return next;
            });
          }}
        />
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            onPress={() => setCatalogOpen(true)}
            disabled={perform.finishing || perform.slotsLeft <= 0}
            style={({ pressed }) => [
              workoutScreenStyles.secondaryFooterBtn,
              styles.footerBtnEqual,
              (perform.finishing || perform.slotsLeft <= 0) ? styles.footerBtnDisabled : null,
              pressed ? workoutScreenStyles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Añadir ejercicio"
          >
            <Text style={workoutScreenStyles.secondaryFooterBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              + Ejercicio
            </Text>
          </Pressable>
          <View style={[styles.footerBtnEqual, !perform.allSetsDone ? styles.footerFinishMuted : null]}>
            <AnimatedGoldButton
              label={perform.allSetsDone ? "Completar" : "Finalizar"}
              loadingLabel="Guardando…"
              loading={perform.finishing}
              disabled={perform.finishing}
              onPress={openFinish}
              accessibilityLabel="Finalizar entrenamiento"
            />
          </View>
        </View>
      </View>

      <Modal visible={finishModalOpen} animationType="slide" transparent onRequestClose={() => setFinishModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFinishModalOpen(false)} />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.modalTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Completar entrenamiento
          </Text>
          <Text style={styles.modalSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Resumen de la sesión antes de guardar en tu historial.
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {perform.progress.completedSets}/{perform.progress.totalSets}
              </Text>
              <Text style={styles.summaryLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Series
              </Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {perform.progress.completedExercises}/{perform.progress.totalExercises}
              </Text>
              <Text style={styles.summaryLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Ejercicios
              </Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryValue, styles.summaryAccent]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {progressPct}%
              </Text>
              <Text style={styles.summaryLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Completado
              </Text>
            </View>
            {volumeKg > 0 ? (
              <View style={styles.summaryCell}>
                <Text style={styles.summaryValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {volumeKg}
                </Text>
                <Text style={styles.summaryLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Kg (aprox.)
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.modalTimer} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Tiempo · {timerLabel}
          </Text>
          <Text style={workoutScreenStyles.fieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Notas · {finishNotes.length}/{WORKOUT_SESSION_NOTES_MAX}
          </Text>
          <TextInput
            value={finishNotes}
            onChangeText={(t) => setFinishNotes(t.slice(0, WORKOUT_SESSION_NOTES_MAX))}
            placeholder="Sensaciones, RPE, incidencias…"
            placeholderTextColor={AUTH.faint}
            multiline
            style={[workoutScreenStyles.input, { minHeight: 88, textAlignVertical: "top" }]}
          />
          <View style={styles.modalActions}>
            <Pressable
              onPress={() => setFinishModalOpen(false)}
              style={({ pressed }) => [styles.modalCancel, pressed ? workoutScreenStyles.pressed : null]}
            >
              <Text style={styles.modalCancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Seguir
              </Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <AnimatedGoldButton
                label="Guardar sesión"
                loadingLabel="Guardando…"
                loading={perform.finishing}
                disabled={perform.finishing}
                onPress={() => void confirmFinish()}
                accessibilityLabel="Guardar sesión"
              />
            </View>
          </View>
        </View>
      </Modal>

      <ShareWorkoutPromptSheet
        visible={sharePrompt != null}
        workoutTitle={workout.title}
        stats={
          sharePrompt?.stats ?? {
            setsLabel: "0/0",
            exercisesLabel: "0/0",
            progressPct: 0,
          }
        }
        onLater={() => {
          setSharePrompt(null);
          router.replace("/(tabs)/entrenamientos");
        }}
        onShare={() => {
          const sessionId = sharePrompt?.sessionId;
          setSharePrompt(null);
          if (sessionId) {
            router.replace({
              pathname: "/nueva-publicacion",
              params: { sessionId },
            });
          }
        }}
      />
    </View>
    </AppScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: WORKOUT_UI.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyText: {
    color: AUTH.muted,
    fontSize: 15,
    textAlign: "center",
  },
  backLink: {
    padding: 12,
  },
  backLinkText: authScreenStyles.linkText,
  progressWrap: {
    paddingHorizontal: AUTH_PAD,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "transparent",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressPct: {
    color: AUTH.gold,
    fontSize: 22,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    minWidth: 48,
  },
  progressBarFlex: {
    flex: 1,
    justifyContent: "center",
  },
  headerMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  headerPills: {
    flex: 1,
    minWidth: 0,
  },
  headerIconActions: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconBtnActive: {
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: WORKOUT_UI.chipBgActive,
  },
  pausedBanner: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  sessionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WORKOUT_UI.border,
  },
  sessionTitle: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sessionBarBtn: workoutScreenStyles.ghostBtn,
  sessionBarBtnText: workoutScreenStyles.ghostBtnText,
  scroll: {
    paddingTop: 4,
    paddingBottom: 0,
    paddingHorizontal: AUTH_PAD,
  },
  emptyBox: {
    marginTop: 12,
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: AUTH.cardBorder,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(10, 10, 12, 0.5)",
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  blocks: {
    ...workoutScreenStyles.exerciseBlocksList,
    marginTop: 8,
  },
  scrollFlex: {
    flex: 1,
  },
  footerDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: AUTH.cardBg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
      default: {},
    }),
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: AUTH_PAD,
    paddingTop: 12,
    backgroundColor: AUTH.cardBg,
  },
  footerBtnEqual: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  footerFinishMuted: {
    opacity: 0.72,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  summaryCell: {
    flex: 1,
    minWidth: "42%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.5)",
    gap: 4,
  },
  summaryValue: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  summaryAccent: {
    color: AUTH.gold,
  },
  summaryLabel: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  modalTimer: {
    color: AUTH.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  footerBtnDisabled: {
    opacity: 0.4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    backgroundColor: AUTH.cardBg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderColor: AUTH.cardBorder,
    paddingHorizontal: AUTH_PAD,
    paddingTop: 22,
  },
  modalTitle: authScreenStyles.cardTitle,
  modalSub: {
    ...authScreenStyles.cardSubtitle,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalCancel: {
    flex: 1,
    ...workoutScreenStyles.outlineBtn,
    paddingVertical: 13,
  },
  modalCancelText: workoutScreenStyles.outlineBtnText,
});
