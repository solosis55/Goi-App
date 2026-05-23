import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  WORKOUT_SET_FIELD_MAX_LEN,
  WORKOUT_SETS_MAX_PER_EXERCISE,
} from "../../constants/workoutFormLimits";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock, WorkoutSetRow } from "../../types/workout";
import { createEmptySet } from "../../utils/workoutBlocks";
import {
  editorBlockHeadMetaLine,
  editorBlockSetsFillRatio,
  editorBlockSetsIncomplete,
} from "../../utils/workoutBlockEditorMeta";
import {
  shouldShowCollapsedPills,
  workoutBlockCollapsedSetPills,
  workoutBlockCollapsedSummary,
} from "../../utils/workoutBlockSummary";
import {
  applySetsTemplate,
  blockSetsAreEmpty,
  SET_TEMPLATES,
} from "../../utils/workoutSetTemplates";
import { ExerciseBlockCardShell } from "./ExerciseBlockCardShell";
import { ExerciseBlockMenuButton } from "./ExerciseBlockMenuButton";
import { ExerciseDetailSheet } from "./ExerciseDetailSheet";
import { EditorSetRow } from "./EditorSetRow";
import { SetTypePickerSheet } from "./SetTypePickerSheet";
import { SetsProgressBar } from "./SetsProgressBar";
import { WorkoutExerciseBlockMenuSheet } from "./WorkoutExerciseBlockMenuSheet";
import { WorkoutExerciseConfigSection } from "./WorkoutExerciseConfigSection";

function confirmRemoveBlock(name: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof globalThis.confirm === "function" && globalThis.confirm(`¿Quitar ${name} de la rutina?`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert("Quitar ejercicio", `Se eliminará ${name} de la rutina.`, [
    { text: "Cancelar", style: "cancel" },
    { text: "Quitar", style: "destructive", onPress: onConfirm },
  ]);
}

type WorkoutExerciseBlockCardProps = {
  index: number;
  total: number;
  block: WorkoutExerciseBlock;
  exercise?: Exercise;
  disabled?: boolean;
  hideConfig?: boolean;
  onChange: (block: WorkoutExerciseBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate?: () => void;
  canDuplicate?: boolean;
  collapseAll?: boolean;
};

const SETS_SCROLL_MAX_HEIGHT = 260;

export function WorkoutExerciseBlockCard({
  index,
  total,
  block,
  exercise,
  disabled,
  hideConfig,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  canDuplicate = true,
  collapseAll,
}: WorkoutExerciseBlockCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [setTypePickerIdx, setSetTypePickerIdx] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const repsRefs = useRef<(TextInput | null)[]>([]);
  const kgRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (collapseAll !== undefined) setCollapsed(collapseAll);
  }, [collapseAll]);

  const setsEmpty = blockSetsAreEmpty(block);
  const incomplete = editorBlockSetsIncomplete(block);
  const exerciseName = exercise?.name ?? "Ejercicio";
  const headMeta = editorBlockHeadMetaLine(block);
  const collapsedSummary = workoutBlockCollapsedSummary(block);
  const collapsedPills = useMemo(() => workoutBlockCollapsedSetPills(block), [block]);
  const showPills = shouldShowCollapsedPills(block);
  const setsFillRatio = useMemo(() => editorBlockSetsFillRatio(block), [block]);
  const atSetMax = block.sets.length >= WORKOUT_SETS_MAX_PER_EXERCISE;

  const patchSet = (setIndex: number, patch: Partial<WorkoutSetRow>) => {
    onChange({
      ...block,
      sets: block.sets.map((row, i) => (i === setIndex ? { ...row, ...patch } : row)),
    });
  };

  const addSet = (copyLast = false) => {
    if (atSetMax) return;
    const last = block.sets[block.sets.length - 1];
    const row = copyLast && last ? { ...last } : createEmptySet();
    onChange({ ...block, sets: [...block.sets, row] });
  };

  const duplicateSetAt = (setIndex: number) => {
    if (atSetMax) return;
    const row = block.sets[setIndex];
    if (!row) return;
    onChange({
      ...block,
      sets: [...block.sets.slice(0, setIndex + 1), { ...row }, ...block.sets.slice(setIndex + 1)],
    });
  };

  const removeSet = (setIndex: number) => {
    if (block.sets.length <= 1) return;
    onChange({ ...block, sets: block.sets.filter((_, i) => i !== setIndex) });
  };

  const focusRepsAt = (setIndex: number) => {
    repsRefs.current[setIndex]?.focus();
  };

  const collapsedContent = (
    <>
      <Text style={styles.collapsedSummary} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {collapsedSummary}
      </Text>
      {showPills ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {collapsedPills.map((pill, i) => (
            <View key={`pill-${i}`} style={styles.pill}>
              <Text style={styles.pillText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {pill}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.headProgress}>
        <SetsProgressBar ratio={setsFillRatio} />
      </View>
    </>
  );

  const headLine = (
    <Text style={styles.headMetaLine} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
      {headMeta}
    </Text>
  );

  return (
    <>
      <ExerciseBlockCardShell
        exerciseName={exerciseName}
        imageUri={exercise?.imageUrl}
        badgeLabel={index + 1}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        incomplete={incomplete}
        onPhotoPress={exercise ? () => setDetailOpen(true) : undefined}
        headLine={headLine}
        collapsedContent={collapsedContent}
        headTrailing={<ExerciseBlockMenuButton disabled={disabled} onPress={() => setMenuOpen(true)} />}
      >
        {!hideConfig ? (
          <WorkoutExerciseConfigSection
            block={block}
            exercise={exercise}
            disabled={disabled}
            onChange={(patch) => onChange({ ...block, ...patch })}
          />
        ) : null}

        {setsEmpty ? (
          <View style={styles.emptySetsBanner}>
            <Text style={styles.emptySetsText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {block.sets.length === 1 ? "Tienes una serie sin datos." : "Las series están vacías."}
            </Text>
            <View style={styles.templateRow}>
              {SET_TEMPLATES.map((tpl) => (
                <Pressable
                  key={tpl.id}
                  onPress={() => onChange(applySetsTemplate(block, tpl.id))}
                  disabled={disabled}
                  hitSlop={6}
                  style={({ pressed }) => [pressed ? styles.pressed : null]}
                  accessibilityRole="button"
                  accessibilityLabel={`Plantilla ${tpl.label}`}
                >
                  <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {tpl.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.setsSection}>
          <View style={styles.setsSectionHead}>
            <View style={styles.setsTitleCol}>
              <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Series · {block.sets.length}/{WORKOUT_SETS_MAX_PER_EXERCISE}
              </Text>
              <SetsProgressBar ratio={setsFillRatio} />
            </View>
            <Pressable
              onPress={() => addSet(false)}
              disabled={disabled || atSetMax}
              hitSlop={8}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel="Añadir serie"
            >
              <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                + Serie
              </Text>
            </Pressable>
          </View>

          <View style={styles.setTableHead}>
            <Text style={[styles.colHead, styles.colNumHead]}>#</Text>
            <Text style={[styles.colHead, styles.colRepsHead]}>Reps</Text>
            <Text style={[styles.colHead, styles.colKgHead]}>Kg</Text>
            <View style={styles.colTypeHead}>
              <Text style={styles.colHead}>Tipo</Text>
            </View>
            <View style={styles.colDel} />
          </View>

          <ScrollView
            style={styles.setsScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {block.sets.map((set, setIndex) => (
              <EditorSetRow
                key={`set-${setIndex}`}
                setIndex={setIndex}
                set={set}
                disabled={disabled}
                canRemove={block.sets.length > 1}
                onPatch={(patch) => patchSet(setIndex, patch)}
                onOpenTypePicker={() => setSetTypePickerIdx(setIndex)}
                onRemove={() => removeSet(setIndex)}
                onDuplicate={() => duplicateSetAt(setIndex)}
                onFocusKg={() => kgRefs.current[setIndex]?.focus()}
                onFocusNextRow={() => {
                  const next = setIndex + 1;
                  if (next < block.sets.length) focusRepsAt(next);
                }}
                registerRepsRef={(r) => {
                  repsRefs.current[setIndex] = r;
                }}
                registerKgRef={(r) => {
                  kgRefs.current[setIndex] = r;
                }}
              />
            ))}
          </ScrollView>
        </View>
      </ExerciseBlockCardShell>

      <ExerciseDetailSheet visible={detailOpen} exercise={exercise} onClose={() => setDetailOpen(false)} />

      <SetTypePickerSheet
        visible={setTypePickerIdx !== null}
        selected={setTypePickerIdx !== null ? (block.sets[setTypePickerIdx]?.setType ?? "normal") : "normal"}
        onSelect={(slug) => {
          if (setTypePickerIdx !== null) patchSet(setTypePickerIdx, { setType: slug });
        }}
        onClose={() => setSetTypePickerIdx(null)}
      />

      <WorkoutExerciseBlockMenuSheet
        visible={menuOpen}
        canMoveUp={index > 0}
        canMoveDown={index < total - 1}
        canDuplicate={canDuplicate}
        canDuplicateSet={!atSetMax && block.sets.length > 0}
        onClose={() => setMenuOpen(false)}
        onDuplicateLastSet={() => addSet(true)}
        onDuplicate={onDuplicate}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={() => confirmRemoveBlock(exerciseName, onRemove)}
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
  collapsedSummary: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headProgress: {
    marginTop: 8,
  },
  pillsRow: {
    gap: 6,
    marginTop: 6,
    paddingRight: 4,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    backgroundColor: "rgba(10, 10, 12, 0.7)",
  },
  pillText: {
    color: AUTH.steel,
    fontSize: 11,
    fontWeight: "600",
  },
  emptySetsBanner: {
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: "rgba(35, 32, 22, 0.45)",
  },
  emptySetsText: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  templateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  setsSection: {
    gap: 6,
  },
  setsSectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  setsTitleCol: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  setsScroll: {
    maxHeight: SETS_SCROLL_MAX_HEIGHT,
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
  colRepsHead: {
    flex: 1,
    textAlign: "center",
  },
  colKgHead: {
    flex: 1,
    textAlign: "center",
  },
  colTypeHead: {
    width: 64,
    alignItems: "center",
  },
  colDel: {
    width: 24,
  },
  pressed: {
    opacity: 0.88,
  },
});
