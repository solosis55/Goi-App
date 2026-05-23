import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutRowMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
};

export function WorkoutRowMenuSheet({
  visible,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: WorkoutRowMenuSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar menú" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <View style={styles.handle} />
        <Pressable
          onPress={() => {
            onClose();
            onEdit();
          }}
          style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
        >
          <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Editar rutina
          </Text>
        </Pressable>
        {onDuplicate ? (
          <Pressable
            onPress={() => {
              onClose();
              onDuplicate();
            }}
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
          >
            <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Duplicar rutina
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            onClose();
            onDelete();
          }}
          style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
        >
          <Text style={styles.rowDanger} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Eliminar
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
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  rowText: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  rowDanger: {
    color: AUTH.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});
