import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { workoutSetTypePerformStyle } from "../../../constants/workoutSetTypes";
import { workoutScreenStyles } from "../../../constants/workoutScreenUi";
import { usePerformSetCountdown } from "../../../hooks/usePerformSetCountdown";
import type { SessionPerformSet } from "../../../types/workoutSessionPerform";
import { formatWorkoutCountdown, parseWorkDurationSec } from "../../../utils/workoutCountdownFormat";
import { workoutHapticLight, workoutHapticSuccess } from "../../../utils/workoutHaptics";
import { WorkoutTimerPlayIcon, WorkoutTimerStopIcon } from "../WorkoutPerformIcons";
import { performSetCardStyles as s } from "./performSetCardStyles";

type PerformSetTimedExtraProps = {
  row: SessionPerformSet;
  disabled?: boolean;
  done?: boolean;
  onPatchSet: (patch: Partial<SessionPerformSet>) => void;
};

export function PerformSetTimedExtra({ row, disabled, done, onPatchSet }: PerformSetTimedExtraProps) {
  const slug = row.planned.setType;
  const accent = workoutSetTypePerformStyle(slug);
  const typeLabel = slug === "amrap" ? "AMRAP" : "Tempo";
  const durationSec = parseWorkDurationSec(row.workDurationSec);

  const countdown = usePerformSetCountdown({
    onComplete: () => {
      workoutHapticSuccess();
    },
  });

  const resetRef = useRef(countdown.reset);
  resetRef.current = countdown.reset;

  useEffect(() => {
    if (done || disabled) resetRef.current();
  }, [done, disabled]);

  useEffect(() => {
    return () => resetRef.current();
  }, []);

  const handleToggleTimer = useCallback(() => {
    if (disabled || done) return;
    if (countdown.running) {
      const elapsed = countdown.stopEarly();
      if (elapsed != null && elapsed > 0) {
        onPatchSet({ workDurationSec: String(elapsed) });
      }
      return;
    }
    if (durationSec <= 0) return;
    workoutHapticLight();
    countdown.start(durationSec);
  }, [disabled, done, durationSec, countdown.running, countdown.start, countdown.stopEarly, onPatchSet]);

  const canStart = durationSec > 0 && !disabled && !done;
  const showCountdown = countdown.running;

  return (
    <View style={[styles.wrap, { borderLeftColor: accent.color }, done ? styles.wrapDone : null]}>
      <Text style={s.metaLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Tiempo · {typeLabel}
      </Text>
      <TextInput
        value={row.workDurationSec ?? ""}
        onChangeText={(t) => onPatchSet({ workDurationSec: t.replace(/\D/g, "").slice(0, 4) })}
        placeholder="60"
        placeholderTextColor={AUTH.faint}
        keyboardType="number-pad"
        style={[
          workoutScreenStyles.setInputField,
          styles.input,
          done ? styles.inputDone : null,
          showCountdown ? styles.inputRunning : null,
        ]}
        editable={!disabled && !done && !showCountdown}
        accessibilityLabel={`Duración ${typeLabel} en segundos`}
      />
      <Text style={s.metaSuffix} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        s
      </Text>

      {showCountdown ? (
        <Text
          style={[styles.countdown, { color: accent.color }]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          accessibilityLiveRegion="polite"
        >
          {formatWorkoutCountdown(countdown.secondsLeft)}
        </Text>
      ) : null}

      <Pressable
        onPress={handleToggleTimer}
        disabled={!canStart && !showCountdown}
        style={({ pressed }) => [
          styles.timerBtn,
          showCountdown ? styles.timerBtnActive : null,
          !canStart && !showCountdown ? styles.timerBtnDisabled : null,
          pressed && (canStart || showCountdown) ? styles.pressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          showCountdown
            ? `Detener cronómetro de ${typeLabel}`
            : durationSec > 0
              ? `Iniciar cronómetro de ${durationSec} segundos`
              : "Indica los segundos antes de iniciar"
        }
      >
        {showCountdown ? (
          <WorkoutTimerStopIcon size={14} color={accent.color} />
        ) : (
          <WorkoutTimerPlayIcon size={16} color={canStart ? accent.color : AUTH.faint} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -2,
    marginBottom: 6,
    marginLeft: 28,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderLeftWidth: 2,
    borderRadius: 8,
    backgroundColor: "rgba(10, 10, 12, 0.45)",
  },
  wrapDone: {
    opacity: 0.7,
  },
  input: {
    flex: 0,
    width: 72,
    minHeight: 40,
  },
  inputRunning: {
    opacity: 0.75,
  },
  inputDone: {
    opacity: 0.65,
  },
  countdown: {
    fontSize: 15,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    minWidth: 40,
    textAlign: "center",
  },
  timerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  timerBtnActive: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  timerBtnDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
