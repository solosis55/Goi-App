import { useCallback } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { NotificationsList } from "../notifications/NotificationsList";
import { GoiGoldFadeLine } from "../ui/GoiGoldFadeLine";

type FeedNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
  onOpenActor?: (userId: string) => void;
  onOpenPost?: (postId: string) => void;
};

export function FeedNotificationsSheet({
  visible,
  onClose,
  onUnreadChange,
  onOpenActor,
  onOpenPost,
}: FeedNotificationsSheetProps) {
  const insets = useSafeAreaInsets();

  const handleOpenActor = useCallback(
    (userId: string) => {
      onClose();
      onOpenActor?.(userId);
    },
    [onClose, onOpenActor]
  );

  const handleOpenPost = useCallback(
    (postId: string) => {
      onClose();
      onOpenPost?.(postId);
    },
    [onClose, onOpenPost]
  );

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar notificaciones" />
        <View
          style={[
            styles.sheet,
            { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <GoiGoldFadeLine style={styles.sheetGoldLine} />
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Notificaciones
            </Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cerrar">
              <Text style={styles.close} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cerrar
              </Text>
            </Pressable>
          </View>
          <View style={styles.listWrap}>
            <NotificationsList
              markAllReadOnLoad
              onOpenActor={handleOpenActor}
              onOpenPost={onOpenPost ? handleOpenPost : undefined}
              onUnreadChange={onUnreadChange}
              listPaddingHorizontal={18}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    maxHeight: "88%",
    minHeight: "50%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "rgba(10, 10, 12, 0.98)",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
  },
  sheetGoldLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(82, 82, 82, 0.8)",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  close: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  listWrap: {
    flex: 1,
    minHeight: 200,
  },
});
