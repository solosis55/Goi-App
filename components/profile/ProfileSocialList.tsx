import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toggleFollow } from "../../api/auth";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { confirmUnfollow } from "../../utils/socialConfirmActions";
import { resolveMediaUrl } from "../../api/config";
import { getProfileSocialPage } from "../../api/publicProfile";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SocialListKind } from "../../constants/socialListRoutes";
import { useAuth } from "../../context/AuthContext";
import type { SocialUserPreview } from "../../types/publicProfile";
import { getErrorMessage } from "../../utils/errorMessages";
import { UserAvatar } from "../ui/UserAvatar";

const PAGE_SIZE = 40;

type ProfileSocialListProps = {
  userId: string;
  kind: SocialListKind;
  onFollowingChanged?: (targetUserId: string, following: boolean) => void;
};

export function ProfileSocialList({ userId, kind, onFollowingChanged }: ProfileSocialListProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SocialUserPreview[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    async (append: boolean, nextCursor?: string | null, options?: { silent?: boolean }) => {
      if (append) setLoadingMore(true);
      else if (!options?.silent) setLoading(true);
      setError(null);
      try {
        const page = await getProfileSocialPage(userId, kind, {
          limit: PAGE_SIZE,
          cursor: append ? nextCursor : null,
        });
        setTotal(page.total);
        setUsers((prev) => {
          if (!append) return page.users;
          const seen = new Set(prev.map((u) => u.id));
          const merged = [...prev];
          for (const u of page.users) {
            if (!seen.has(u.id)) merged.push(u);
          }
          return merged;
        });
        setCursor(page.nextCursor);
      } catch (e) {
        if (!append) setUsers([]);
        setError(getErrorMessage(e, "No se pudo cargar la lista"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [userId, kind]
  );

  useEffect(() => {
    setUsers([]);
    setCursor(null);
    setTotal(null);
    void load(false);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCursor(null);
    void load(false, null, { silent: true });
  }, [load]);

  const { showAlert } = useGoiAlert();

  const runToggle = useCallback(
    async (target: SocialUserPreview) => {
      const prevFollowing = target.isFollowing;
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, isFollowing: !prevFollowing } : u))
      );
      setBusyId(target.id);
      try {
        const res = await toggleFollow(target.id);
        const following = Boolean(res.following);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === target.id ? { ...u, isFollowing: following || Boolean(res.pending) } : u
          )
        );
        onFollowingChanged?.(target.id, following);
      } catch {
        setUsers((prev) =>
          prev.map((u) => (u.id === target.id ? { ...u, isFollowing: prevFollowing } : u))
        );
      } finally {
        setBusyId(null);
      }
    },
    [onFollowingChanged]
  );

  const handleToggle = useCallback(
    (target: SocialUserPreview) => {
      if (target.id === currentUser?.id) return;
      if (target.isFollowing) {
        confirmUnfollow(showAlert, target.username, () => void runToggle(target));
        return;
      }
      void runToggle(target);
    },
    [currentUser?.id, showAlert, runToggle]
  );

  const openProfile = useCallback(
    (targetId: string) => {
      if (targetId === currentUser?.id) {
        router.push("/(tabs)/perfil");
        return;
      }
      router.push({ pathname: "/usuario/[id]", params: { id: targetId } });
    },
    [currentUser?.id, router]
  );

  const listExtraKey = `${busyId ?? ""}|${currentUser?.id ?? ""}`;

  const renderUserRow = useCallback(
    ({ item }: { item: SocialUserPreview }) => {
      const isSelf = item.id === currentUser?.id;
      return (
        <View style={styles.row}>
          <Pressable style={styles.rowMain} onPress={() => openProfile(item.id)}>
            <UserAvatar
              src={item.avatarUrl ? resolveMediaUrl(item.avatarUrl) : ""}
              username={item.username}
              size={48}
            />
            <View style={styles.rowText}>
              <Text style={styles.username} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{item.username}
              </Text>
              {item.followsYou ? (
                <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Te sigue
                </Text>
              ) : null}
            </View>
          </Pressable>
          {isSelf ? null : (
            <Pressable
              onPress={() => void handleToggle(item)}
              disabled={busyId === item.id}
              style={({ pressed }) => [
                styles.followBtn,
                item.isFollowing ? styles.followBtnOn : null,
                pressed ? styles.pressed : null,
                busyId === item.id ? styles.followBusy : null,
              ]}
            >
              <Text
                style={[styles.followText, item.isFollowing ? styles.followTextOn : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {busyId === item.id ? "…" : item.isFollowing ? "Siguiendo" : "Seguir"}
              </Text>
            </Pressable>
          )}
        </View>
      );
    },
    [busyId, currentUser?.id, handleToggle, openProfile]
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {error}
        </Text>
        <Pressable onPress={() => void load(false)} style={({ pressed }) => [styles.retry, pressed ? styles.pressed : null]}>
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
      data={users}
      keyExtractor={(item) => item.id}
      extraData={listExtraKey}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AUTH.gold} colors={[AUTH.gold]} />
      }
      onEndReached={() => {
        if (cursor && !loadingMore) void load(true, cursor);
      }}
      onEndReachedThreshold={0.35}
      contentContainerStyle={users.length === 0 ? styles.listEmpty : styles.listContent}
      ListHeaderComponent={
        total != null ? (
          <Text style={styles.total} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {total} {total === 1 ? "cuenta" : "cuentas"}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <Text style={styles.empty} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {kind === "followers" ? "Aún no hay seguidores." : "Aún no sigue a nadie."}
        </Text>
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator color={AUTH.gold} style={styles.footerLoader} /> : null
      }
      renderItem={renderUserRow}
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
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  total: {
    color: AUTH.muted,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  empty: {
    color: AUTH.muted,
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 24,
  },
  error: {
    color: AUTH.danger,
    textAlign: "center",
    fontSize: 14,
  },
  retry: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  footerLoader: {
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.5)",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  username: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  sub: {
    color: AUTH.muted,
    fontSize: 12,
  },
  followBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: AUTH.gold,
    minWidth: 88,
    alignItems: "center",
  },
  followBtnOn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  followBusy: {
    opacity: 0.65,
  },
  followText: {
    color: AUTH.bg,
    fontSize: 13,
    fontWeight: "700",
  },
  followTextOn: {
    color: AUTH.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
