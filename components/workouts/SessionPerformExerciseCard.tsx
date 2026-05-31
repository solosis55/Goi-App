import { useEffect, useMemo, useState } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { goiToast } from "../../context/GoiToastContext";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import { WORKOUT_SETS_MAX_PER_EXERCISE } from "../../constants/workoutFormLimits";
import type { Exercise } from "../../types/exercise";
import { PERFORM_SET_TYPE_COL_WIDTH, PerformSetBlock } from "./perform/PerformSetBlock";
import { migratePerformSetForType } from "../../utils/performSetExtras";
import type { WorkoutSetRow } from "../../types/workout";
import type { SessionPerformBlock, SessionPerformSet } from "../../types/workoutSessionPerform";
import { isLateralityAllowed } from "../../utils/exerciseLateralityLimits";
import type { ExerciseLastPerformance } from "../../utils/exerciseLastPerformance";
import { antColumnForSet, lastDoneInSession } from "../../utils/performSetAnt";
import { performBlockHeadMetaLine, performBlockSetsDoneRatio } from "../../utils/performBlockHeadMeta";
import { formatRestDuration } from "../../constants/workoutRest";
import { blockRestSec } from "../../utils/performBlockRest";
import { buildVsLastSummary } from "../../utils/workoutVsLastSummary";
import { setBeatsLastPerformance } from "../../utils/exercisePersonalRecord";
import { workoutHapticSuccess } from "../../utils/workoutHaptics";
import { WorkoutVsLastChip } from "./WorkoutVsLastChip";
import { ExerciseDetailSheet } from "./ExerciseDetailSheet";
import { ExerciseBlockCardShell } from "./ExerciseBlockCardShell";
import { ExerciseBlockMetaChips, formatExerciseMetaSummary } from "./ExerciseBlockMetaChips";
import { SetTypePickerSheet } from "./SetTypePickerSheet";
import { SetsProgressBar } from "./SetsProgressBar";
import { WorkoutBlockRestPicker } from "./WorkoutBlockRestPicker";
import { WorkoutLabelsIcon, WorkoutNotesIcon, WorkoutRestIcon } from "./WorkoutPerformIcons";
import { WorkoutNotesSheet } from "./WorkoutNotesSheet";
import { WORKOUT_BLOCK_NOTES_MAX } from "../../constants/workoutSessions";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SessionPerformExerciseCardProps = {
  index: number;
  block: SessionPerformBlock;
  exercise?: Exercise;
  disabled?: boolean;
  collapseAll?: boolean;
  isActive?: boolean;
  onPatchSet: (setIndex: number, patch: Partial<SessionPerformSet>) => void;
  onPatchPlanned: (setIndex: number, patch: Partial<WorkoutSetRow>) => void;
  onPatchBlock: (patch: Partial<SessionPerformBlock>) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  lastPerformance?: ExerciseLastPerformance;
};

export function SessionPerformExerciseCard({
  index,
  block,
  exercise,
  disabled,
  collapseAll,
  isActive,
  onPatchSet,
  onPatchPlanned,
  onPatchBlock,
  onAddSet,
  onRemoveSet,
  lastPerformance,
}: SessionPerformExerciseCardProps) {
  const { showAlert } = useGoiAlert();
  const [collapsed, setCollapsed] = useState(false);
  const [setTypePickerIdx, setSetTypePickerIdx] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [blockNotesOpen, setBlockNotesOpen] = useState(false);
  const [restPickerOpen, setRestPickerOpen] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);

  useEffect(() => {
    if (collapseAll !== undefined) setCollapsed(collapseAll);
  }, [collapseAll]);

  const name = exercise?.name ?? "Ejercicio";
  const doneCount = block.sets.filter((s) => s.done).length;
  const totalSets = block.sets.length;
  const allDone = totalSets > 0 && doneCount === totalSets;
  const canAddSet = totalSets < WORKOUT_SETS_MAX_PER_EXERCISE;
  const canRemoveSet = totalSets > 1;
  const doneRatio = useMemo(() => performBlockSetsDoneRatio(doneCount, totalSets), [doneCount, totalSets]);
  const headMeta = performBlockHeadMetaLine(block, doneCount, totalSets);
  const vsLast = useMemo(() => buildVsLastSummary(block, lastPerformance), [block, lastPerformance]);
  const metaHint = formatExerciseMetaSummary(block);

  const firstIncompleteIdx = useMemo(() => block.sets.findIndex((s) => !s.done), [block.sets]);
  const blockNotes = block.notes ?? "";

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((c) => !c);
  };

  const toggleMeta = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMetaExpanded((v) => !v);
  };

  const removeLastSet = () => {
    if (disabled) return;
    if (!canRemoveSet) {
      showAlert({
        title: "Quitar serie",
        message: "Debe quedar al menos una serie en el ejercicio.",
        buttons: [{ text: "Entendido", style: "cancel" }],
      });
      return;
    }
    const setIndex = totalSets - 1;
    showAlert({
      title: "Quitar serie",
      message: `Se eliminará la serie ${setIndex + 1} de este ejercicio.`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Quitar", style: "destructive", onPress: () => onRemoveSet(setIndex) },
      ],
    });
  };

  const toggleDone = (setIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const row = block.sets[setIndex];
    if (!row) return;
    const nextDone = !row.done;
    const anterior = lastDoneInSession(block.sets, setIndex);
    const fillReps = anterior?.reps && anterior.reps !== "—" ? anterior.reps : row.planned.reps;
    const fillWeight = anterior?.weight && anterior.weight !== "—" ? anterior.weight : row.planned.weight;
    const actualReps = nextDone && !row.actualReps.trim() ? fillReps : row.actualReps;
    const actualWeight = nextDone && !row.actualWeight.trim() ? fillWeight : row.actualWeight;
    if (nextDone && lastPerformance) {
      const candidate = { ...row, done: true, actualReps, actualWeight };
      if (setBeatsLastPerformance(candidate, lastPerformance)) {
        workoutHapticSuccess();
        goiToast("¡Nuevo récord personal!");
      }
    }
    onPatchSet(setIndex, {
      done: nextDone,
      actualReps,
      actualWeight,
    });
  };

  const pickerSet = setTypePickerIdx !== null ? block.sets[setTypePickerIdx] : null;

  const showSetTableHead = block.sets.length > 0;

  const progressBar =
    isActive && !collapsed ? (
      <View style={styles.headProgress}>
        <SetsProgressBar ratio={doneRatio} accessibilityLabel={`${doneCount} de ${totalSets} series completadas`} />
      </View>
    ) : null;

  const collapsedContent = (
    <>
      <Text style={styles.collapsedHint} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {headMeta}
      </Text>
      <Text style={styles.collapsedRatio} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {doneCount}/{totalSets} series
      </Text>
    </>
  );

  const headLine = (
    <>
      <Text style={styles.headMetaLine} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {headMeta}
      </Text>
      {vsLast ? <WorkoutVsLastChip label={vsLast.label} trend={vsLast.trend} /> : null}
      {progressBar}
    </>
  );

  return (
    <>
      <ExerciseBlockCardShell
        exerciseName={name}
        imageUri={exercise?.imageUrl ? resolveMediaUrl(exercise.imageUrl) : null}
        badgeLabel={allDone ? "✓" : index + 1}
        badgeDone={allDone}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        isActive={isActive}
        nameEmphasis={isActive}
        headLine={headLine}
        collapsedContent={collapsedContent}
        onPhotoPress={exercise ? () => setDetailOpen(true) : undefined}
      >
        {metaExpanded ? (
          <ExerciseBlockMetaChips
            block={block}
            exercise={exercise}
            disabled={disabled}
            collapsible={false}
            onLaterality={(laterality) => onPatchBlock({ laterality })}
            onEquipment={(slug) => {
              const nextSlug = block.equipmentSlug === slug ? "" : slug;
              const patch: { equipmentSlug: string; laterality?: "bilateral" | "unilateral" } = {
                equipmentSlug: nextSlug,
              };
              if (!isLateralityAllowed(block.laterality, nextSlug, exercise)) {
                patch.laterality = "bilateral";
              }
              onPatchBlock(patch);
            }}
            onSanitizeEquipment={(equipmentSlug) => onPatchBlock({ equipmentSlug })}
            onSanitizeLaterality={(laterality) => onPatchBlock({ laterality })}
          />
        ) : (
          <Text style={styles.metaCompact} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {metaHint}
          </Text>
        )}

        <View style={styles.blockToolsRow}>
          <Pressable
            onPress={toggleMeta}
            disabled={disabled}
            style={({ pressed }) => [
              styles.blockToolIcon,
              metaExpanded ? styles.blockToolIconActive : null,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: metaExpanded }}
            accessibilityLabel={
              metaExpanded ? "Ocultar etiquetas de lado y material" : "Mostrar etiquetas de lado y material"
            }
          >
            <WorkoutLabelsIcon size={17} />
          </Pressable>
          <Pressable
            onPress={() => setRestPickerOpen(true)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.blockToolIcon,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Descanso: ${formatRestDuration(blockRestSec(block))}`}
          >
            <WorkoutRestIcon size={17} />
          </Pressable>
          <Pressable
            onPress={() => setBlockNotesOpen(true)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.blockToolIcon,
              blockNotes.length > 0 ? styles.blockToolIconActive : null,
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Notas de ${name}`}
          >
            <WorkoutNotesIcon size={17} />
          </Pressable>
          <View style={styles.blockToolsSetActions}>
            {canAddSet ? (
              <Pressable
                onPress={onAddSet}
                disabled={disabled}
                style={({ pressed }) => [
                  workoutScreenStyles.exerciseBlockAddSetBtn,
                  styles.blockToolsSetBtn,
                  disabled ? workoutScreenStyles.exerciseBlockAddSetBtnDisabled : null,
                  pressed ? styles.pressed : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Añadir serie"
              >
                <View style={workoutScreenStyles.exerciseBlockAddSetIcon}>
                  <Text
                    style={workoutScreenStyles.exerciseBlockAddSetIconText}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    +
                  </Text>
                </View>
                <Text style={workoutScreenStyles.exerciseBlockAddSetLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Serie
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.maxSetsHint, styles.blockToolsSetBtn]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Máx.
              </Text>
            )}
            <Pressable
              onPress={removeLastSet}
              disabled={disabled || !canRemoveSet}
              style={({ pressed }) => [
                styles.blockToolsRemoveSetBtn,
                styles.blockToolsSetBtn,
                disabled || !canRemoveSet ? styles.blockToolsRemoveSetBtnDisabled : null,
                pressed && canRemoveSet && !disabled ? styles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Quitar última serie"
            >
              <View style={styles.blockToolsRemoveSetIcon}>
                <Text style={styles.blockToolsRemoveSetIconText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  −
                </Text>
              </View>
              <Text style={styles.blockToolsRemoveSetLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Serie
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.setsSectionHead}>
          <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Series · {totalSets}
          </Text>
        </View>

        {showSetTableHead ? (
          <View style={styles.setTableHead}>
            <Text style={[styles.colHead, styles.colNumHead]}>#</Text>
            <View style={styles.colTypeHead}>
              <Text style={styles.colHead}>Tipo</Text>
            </View>
            <Text style={[styles.colHead, styles.colLastHead]}>Últ.</Text>
            <Text style={[styles.colHead, styles.colRepsHead]}>Reps</Text>
            <Text style={[styles.colHead, styles.colKgHead]}>Kg</Text>
            <View style={styles.colHeadCheck} />
          </View>
        ) : null}

        <View style={styles.setsList}>
          {block.sets.map((row, setIndex) => {
            const ant = antColumnForSet(block.sets, setIndex, lastPerformance);
            return (
              <PerformSetBlock
                key={setIndex}
                setIndex={setIndex}
                row={row}
                blockSets={block.sets}
                lastPerformance={lastPerformance}
                antLine={ant.line}
                antFromHistory={ant.fromHistory}
                antCopyable={Boolean(ant.copy) && !row.done}
                disabled={disabled}
                isActiveRow={Boolean(isActive && !row.done && setIndex === firstIncompleteIdx)}
                onToggleDone={() => toggleDone(setIndex)}
                onPatchSet={(patch) => onPatchSet(setIndex, patch)}
                onCopyFromAnt={() => {
                  if (!ant.copy) return;
                  onPatchSet(setIndex, {
                    actualReps: ant.copy.reps,
                    actualWeight: ant.copy.weight,
                  });
                }}
                onOpenTypePicker={() => setSetTypePickerIdx(setIndex)}
              />
            );
          })}
        </View>
      </ExerciseBlockCardShell>

      <SetTypePickerSheet
        visible={setTypePickerIdx !== null}
        selected={pickerSet?.planned.setType ?? "normal"}
        onSelect={(slug) => {
          if (setTypePickerIdx === null) return;
          const current = block.sets[setTypePickerIdx];
          if (!current) return;
          const nextPlanned = { ...current.planned, setType: slug };
          onPatchSet(setTypePickerIdx, {
            planned: nextPlanned,
            ...migratePerformSetForType({ ...current, planned: nextPlanned }, slug),
          });
        }}
        onClose={() => setSetTypePickerIdx(null)}
      />

      <WorkoutBlockRestPicker
        triggerless
        open={restPickerOpen}
        onOpenChange={setRestPickerOpen}
        selectedSec={blockRestSec(block)}
        onSelect={(restSec) => onPatchBlock({ restSec })}
        disabled={disabled}
      />

      <ExerciseDetailSheet visible={detailOpen} exercise={exercise} onClose={() => setDetailOpen(false)} />

      <WorkoutNotesSheet
        visible={blockNotesOpen}
        title={`Notas · ${name}`}
        subtitle="Comentarios sobre técnica, sensaciones o incidencias en este ejercicio."
        notes={blockNotes}
        maxLength={WORKOUT_BLOCK_NOTES_MAX}
        placeholder="Ej. bajar peso en última serie, dolor hombro derecho…"
        disabled={disabled}
        onChangeNotes={(text) => onPatchBlock({ notes: text })}
        onClose={() => setBlockNotesOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headMetaLine: {
    color: AUTH.steel,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    lineHeight: 16,
  },
  collapsedHint: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headProgress: {
    marginTop: 8,
  },
  metaCompact: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  blockToolsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  blockToolIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  blockToolIconActive: {
    borderColor: "rgba(212, 175, 55, 0.42)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  blockToolsSetActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  blockToolsSetBtn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  blockToolsRemoveSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.38)",
    backgroundColor: "rgba(40, 18, 18, 0.55)",
    minHeight: 36,
  },
  blockToolsRemoveSetBtnDisabled: {
    opacity: 0.38,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.5)",
  },
  blockToolsRemoveSetIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.45)",
    backgroundColor: "rgba(48, 22, 22, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  blockToolsRemoveSetIconText: {
    color: AUTH.danger,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  blockToolsRemoveSetLabel: {
    color: AUTH.danger,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  collapsedRatio: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  setsSectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 2,
    flexWrap: "wrap",
  },
  maxSetsHint: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
  },
  setTableHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
    backgroundColor: "rgba(10, 10, 12, 0.85)",
  },
  colHead: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  colNumHead: {
    width: 22,
    textAlign: "center",
  },
  colTypeHead: {
    width: PERFORM_SET_TYPE_COL_WIDTH,
    alignItems: "center",
  },
  colLastHead: {
    width: 52,
    textAlign: "center",
  },
  colRepsHead: {
    flex: 1,
    textAlign: "center",
  },
  colKgHead: {
    flex: 1,
    textAlign: "center",
  },
  colHeadCheck: {
    width: 44,
  },
  setsList: {
    gap: 0,
  },
  pressed: {
    opacity: 0.88,
  },
});
