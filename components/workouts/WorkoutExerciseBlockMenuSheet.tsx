import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

export type WorkoutBlockMenuAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type WorkoutExerciseBlockMenuSheetProps = {
  visible: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDuplicate?: boolean;
  canDuplicateSet?: boolean;
  topActions?: WorkoutBlockMenuAction[];
  onClose: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate?: () => void;
  onDuplicateLastSet?: () => void;
  onRemove: () => void;
};

export function WorkoutExerciseBlockMenuSheet({
  visible,
  canMoveUp,
  canMoveDown,
  canDuplicate = true,
  canDuplicateSet = true,
  topActions,
  onClose,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDuplicateLastSet,
  onRemove,
}: WorkoutExerciseBlockMenuSheetProps) {
  const insets = useSafeAreaInsets();

  const run = (fn?: () => void) => {
    if (!fn) return;
    onClose();
    fn();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar menú" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <View style={styles.handle} />
        {topActions?.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => run(action.onPress)}
            disabled={action.disabled}
            style={({ pressed }) => [
              styles.row,
              action.disabled ? styles.rowDisabled : null,
              pressed && !action.disabled ? styles.rowPressed : null,
            ]}
          >
            <Text
              style={[styles.rowText, action.disabled ? styles.rowTextDisabled : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
        {topActions && topActions.length > 0 ? <View style={styles.divider} /> : null}
        {canDuplicateSet ? (
          <Pressable
            onPress={() => run(onDuplicateLastSet)}
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
          >
            <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Duplicar última serie
            </Text>
          </Pressable>
        ) : null}
        {canDuplicate ? (
          <Pressable
            onPress={() => run(onDuplicate)}
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
          >
            <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Duplicar ejercicio
            </Text>
          </Pressable>
        ) : null}
        {canDuplicate || canDuplicateSet ? <View style={styles.divider} /> : null}
        <Pressable
          onPress={() => {
            if (!canMoveUp) return;
            onClose();
            onMoveUp();
          }}
          disabled={!canMoveUp}
          style={({ pressed }) => [
            styles.row,
            !canMoveUp ? styles.rowDisabled : null,
            pressed && canMoveUp ? styles.rowPressed : null,
          ]}
        >
          <Text style={[styles.rowText, !canMoveUp ? styles.rowTextDisabled : null]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Subir ejercicio
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (!canMoveDown) return;
            onClose();
            onMoveDown();
          }}
          disabled={!canMoveDown}
          style={({ pressed }) => [
            styles.row,
            !canMoveDown ? styles.rowDisabled : null,
            pressed && canMoveDown ? styles.rowPressed : null,
          ]}
        >
          <Text
            style={[styles.rowText, !canMoveDown ? styles.rowTextDisabled : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            Bajar ejercicio
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onClose();
            onRemove();
          }}
          style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
        >
          <Text style={styles.rowDanger} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Quitar ejercicio
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: AUTH.cardBg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderColor: AUTH.cardBorder,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(82, 82, 82, 0.9)",
    marginBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AUTH.cardBorder,
    marginVertical: 4,
    marginHorizontal: 12,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  rowText: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  rowTextDisabled: {
    color: AUTH.muted,
  },
  rowDanger: {
    color: AUTH.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});
