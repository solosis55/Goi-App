import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import { WorkoutBellOffIcon, WorkoutBellOnIcon } from "./WorkoutPerformIcons";

type WorkoutRestTimerBarProps = {
  secondsLeft: number;
  totalSeconds: number;
  progress: number;
  exerciseLabel?: string | null;
  onSkip: () => void;
  onSub15: () => void;
  onAdd15: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
};

function formatRest(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export function WorkoutRestTimerBar({
  secondsLeft,
  totalSeconds,
  progress,
  exerciseLabel,
  onSkip,
  onSub15,
  onAdd15,
  soundEnabled,
  onToggleSound,
}: WorkoutRestTimerBarProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (secondsLeft > 0 && secondsLeft <= 5) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 380, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 380, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: 120 });
    }
  }, [secondsLeft, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (secondsLeft <= 0) return null;

  const pctRemaining = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const urgent = secondsLeft <= 5;
  const canSub15 = secondsLeft > 0;

  return (
    <View style={[styles.wrap, urgent ? styles.wrapUrgent : null]}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${pctRemaining}%` },
            urgent ? styles.progressUrgent : null,
            pulseStyle,
          ]}
        />
      </View>
      <View style={workoutScreenStyles.cardGlowLine} />
      <View style={styles.row}>
        <View style={styles.timeCol}>
          <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Descanso
          </Text>
          {exerciseLabel ? (
            <Text style={styles.exercise} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {exerciseLabel}
            </Text>
          ) : null}
        </View>
        <Text
          style={[styles.time, urgent ? styles.timeUrgent : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          accessibilityLiveRegion="polite"
        >
          {formatRest(secondsLeft)}
        </Text>
        {onToggleSound ? (
          <Pressable
            onPress={onToggleSound}
            style={({ pressed }) => [
              styles.iconChip,
              soundEnabled ? styles.iconChipOn : null,
              pressed ? workoutScreenStyles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={soundEnabled ? "Desactivar tono al terminar" : "Activar tono al terminar"}
          >
            {soundEnabled ? <WorkoutBellOnIcon size={17} /> : <WorkoutBellOffIcon size={17} />}
          </Pressable>
        ) : null}
        <Pressable
          onPress={onSub15}
          disabled={!canSub15}
          style={({ pressed }) => [
            styles.chip,
            !canSub15 ? styles.chipDisabled : null,
            pressed ? workoutScreenStyles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Quitar 15 segundos de descanso"
        >
          <Text style={[styles.chipText, !canSub15 ? styles.chipTextDisabled : null]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            −15s
          </Text>
        </Pressable>
        <Pressable
          onPress={onAdd15}
          style={({ pressed }) => [styles.chip, pressed ? workoutScreenStyles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Añadir 15 segundos de descanso"
        >
          <Text style={styles.chipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            +15s
          </Text>
        </Pressable>
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [styles.chip, styles.chipPrimary, pressed ? workoutScreenStyles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Saltar descanso"
        >
          <Text style={[styles.chipText, styles.chipTextPrimary]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Saltar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: AUTH.cardBg,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.35)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 12,
  },
  wrapUrgent: {
    borderTopColor: "rgba(251, 191, 36, 0.55)",
    backgroundColor: "rgba(48, 40, 22, 0.92)",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(64, 64, 64, 0.55)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(212, 175, 55, 0.85)",
  },
  progressUrgent: {
    backgroundColor: "#fbbf24",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  timeCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  exercise: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipDisabled: {
    opacity: 0.38,
  },
  chipTextDisabled: {
    color: AUTH.faint,
  },
  label: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  time: {
    color: AUTH.gold,
    fontSize: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    minWidth: 72,
    textAlign: "right",
  },
  timeUrgent: {
    color: "#fbbf24",
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChipOn: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.65)",
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    justifyContent: "center",
  },
  chipPrimary: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.72)",
  },
  chipText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextPrimary: {
    color: AUTH.gold,
    fontWeight: "700",
  },
});
