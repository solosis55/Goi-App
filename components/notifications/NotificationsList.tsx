import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { getNotifications, markNotificationsRead } from "../../api/posts";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedNotification } from "../../types/post";
import { formatPostRelative } from "../../utils/feedPostDate";
import { getErrorMessage } from "../../utils/errorMessages";
import { notificationLine } from "../../utils/notificationCopy";
import { UserAvatar } from "../ui/UserAvatar";

type NotificationsListProps = {
  /** Al abrir (p. ej. sheet desde el feed): marca todas como leídas. */
  markAllReadOnLoad?: boolean;
  onOpenActor: (userId: string) => void;
  onOpenPost?: (postId: string) => void;
  onUnreadChange?: (count: number) => void;
  listPaddingHorizontal?: number;
};

export function NotificationsList({
  markAllReadOnLoad = false,
  onOpenActor,
  onOpenPost,
  onUnreadChange,
  listPaddingHorizontal = 16,
}: NotificationsListProps) {
  const [items, setItems] = useState<FeedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const res = await getNotifications();
        let list = res.notifications ?? [];
        if (markAllReadOnLoad) {
          const unreadIds = list.filter((n) => !n.read).map((n) => n.id);
          if (unreadIds.length > 0) {
            await markNotificationsRead(unreadIds);
            list = list.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n));
          }
          onUnreadChange?.(0);
        } else {
          onUnreadChange?.(res.unreadCount ?? 0);
        }
        setItems(list);
      } catch (e) {
        setError(getErrorMessage(e, "No se pudieron cargar las notificaciones."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [markAllReadOnLoad, onUnreadChange]
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const onRowPress = useCallback(
    async (n: FeedNotification) => {
      if (!n.read) {
        try {
          await markNotificationsRead([n.id]);
          setItems((prev) => {
            const next = prev.map((x) => (x.id === n.id ? { ...x, read: true } : x));
            onUnreadChange?.(next.filter((x) => !x.read).length);
            return next;
          });
        } catch {
          /* ignore */
        }
      }
      if (n.postId && onOpenPost) onOpenPost(n.postId);
      else onOpenActor(n.actorUserId);
    },
    [onOpenActor, onOpenPost, onUnreadChange]
  );

  const renderItem: ListRenderItem<FeedNotification> = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => void onRowPress(item)}
        style={({ pressed }) => [
          styles.row,
          { paddingHorizontal: listPaddingHorizontal },
          !item.read ? styles.rowUnread : null,
          pressed ? styles.rowPressed : null,
        ]}
        accessibilityRole="button"
      >
        <UserAvatar src={item.actorAvatarUrl} username={item.actorUsername} size={44} />
        <View style={styles.rowBody}>
          <Text style={styles.rowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            <Text style={styles.rowUser}>{item.actorUsername}</Text> {notificationLine(item)}
          </Text>
          <Text style={styles.rowTime} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {formatPostRelative(item.createdAt)}
          </Text>
        </View>
      </Pressable>
    ),
    [listPaddingHorizontal, onRowPress]
  );

  if (loading && items.length === 0) {
    return <ActivityIndicator color={AUTH.gold} style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={[styles.errorWrap, { paddingHorizontal: listPaddingHorizontal }]}>
        <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {error}
        </Text>
        <Pressable onPress={() => void load("initial")} style={styles.retry}>
          <Text style={styles.retryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(n) => n.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void load("refresh")}
          tintColor={AUTH.gold}
          colors={[AUTH.gold]}
        />
      }
      ListEmptyComponent={
        <Text
          style={[styles.empty, { paddingHorizontal: listPaddingHorizontal }]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          Aún no tienes notificaciones.
        </Text>
      }
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 40,
  },
  errorWrap: {
    paddingTop: 24,
    gap: 8,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
  },
  retry: {
    alignSelf: "flex-start",
  },
  retryText: {
    color: AUTH.gold,
    fontWeight: "600",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  empty: {
    color: AUTH.muted,
    textAlign: "center",
    paddingVertical: 48,
    fontSize: 14,
    lineHeight: 20,
  },
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
