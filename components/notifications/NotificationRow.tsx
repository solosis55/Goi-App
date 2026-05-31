import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedNotification } from "../../types/post";
import { formatPostRelative } from "../../utils/feedPostDate";
import { notificationLine } from "../../utils/notificationCopy";
import { UserAvatar } from "../ui/UserAvatar";

type NotificationRowProps = {
  notification: FeedNotification;
  paddingHorizontal: number;
  onPress: (notification: FeedNotification) => void;
};

function NotificationRowInner({ notification: n, paddingHorizontal, onPress }: NotificationRowProps) {
  return (
    <Pressable
      onPress={() => onPress(n)}
      style={({ pressed }) => [
        styles.row,
        { paddingHorizontal },
        !n.read ? styles.rowUnread : null,
        pressed ? styles.rowPressed : null,
      ]}
      accessibilityRole="button"
    >
      <UserAvatar src={n.actorAvatarUrl} username={n.actorUsername} size={44} />
      <View style={styles.rowBody}>
        <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          <Text style={styles.rowUser}>{n.actorUsername}</Text> {notificationLine(n)}
        </Text>
        <Text style={styles.rowTime} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {formatPostRelative(n.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

function notificationRowEqual(prev: NotificationRowProps, next: NotificationRowProps): boolean {
  return (
    prev.notification === next.notification &&
    prev.paddingHorizontal === next.paddingHorizontal &&
    prev.onPress === next.onPress
  );
}

export const NotificationRow = memo(NotificationRowInner, notificationRowEqual);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(38, 38, 38, 0.7)",
  },
  rowUnread: {
    backgroundColor: "rgba(35, 32, 22, 0.35)",
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowText: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  rowUser: {
    color: AUTH.neutral100,
    fontWeight: "600",
  },
  rowTime: {
    color: AUTH.faint,
    fontSize: 12,
  },
});
