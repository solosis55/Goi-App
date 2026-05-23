import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutNotesSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  notes: string;
  maxLength: number;
  placeholder?: string;
  disabled?: boolean;
  onChangeNotes: (text: string) => void;
  onClose: () => void;
};

export function WorkoutNotesSheet({
  visible,
  title,
  subtitle,
  notes,
  maxLength,
  placeholder = "Escribe aquí…",
  disabled,
  onChangeNotes,
  onClose,
}: WorkoutNotesSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={workoutScreenStyles.fieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {notes.length}/{maxLength}
        </Text>
        <TextInput
          value={notes}
          onChangeText={(t) => onChangeNotes(t.slice(0, maxLength))}
          placeholder={placeholder}
          placeholderTextColor={AUTH.faint}
          multiline
          editable={!disabled}
          autoFocus
          style={[workoutScreenStyles.input, styles.input]}
        />
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [workoutScreenStyles.ghostBtn, styles.doneBtn, pressed ? workoutScreenStyles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Cerrar notas"
        >
          <Text style={workoutScreenStyles.ghostBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Listo
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    backgroundColor: AUTH.cardBg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AUTH.cardBorder,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  sub: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: "top",
    fontSize: 15,
  },
  doneBtn: {
    alignItems: "center",
    marginTop: 4,
  },
});
