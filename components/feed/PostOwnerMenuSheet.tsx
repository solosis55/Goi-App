import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type PostOwnerMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  isPinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
};

export function PostOwnerMenuSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
  isPinned,
  onPin,
  onUnpin,
}: PostOwnerMenuSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar menú" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.handle} />
        {onEdit ? (
          <Pressable
            onPress={() => {
              onClose();
              onEdit();
            }}
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Editar publicación"
          >
            <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Editar
            </Text>
          </Pressable>
        ) : null}
        {isPinned && onUnpin ? (
          <Pressable
            onPress={() => {
              onClose();
              onUnpin();
            }}
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Quitar publicación destacada"
          >
            <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Quitar destacado
            </Text>
          </Pressable>
        ) : null}
        {!isPinned && onPin ? (
          <Pressable
            onPress={() => {
              onClose();
              onPin();
            }}
            style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Destacar publicación en el perfil"
          >
            <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Destacar en perfil
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            onClose();
            onDelete();
          }}
          style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Eliminar publicación"
        >
          <Text style={styles.rowDanger} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Eliminar
          </Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.cancel} accessibilityRole="button" accessibilityLabel="Cancelar">
          <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cancelar
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "rgba(14, 14, 16, 0.98)",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(82, 82, 82, 0.65)",
    paddingTop: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.8)",
    marginBottom: 8,
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  rowPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  rowText: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
  },
  rowDanger: {
    color: AUTH.danger,
    fontSize: 17,
    fontWeight: "600",
  },
  cancel: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: AUTH.muted,
    fontSize: 16,
    fontWeight: "600",
  },
});
