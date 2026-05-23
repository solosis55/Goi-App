import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { WORKOUT_SET_FIELD_MAX_LEN } from "../../../constants/workoutFormLimits";
import { workoutSetTypePerformStyle } from "../../../constants/workoutSetTypes";
import type { PerformSetAntColumn } from "../../../utils/performSetAnt";
import type { PerformSetSubStep } from "../../../types/workoutSessionPerform";
import {
  PERFORM_SUB_STEPS_MAX,
  createEmptySubStep,
} from "../../../utils/performSetExtras";

type PerformSetSubStepStripProps = {
  setType: string;
  steps: PerformSetSubStep[];
  disabled?: boolean;
  done?: boolean;
  repsLabel: string;
  stepLabel: (subIndex: number) => string;
  addLabel: string;
  getAntColumn: (subIndex: number) => PerformSetAntColumn;
  onCopyAnt: (subIndex: number, copy: { reps: string; weight: string }) => void;
  onChangeSteps: (steps: PerformSetSubStep[]) => void;
};

/** Subseries extra (2.ª bajada, 2.ª pausa…) compactas y alineadas a la derecha. */
export function PerformSetSubStepStrip({
  setType,
  steps,
  disabled,
  done,
  repsLabel,
  stepLabel,
  addLabel,
  getAntColumn,
  onCopyAnt,
  onChangeSteps,
}: PerformSetSubStepStripProps) {
  const accent = workoutSetTypePerformStyle(setType);

  const patchStep = (index: number, patch: Partial<PerformSetSubStep>) => {
    onChangeSteps(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  };

  const removeStep = (index: number) => {
    onChangeSteps(steps.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (steps.length >= PERFORM_SUB_STEPS_MAX) return;
    onChangeSteps([...steps, createEmptySubStep()]);
  };

  if (steps.length === 0 && (disabled || done)) return null;

  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => {
        const ant = getAntColumn(index);
        const antCopyable = Boolean(ant.copy) && !done && !disabled;

        return (
          <View
            key={`sub-${index}`}
            style={[styles.subRow, { borderColor: `${accent.color}33` }]}
          >
            <Text style={[styles.subTag, { color: accent.color }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {stepLabel(index)}
            </Text>

            <Pressable
              onPress={antCopyable ? () => ant.copy && onCopyAnt(index, ant.copy) : undefined}
              disabled={disabled || done || !antCopyable}
              style={({ pressed }) => [
                styles.colAnt,
                antCopyable ? styles.colAntTappable : null,
                pressed && antCopyable ? styles.pressed : null,
              ]}
              accessibilityRole={antCopyable ? "button" : "text"}
              accessibilityLabel={
                antCopyable ? `Copiar última referencia: ${ant.line}` : `Última referencia: ${ant.line}`
              }
              accessibilityHint={antCopyable ? "Rellena reps y peso de esta bajada" : undefined}
            >
              <Text style={styles.colAntLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Últ.
              </Text>
              <Text
                style={[
                  styles.colAntValue,
                  ant.fromHistory ? styles.colAntHistory : null,
                  antCopyable ? styles.colAntCopyHint : null,
                ]}
                numberOfLines={2}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {ant.line}
              </Text>
            </Pressable>

            <View style={styles.subField}>
              <Text style={styles.subFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Kg
              </Text>
              <TextInput
                value={step.weight}
                onChangeText={(t) => patchStep(index, { weight: t.slice(0, WORKOUT_SET_FIELD_MAX_LEN) })}
                placeholder="—"
                placeholderTextColor={AUTH.faint}
                style={[styles.subInput, done ? styles.subInputDone : null]}
                editable={!disabled && !done}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.subField}>
              <Text style={styles.subFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {repsLabel}
              </Text>
              <TextInput
                value={step.reps}
                onChangeText={(t) => patchStep(index, { reps: t.slice(0, WORKOUT_SET_FIELD_MAX_LEN) })}
                placeholder="—"
                placeholderTextColor={AUTH.faint}
                style={[styles.subInput, done ? styles.subInputDone : null]}
                editable={!disabled && !done}
                keyboardType="number-pad"
              />
            </View>
            <Pressable
              onPress={() => removeStep(index)}
              disabled={disabled || done}
              hitSlop={6}
              style={({ pressed }) => [styles.removeBtn, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${stepLabel(index)}`}
            >
              <Text style={styles.removeText}>−</Text>
            </Pressable>
          </View>
        );
      })}
      {!disabled && !done && steps.length < PERFORM_SUB_STEPS_MAX ? (
        <Pressable
          onPress={addStep}
          style={({ pressed }) => [styles.addBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
        >
          <Text style={[styles.addText, { color: accent.color }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            + {addLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    alignItems: "flex-end",
    paddingRight: 2,
    paddingBottom: 4,
    gap: 4,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "96%",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  subTag: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
    minWidth: 24,
    textAlign: "right",
  },
  colAnt: {
    width: 44,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 2,
  },
  colAntTappable: {
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
    backgroundColor: "rgba(10, 10, 12, 0.45)",
  },
  colAntLabel: {
    color: AUTH.faint,
    fontSize: 7,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  colAntValue: {
    color: AUTH.muted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 11,
  },
  colAntHistory: {
    color: AUTH.steel,
  },
  colAntCopyHint: {
    color: AUTH.gold,
  },
  subField: {
    width: 48,
    gap: 2,
  },
  subFieldLabel: {
    color: AUTH.faint,
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  subInput: {
    minHeight: 32,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    color: AUTH.neutral100,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(10, 10, 12, 0.65)",
  },
  subInputDone: {
    opacity: 0.6,
  },
  removeBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: AUTH.danger,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  addBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  addText: {
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
