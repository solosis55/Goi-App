import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { getFollowing, getPendingFollowRequests, toggleFollow } from "../../api/auth";
import { getNotifications, markNotificationsRead } from "../../api/posts";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import type { FeedNotification } from "../../types/post";
import { getErrorMessage } from "../../utils/errorMessages";
import {
  filterNotifications,
  NOTIFICATION_FILTER_OPTIONS,
  type NotificationFilter,
} from "../../utils/notificationFilters";
import { groupNotificationsByDay } from "../../utils/notificationDayGroups";
import { pickTodayFollowBackNotifications } from "../../utils/notificationFollowBack";
import { commentIdFromNotification } from "../../utils/notificationDeepLink";
import {
  applyNotificationPrefs,
  loadNotificationPrefs,
  type NotificationPrefs,
} from "../../utils/notificationPrefs";
import { useNotificationPrefsStore } from "../../stores/useNotificationPrefsStore";
import type { FollowRequestPreview } from "../../types/publicProfile";
import { SocialChipRow } from "../social/SocialChipRow";
import { SocialNotificationPrefsRow } from "../social/SocialNotificationPrefsRow";
import { FollowRequestsList } from "../social/FollowRequestsList";
import { UserAvatar } from "../ui/UserAvatar";
import { NotificationRow } from "./NotificationRow";

type NotificationsListProps = {
  markAllReadOnLoad?: boolean;
  onOpenActor: (userId: string) => void;
  onOpenPost?: (postId: string, commentId?: string) => void;
  onUnreadChange?: (count: number) => void;
  listPaddingHorizontal?: number;
};

type ListItem =
  | { kind: "sectionHeader"; key: string; title: string }
  | { kind: "followBack"; notifications: FeedNotification[] }
  | { kind: "pendingRequests"; requests: FollowRequestPreview[] }
  | { kind: "notification"; item: FeedNotification };

function NotificationFollowBackBanner({
  notifications,
  followingIds,
  paddingHorizontal,
  onOpenActor,
  onFollowingChanged,
}: {
  notifications: FeedNotification[];
  followingIds: string[];
  paddingHorizontal: number;
  onOpenActor: (userId: string) => void;
  onFollowingChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [localFollowing, setLocalFollowing] = useState<Set<string>>(() => new Set(followingIds));

  useEffect(() => {
    setLocalFollowing(new Set(followingIds));
  }, [followingIds]);

  if (notifications.length === 0) return null;

  return (
    <View style={[styles.followBackWrap, { paddingHorizontal }]}>
      <Text style={styles.followBackTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Te siguieron hoy — devuélveles el follow
      </Text>
      {notifications.map((n) => {
        const followed = localFollowing.has(n.actorUserId);
        return (
          <View key={n.id} style={styles.followBackRow}>
            <Pressable
              onPress={() => onOpenActor(n.actorUserId)}
              style={({ pressed }) => [styles.followBackMain, pressed ? styles.rowPressed : null]}
            >
              <UserAvatar src={n.actorAvatarUrl} username={n.actorUsername} size={40} />
              <Text style={styles.followBackUser} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{n.actorUsername}
              </Text>
            </Pressable>
            <Pressable
              disabled={followed || busyId === n.actorUserId}
              onPress={() => {
                if (followed || busyId === n.actorUserId) return;
                setLocalFollowing((prev) => new Set(prev).add(n.actorUserId));
                setBusyId(n.actorUserId);
                void toggleFollow(n.actorUserId)
                  .then(({ following }) => {
                    if (following) {
                      onFollowingChanged();
                    } else {
                      setLocalFollowing((prev) => {
                        const next = new Set(prev);
                        next.delete(n.actorUserId);
                        return next;
                      });
                    }
                  })
                  .catch(() => {
                    setLocalFollowing((prev) => {
                      const next = new Set(prev);
                      next.delete(n.actorUserId);
                      return next;
                    });
                  })
                  .finally(() => setBusyId(null));
              }}
              style={({ pressed }) => [styles.followBackBtn, pressed ? styles.rowPressed : null]}
            >
              <Text style={styles.followBackBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {followed ? "Siguiendo" : busyId === n.actorUserId ? "…" : "Seguir"}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export function NotificationsList({
  markAllReadOnLoad = false,
  onOpenActor,
  onOpenPost,
  onUnreadChange,
  listPaddingHorizontal = 16,
}: NotificationsListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<FeedNotification[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FollowRequestPreview[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const notifPrefs = useNotificationPrefsStore((s) => s.prefs);
  const applyRemotePrefs = useNotificationPrefsStore((s) => s.applyRemotePrefs);
  const setNotifPrefs = useNotificationPrefsStore((s) => s.setPrefs);
  const hydrateNotifPrefs = useNotificationPrefsStore((s) => s.hydrate);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefsFiltered = useMemo(
    () => applyNotificationPrefs(items, notifPrefs),
    [items, notifPrefs]
  );
  const filteredItems = useMemo(
    () => filterNotifications(prefsFiltered, filter),
    [prefsFiltered, filter]
  );
  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const todayFollowBack = useMemo(
    () => pickTodayFollowBackNotifications(filteredItems, followingIds, user?.id),
    [filteredItems, followingIds, user?.id]
  );

  const listItems = useMemo((): ListItem[] => {
    const out: ListItem[] = [];
    if (filter === "all" && pendingRequests.length > 0) {
      out.push({ kind: "sectionHeader", key: "pending-header", title: "Solicitudes" });
      out.push({ kind: "pendingRequests", requests: pendingRequests });
    }
    const groups = groupNotificationsByDay(filteredItems);
    for (const g of groups) {
      out.push({ kind: "sectionHeader", key: `${g.key}-header`, title: g.title });
      if (g.key === "today" && todayFollowBack.length > 0) {
        out.push({ kind: "followBack", notifications: todayFollowBack });
      }
      for (const item of g.items) {
        out.push({ kind: "notification", item });
      }
    }
    return out;
  }, [filteredItems, todayFollowBack, filter, pendingRequests]);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const [res, following, pending, prefs] = await Promise.all([
          getNotifications(),
          user?.id ? getFollowing(user.id) : Promise.resolve({ followingIds: [] as string[] }),
          user?.id ? getPendingFollowRequests() : Promise.resolve({ requests: [] }),
          loadNotificationPrefs(),
        ]);
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
        setFollowingIds(following.followingIds ?? []);
        setPendingRequests(pending.requests ?? []);
        applyRemotePrefs(prefs);
      } catch (e) {
        setError(getErrorMessage(e, "No se pudieron cargar las notificaciones."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [markAllReadOnLoad, onUnreadChange, user?.id, applyRemotePrefs]
  );

  useEffect(() => {
    void hydrateNotifPrefs();
  }, [hydrateNotifPrefs]);

  useEffect(() => {
    void load("initial");
  }, [load]);

  const markAllRead = useCallback(async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setMarkingAll(true);
    try {
      await markNotificationsRead(unreadIds);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      onUnreadChange?.(0);
    } finally {
      setMarkingAll(false);
    }
  }, [items, onUnreadChange]);

  const onRowPress = useCallback(
    (n: FeedNotification) => {
      if (!n.read) {
        setItems((prev) => {
          const next = prev.map((x) => (x.id === n.id ? { ...x, read: true } : x));
          onUnreadChange?.(next.filter((x) => !x.read).length);
          return next;
        });
        void markNotificationsRead([n.id]).catch(() => {
          setItems((prev) => {
            const next = prev.map((x) => (x.id === n.id ? { ...x, read: false } : x));
            onUnreadChange?.(next.filter((x) => !x.read).length);
            return next;
          });
        });
      }
      if (n.postId && onOpenPost) {
        onOpenPost(n.postId, commentIdFromNotification(n));
      } else onOpenActor(n.actorUserId);
    },
    [onOpenActor, onOpenPost, onUnreadChange]
  );

  const refreshList = useCallback(() => {
    void load("refresh");
  }, [load]);

  const handleNotifPrefsChange = useCallback(
    (p: NotificationPrefs) => {
      setNotifPrefs(p);
    },
    [setNotifPrefs]
  );

  const notificationsListExtraKey = useMemo(
    () => `${filter}|${markingAll ? 1 : 0}`,
    [filter, markingAll]
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === "sectionHeader") {
        return (
          <Text
            style={[styles.dayHeader, { paddingHorizontal: listPaddingHorizontal }]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {item.title}
          </Text>
        );
      }
      if (item.kind === "pendingRequests") {
        return (
          <View style={{ paddingHorizontal: listPaddingHorizontal }}>
            <FollowRequestsList
              requests={item.requests}
              loading={false}
              onChanged={refreshList}
            />
            <Pressable
              onPress={() => router.push("/(tabs)/social")}
              style={styles.openSocial}
            >
              <Text style={styles.openSocialText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Ver todo en Social →
              </Text>
            </Pressable>
          </View>
        );
      }
      if (item.kind === "followBack") {
        return (
          <NotificationFollowBackBanner
            notifications={item.notifications}
            followingIds={followingIds}
            paddingHorizontal={listPaddingHorizontal}
            onOpenActor={onOpenActor}
            onFollowingChanged={refreshList}
          />
        );
      }
      return (
        <NotificationRow
          notification={item.item}
          paddingHorizontal={listPaddingHorizontal}
          onPress={onRowPress}
        />
      );
    },
    [listPaddingHorizontal, onRowPress, onOpenActor, followingIds, refreshList, router]
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (item.kind === "sectionHeader") return item.key;
    if (item.kind === "followBack") return "followBack";
    if (item.kind === "pendingRequests") return "pendingRequests";
    return item.item.id;
  }, []);

  const listHeader = useMemo(
    () => (
      <View style={[styles.listHeader, { paddingHorizontal: listPaddingHorizontal }]}>
        <SocialNotificationPrefsRow prefs={notifPrefs} onChange={handleNotifPrefsChange} />
        <SocialChipRow options={NOTIFICATION_FILTER_OPTIONS} value={filter} onChange={setFilter} />
        {unreadCount > 0 ? (
          <Pressable
            onPress={() => void markAllRead()}
            disabled={markingAll}
            style={({ pressed }) => [styles.markAll, pressed ? styles.rowPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas como leídas"
          >
            <Text style={styles.markAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {markingAll ? "Marcando…" : "Marcar todas como leídas"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    ),
    [
      listPaddingHorizontal,
      notifPrefs,
      handleNotifPrefsChange,
      filter,
      unreadCount,
      markingAll,
      markAllRead,
    ]
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
    <FlashList
      style={styles.list}
      data={listItems}
      keyExtractor={keyExtractor}
      getItemType={(item) => item.kind}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      extraData={notificationsListExtraKey}
      drawDistance={480}
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
          {filter === "all"
            ? "Aún no tienes notificaciones."
            : "Nada en este filtro. Prueba «Todas»."}
        </Text>
      }
      contentContainerStyle={listItems.length === 0 ? styles.emptyContainer : styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
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
  dayHeader: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingTop: 14,
    paddingBottom: 6,
  },
  followBackWrap: {
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: "rgba(35, 32, 22, 0.4)",
    gap: 8,
  },
  followBackTitle: {
    color: AUTH.neutral100,
    fontSize: 13,
    fontWeight: "700",
  },
  followBackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  followBackMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  followBackUser: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  followBackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  followBackBtnText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  rowPressed: {
    opacity: 0.88,
  },
  listHeader: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  markAll: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 4,
  },
  markAllText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  openSocial: {
    paddingVertical: 10,
    alignItems: "flex-end",
  },
  openSocialText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
});
