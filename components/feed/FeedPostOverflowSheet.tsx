import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedPostOverflowSheetProps = {
  visible: boolean;
  authorUsername: string;
  onClose: () => void;
  onMuteAuthor: () => void;
  onReport?: () => void;
  onShare?: () => void;
};

export function FeedPostOverflowSheet({
  visible,
  authorUsername,
  onClose,
  onMuteAuthor,
  onReport,
  onShare,
}: FeedPostOverflowSheetProps) {
  const insets = useSafeAreaInsets();

  const row = (label: string, onPress: () => void, destructive?: boolean) => (
    <Pressable
      key={label}
      onPress={() => {
        onClose();
        onPress();
      }}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[styles.rowText, destructive ? styles.rowDestructive : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar menú" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.handle} />
        {onShare ? row("Compartir publicación", onShare) : null}
        {onReport ? row("Reportar publicación", onReport) : null}
        {row(`Silenciar @${authorUsername}`, onMuteAuthor, true)}
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
  rowDestructive: {
    color: AUTH.danger,
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
