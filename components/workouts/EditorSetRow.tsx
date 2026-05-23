import { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { WORKOUT_SET_FIELD_MAX_LEN } from "../../constants/workoutFormLimits";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import { workoutSetTypeLabel } from "../../constants/workoutSetTypes";
import type { WorkoutSetRow } from "../../types/workout";
import { WorkoutSetTypeIcon } from "./WorkoutSetTypeIcon";

function shortSetTypeLabel(slug: string): string {
  const label = workoutSetTypeLabel(slug);
  const first = label.split(/\s+/)[0];
  return first && first.length <= 10 ? first : label.slice(0, 8);
}

export type EditorSetRowHandle = {
  focusReps: () => void;
};

type EditorSetRowProps = {
  setIndex: number;
  set: WorkoutSetRow;
  disabled?: boolean;
  canRemove: boolean;
  onPatch: (patch: Partial<WorkoutSetRow>) => void;
  onOpenTypePicker: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onFocusKg: () => void;
  onFocusNextRow: () => void;
  registerRepsRef: (ref: TextInput | null) => void;
  registerKgRef: (ref: TextInput | null) => void;
};

export function EditorSetRow({
  setIndex,
  set,
  disabled,
  canRemove,
  onPatch,
  onOpenTypePicker,
  onRemove,
  onDuplicate,
  onFocusKg,
  onFocusNextRow,
  registerRepsRef,
  registerKgRef,
}: EditorSetRowProps) {
  const repsRef = useRef<TextInput>(null);
  const kgRef = useRef<TextInput>(null);

  return (
    <Pressable
      onLongPress={disabled ? undefined : onDuplicate}
      delayLongPress={400}
      style={[styles.setRow, setIndex % 2 === 1 ? workoutScreenStyles.setRowAlt : null]}
    >
      <Text style={styles.setNum} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {setIndex + 1}
      </Text>
      <TextInput
        ref={(r) => {
          repsRef.current = r;
          registerRepsRef(r);
        }}
        value={set.reps}
        onChangeText={(v) => onPatch({ reps: v.slice(0, WORKOUT_SET_FIELD_MAX_LEN) })}
        placeholder="8"
        placeholderTextColor={AUTH.faint}
        style={[workoutScreenStyles.setInputField, styles.colReps]}
        editable={!disabled}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => {
          onFocusKg();
          kgRef.current?.focus();
        }}
      />
      <TextInput
        ref={(r) => {
          kgRef.current = r;
          registerKgRef(r);
        }}
        value={set.weight}
        onChangeText={(v) => onPatch({ weight: v.slice(0, WORKOUT_SET_FIELD_MAX_LEN) })}
        placeholder="—"
        placeholderTextColor={AUTH.faint}
        keyboardType="decimal-pad"
        style={[workoutScreenStyles.setInputField, styles.colKg]}
        editable={!disabled}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={onFocusNextRow}
      />
      <Pressable
        onPress={onOpenTypePicker}
        disabled={disabled}
        style={({ pressed }) => [styles.typeCell, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`Tipo: ${workoutSetTypeLabel(set.setType)}`}
      >
        <WorkoutSetTypeIcon slug={set.setType} size="sm" />
        <Text style={styles.typeMiniLabel} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {shortSetTypeLabel(set.setType)}
        </Text>
      </Pressable>
      <Pressable
        onPress={onRemove}
        disabled={disabled || !canRemove}
        style={styles.colDel}
        hitSlop={6}
      >
        <Text style={[styles.removeSet, !canRemove ? styles.muted : null]}>−</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  setNum: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    width: 22,
    textAlign: "center",
  },
  colReps: {
    flex: 1,
  },
  colKg: {
    flex: 1,
  },
  typeCell: {
    width: 64,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
    backgroundColor: WORKOUT_UI.chipBg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 2,
  },
  typeMiniLabel: {
    color: AUTH.faint,
    fontSize: 9,
    fontWeight: "600",
    maxWidth: 58,
    textAlign: "center",
  },
  colDel: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeSet: {
    color: AUTH.danger,
    fontSize: 20,
    fontWeight: "700",
  },
  muted: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.88,
  },
});
