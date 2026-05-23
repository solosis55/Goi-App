import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../../constants/authUi";
import {
  formatRestDuration,
  restDurationToParts,
  WORKOUT_REST_MAX_SEC,
  WORKOUT_REST_MIN_SEC,
  WORKOUT_REST_NONE_SEC,
  WORKOUT_REST_PRESETS_SEC,
} from "../../constants/workoutRest";
import { workoutScreenStyles, WORKOUT_UI } from "../../constants/workoutScreenUi";
import { WorkoutRestDurationScrollPicker } from "./WorkoutRestDurationScrollPicker";

type WorkoutBlockRestPickerProps = {
  selectedSec: number;
  onSelect: (seconds: number) => void;
  disabled?: boolean;
  /** Sin botón visible; abrir con `open` / `onOpenChange`. */
  triggerless?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function WorkoutBlockRestPicker({
  selectedSec,
  onSelect,
  disabled,
  triggerless,
  open: openControlled,
  onOpenChange,
}: WorkoutBlockRestPickerProps) {
  const insets = useSafeAreaInsets();
  const [openInternal, setOpenInternal] = useState(false);
  const open = openControlled ?? openInternal;
  const setOpen = (next: boolean) => {
    if (openControlled === undefined) setOpenInternal(next);
    onOpenChange?.(next);
  };
  const maxMinutes = Math.floor(WORKOUT_REST_MAX_SEC / 60);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!open) return;
    const parts = restDurationToParts(selectedSec);
    setMinutes(Math.min(maxMinutes, parseInt(parts.minutes, 10) || 0));
    setSeconds(Math.min(59, parseInt(parts.seconds, 10) || 0));
  }, [open, selectedSec, maxMinutes]);

  const saveTimed = () => {
    const total = minutes * 60 + seconds;
    const next =
      total < WORKOUT_REST_MIN_SEC
        ? WORKOUT_REST_MIN_SEC
        : Math.min(WORKOUT_REST_MAX_SEC, total);
    onSelect(next);
    setOpen(false);
  };

  const selectFree = () => {
    onSelect(WORKOUT_REST_NONE_SEC);
    setOpen(false);
  };

  return (
    <>
      {!triggerless ? (
        <Pressable
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.trigger,
            disabled ? styles.triggerDisabled : null,
            pressed ? workoutScreenStyles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Descanso entre series: ${formatRestDuration(selectedSec)}. Pulsa para cambiar.`}
        >
          <Text style={styles.triggerLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Descanso
          </Text>
          <Text
            style={[styles.triggerValue, selectedSec === WORKOUT_REST_NONE_SEC ? styles.triggerValueFree : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {formatRestDuration(selectedSec)}
          </Text>
        </Pressable>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <GestureHandlerRootView style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={workoutScreenStyles.cardGlowLine} />
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Descanso entre series
          </Text>
          <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Elige temporizador o descanso libre sin cuenta atrás.
          </Text>

          <Pressable
            onPress={selectFree}
            style={({ pressed }) => [
              styles.freeOption,
              selectedSec === WORKOUT_REST_NONE_SEC ? styles.freeOptionActive : null,
              pressed ? workoutScreenStyles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sin descanso programado, libre"
          >
            <Text style={styles.freeOptionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Libre
            </Text>
            <Text style={styles.freeOptionSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Sin temporizador al marcar una serie
            </Text>
          </Pressable>

          <Text style={styles.sectionLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Temporizador · entre {WORKOUT_REST_MIN_SEC}s y {Math.floor(WORKOUT_REST_MAX_SEC / 60)} min
          </Text>

          <WorkoutRestDurationScrollPicker
            minutes={minutes}
            seconds={seconds}
            maxMinutes={maxMinutes}
            onChangeMinutes={setMinutes}
            onChangeSeconds={setSeconds}
          />

          <Text style={styles.presetsLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Atajos
          </Text>
          <View style={styles.presets}>
            {WORKOUT_REST_PRESETS_SEC.map((sec) => (
              <Pressable
                key={sec}
                onPress={() => {
                  const p = restDurationToParts(sec);
                  setMinutes(parseInt(p.minutes, 10) || 0);
                  setSeconds(parseInt(p.seconds, 10) || 0);
                }}
                style={({ pressed }) => [styles.presetChip, pressed ? workoutScreenStyles.pressed : null]}
              >
                <Text style={styles.presetText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {formatRestDuration(sec)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => setOpen(false)}
              style={({ pressed }) => [styles.cancelBtn, pressed ? workoutScreenStyles.pressed : null]}
            >
              <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={saveTimed}
              style={({ pressed }) => [styles.saveBtn, pressed ? workoutScreenStyles.pressed : null]}
            >
              <Text style={styles.saveText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Guardar
              </Text>
            </Pressable>
          </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
  triggerDisabled: {
    opacity: 0.45,
  },
  triggerLabel: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  triggerValue: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  triggerValueFree: {
    color: AUTH.muted,
    fontStyle: "italic",
  },
  freeOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
    marginBottom: 14,
    gap: 2,
  },
  freeOptionActive: {
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: WORKOUT_UI.chipBgActive,
  },
  freeOptionTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
  },
  freeOptionSub: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionLabel: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: AUTH.cardBg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderColor: AUTH.cardBorder,
    paddingHorizontal: AUTH_PAD,
    paddingTop: 20,
  },
  title: authScreenStyles.cardTitle,
  sub: {
    ...authScreenStyles.cardSubtitle,
    marginBottom: 16,
  },
  presetsLabel: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: WORKOUT_UI.chipBg,
  },
  presetText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    ...workoutScreenStyles.outlineBtn,
    paddingVertical: 13,
  },
  cancelText: workoutScreenStyles.outlineBtnText,
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: "rgba(35, 32, 22, 0.96)",
    alignItems: "center",
  },
  saveText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "700",
  },
});
