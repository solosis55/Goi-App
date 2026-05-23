import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { WORKOUT_SET_FIELD_MAX_LEN } from "../../../constants/workoutFormLimits";
import { WORKOUT_UI, workoutScreenStyles } from "../../../constants/workoutScreenUi";
import type { SessionPerformSet } from "../../../types/workoutSessionPerform";
import type { ExerciseLastPerformance } from "../../../utils/exerciseLastPerformance";
import { antColumnForSubStep } from "../../../utils/performSetAnt";
import { isSubStepPerformSetType, isTimedPerformSetType } from "../../../utils/performSetExtras";
import { PerformSetMiniRestRow } from "./PerformSetMiniRestRow";
import { PerformSetSubStepStrip } from "./PerformSetSubStepStrip";
import { PerformSetTimedExtra } from "./PerformSetTimedExtra";
import { WorkoutCheckIcon } from "../WorkoutPerformIcons";
import { PERFORM_SET_TYPE_COL_WIDTH, PerformSetTypeTrigger } from "../PerformSetTypeTrigger";

export type PerformSetBlockProps = {
  setIndex: number;
  row: SessionPerformSet;
  blockSets: SessionPerformSet[];
  lastPerformance?: ExerciseLastPerformance;
  antLine: string;
  antFromHistory?: boolean;
  antCopyable?: boolean;
  disabled?: boolean;
  isActiveRow?: boolean;
  onToggleDone: () => void;
  onPatchSet: (patch: Partial<SessionPerformSet>) => void;
  onCopyFromAnt: () => void;
  onOpenTypePicker: () => void;
};

/** Fila estándar (# Tipo Últ Reps Kg ✓), franja de tiempo o subseries según tipo. */
export function PerformSetBlock(props: PerformSetBlockProps) {
  const { row, onPatchSet, disabled } = props;
  const slug = row.planned.setType;

  if (isSubStepPerformSetType(slug)) {
    return <PerformSetWithSubSteps {...props} />;
  }

  if (isTimedPerformSetType(slug)) {
    return (
      <View style={styles.timedWrap}>
        <PerformSetStandardRow {...props} />
        <PerformSetTimedExtra row={row} disabled={disabled} done={row.done} onPatchSet={onPatchSet} />
      </View>
    );
  }

  return <PerformSetStandardRow {...props} />;
}

function PerformSetWithSubSteps(props: PerformSetBlockProps) {
  const { row, setIndex, blockSets, lastPerformance, onPatchSet, disabled } = props;
  const slug = row.planned.setType;
  const extras = row.subSteps ?? [];
  const done = row.done;

  return (
    <View style={styles.subStepWrap}>
      <PerformSetStandardRow {...props} />
      {slug === "rest_pause" ? (
        <PerformSetMiniRestRow
          value={row.miniRestSec ?? ""}
          disabled={disabled}
          done={done}
          onChange={(miniRestSec) => onPatchSet({ miniRestSec })}
        />
      ) : null}
      <PerformSetSubStepStrip
        setType={slug}
        steps={extras}
        disabled={disabled}
        done={done}
        repsLabel={slug === "dropset" ? "Series" : "Reps"}
        stepLabel={(i) => (slug === "dropset" ? `↓${i + 2}` : `P${i + 2}`)}
        addLabel={slug === "dropset" ? "Bajada" : "Pausa"}
        getAntColumn={(subIndex) =>
          antColumnForSubStep(blockSets, setIndex, subIndex, row, extras, lastPerformance)
        }
        onCopyAnt={(subIndex, copy) => {
          const next = extras.map((step, i) =>
            i === subIndex ? { ...step, reps: copy.reps, weight: copy.weight } : step
          );
          onPatchSet({ subSteps: next });
        }}
        onChangeSteps={(subSteps) => {
          const next = subSteps.map((s) => ({
            weight: s.weight.slice(0, 24),
            reps: s.reps.slice(0, 24),
          }));
          onPatchSet({ subSteps: next });
        }}
      />
    </View>
  );
}

function PerformSetStandardRow({
  setIndex,
  row,
  antLine,
  antFromHistory,
  antCopyable,
  disabled,
  isActiveRow,
  onToggleDone,
  onPatchSet,
  onCopyFromAnt,
  onOpenTypePicker,
}: PerformSetBlockProps) {
  return (
    <View
      style={[
        styles.setRow,
        setIndex % 2 === 1 ? workoutScreenStyles.setRowAlt : null,
        row.done ? styles.setRowDone : null,
        isActiveRow ? styles.setRowActive : null,
      ]}
    >
      <Text style={[styles.colNum, styles.colFixed]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {setIndex + 1}
      </Text>

      <PerformSetTypeTrigger
        slug={row.planned.setType}
        disabled={disabled}
        done={row.done}
        emphasized={isActiveRow}
        onPress={onOpenTypePicker}
      />

      <Pressable
        onPress={antCopyable ? onCopyFromAnt : undefined}
        disabled={disabled || row.done || !antCopyable}
        style={({ pressed }) => [
          styles.colLastPress,
          antCopyable && !row.done ? styles.colLastTappable : null,
          pressed && antCopyable ? styles.pressed : null,
        ]}
        accessibilityRole={antCopyable ? "button" : "text"}
        accessibilityLabel={
          antCopyable ? `Copiar última referencia: ${antLine}` : `Última referencia: ${antLine}`
        }
      >
        <Text
          style={[
            styles.colLast,
            row.done ? styles.colLastDone : null,
            antFromHistory ? styles.colLastHistory : null,
            antCopyable && !row.done ? styles.colLastCopyHint : null,
          ]}
          numberOfLines={2}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          {antLine}
        </Text>
      </Pressable>

      <TextInput
        value={row.actualReps}
        onChangeText={(t) => onPatchSet({ actualReps: t.slice(0, WORKOUT_SET_FIELD_MAX_LEN) })}
        placeholder="—"
        placeholderTextColor={AUTH.faint}
        style={[
          workoutScreenStyles.setInputField,
          styles.colReps,
          isActiveRow ? workoutScreenStyles.setInputFieldActive : null,
          row.done ? styles.setInputDone : null,
        ]}
        editable={!disabled && !row.done}
      />
      <TextInput
        value={row.actualWeight}
        onChangeText={(t) => onPatchSet({ actualWeight: t.slice(0, WORKOUT_SET_FIELD_MAX_LEN) })}
        placeholder="—"
        placeholderTextColor={AUTH.faint}
        style={[
          workoutScreenStyles.setInputField,
          styles.colKg,
          isActiveRow ? workoutScreenStyles.setInputFieldActive : null,
          row.done ? styles.setInputDone : null,
        ]}
        editable={!disabled && !row.done}
        keyboardType="decimal-pad"
      />

      <Pressable
        onPress={onToggleDone}
        disabled={disabled}
        style={({ pressed }) => [
          workoutScreenStyles.checkBtnBase,
          styles.checkBtn,
          styles.colFixed,
          row.done ? styles.checkBtnOn : styles.checkBtnPending,
          isActiveRow ? styles.checkBtnActive : null,
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: row.done }}
        accessibilityLabel={`Completar serie ${setIndex + 1}`}
      >
        {row.done ? <WorkoutCheckIcon size={18} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  subStepWrap: {
    gap: 0,
  },
  timedWrap: {
    gap: 0,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 8,
    minHeight: 52,
  },
  setRowDone: {
    backgroundColor: "rgba(22, 40, 28, 0.4)",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(134, 239, 172, 0.5)",
    opacity: 0.92,
  },
  setRowActive: {
    backgroundColor: "rgba(48, 44, 28, 0.62)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(212, 175, 55, 0.85)",
  },
  colNum: {
    width: 22,
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  colFixed: {
    flexShrink: 0,
  },
  colLastPress: {
    width: 52,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  colLastTappable: {
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
    backgroundColor: "rgba(10, 10, 12, 0.45)",
  },
  colLast: {
    color: AUTH.muted,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 13,
  },
  colLastHistory: {
    color: AUTH.steel,
  },
  colLastCopyHint: {
    color: AUTH.gold,
  },
  colLastDone: {
    opacity: 0.55,
    textDecorationLine: "line-through",
  },
  colReps: {
    flex: 1,
    minWidth: 0,
  },
  colKg: {
    flex: 1,
    minWidth: 0,
  },
  setInputDone: {
    borderColor: "rgba(163, 163, 163, 0.45)",
    backgroundColor: "rgba(24, 24, 27, 0.92)",
    color: AUTH.muted,
    textDecorationLine: "line-through",
  },
  checkBtn: {},
  checkBtnActive: {
    borderColor: "rgba(212, 175, 55, 0.7)",
    backgroundColor: "rgba(48, 44, 28, 0.75)",
  },
  checkBtnPending: {
    borderColor: "rgba(163, 163, 163, 0.5)",
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
  checkBtnOn: {
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: "rgba(35, 32, 22, 0.92)",
  },
  pressed: {
    opacity: 0.88,
  },
});

export { PERFORM_SET_TYPE_COL_WIDTH };
