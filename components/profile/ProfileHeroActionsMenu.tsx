import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ProfileHeroActionsMenuProps = {
  visible: boolean;
  onClose: () => void;
  onPreview?: () => void;
  onShare?: () => void;
  onChangeBanner?: () => void;
  bannerDisabled?: boolean;
};

export function ProfileHeroActionsMenu({
  visible,
  onClose,
  onPreview,
  onShare,
  onChangeBanner,
  bannerDisabled,
}: ProfileHeroActionsMenuProps) {
  const items: { label: string; onPress?: () => void; disabled?: boolean }[] = [];
  if (onPreview) items.push({ label: "Vista previa", onPress: onPreview });
  if (onShare) items.push({ label: "Compartir perfil", onPress: onShare });
  if (onChangeBanner) items.push({ label: "Cambiar cabecera", onPress: onChangeBanner, disabled: bannerDisabled });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar menú">
        <View style={styles.sheet}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              disabled={item.disabled}
              onPress={() => {
                onClose();
                item.onPress?.();
              }}
              style={({ pressed }) => [
                styles.row,
                item.disabled ? styles.rowDisabled : null,
                pressed ? styles.rowPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed ? styles.rowPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
          >
            <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 28,
  },
  sheet: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(18, 18, 20, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  rowText: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancel: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  cancelText: {
    color: AUTH.muted,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
