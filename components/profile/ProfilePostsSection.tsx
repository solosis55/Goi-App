import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useProfilePosts } from "../../hooks/useProfilePosts";
import { useProfilePostDetailState } from "../../hooks/useProfilePostDetailState";
import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";
import type { Post } from "../../types/post";
import { getErrorMessage } from "../../utils/errorMessages";
import { ProfilePinnedPostBanner } from "./ProfilePinnedPostBanner";
import { ProfilePostsShell } from "./ProfilePostsShell";
import { ProfilePostsToolbar } from "./ProfilePostsToolbar";

type ProfilePostsSectionProps = {
  userId: string | undefined;
  pinnedPostId?: string | null;
  onSetPinned: (postId: string | null) => Promise<void>;
  onBindRefresh?: (refresh: () => Promise<void>) => void;
  onPostsTotalChange?: (total: number) => void;
};

export function ProfilePostsSection({
  userId,
  pinnedPostId,
  onSetPinned,
  onBindRefresh,
  onPostsTotalChange,
}: ProfilePostsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const postsState = useProfilePosts(userId, pinnedPostId);
  const savedPostIds = useFeedPrefsStore((s) => s.savedPostIds);
  const toggleSavedPostForUser = useFeedPrefsStore((s) => s.toggleSavedPostForUser);
  const savedIdSet = useMemo(() => new Set(savedPostIds), [savedPostIds]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const resolvePost = useCallback(
    (postId: string) =>
      postsState.displayedPosts.find((p) => p.id === postId) ??
      postsState.myPosts.find((p) => p.id === postId) ??
      postsState.savedPosts.find((p) => p.id === postId),
    [postsState.displayedPosts, postsState.myPosts, postsState.savedPosts]
  );

  const patchPostInLists = useCallback(
    (postId: string, updater: (p: Post) => Post) => {
      postsState.patchPost(postId, updater);
    },
    [postsState]
  );

  const handlePin = useCallback(
    async (postId: string | null) => {
      try {
        await onSetPinned(postId);
        setActionMessage(postId ? "Publicación destacada en tu perfil." : "Destacado quitado.");
      } catch (e) {
        setActionMessage(getErrorMessage(e, "No se pudo actualizar el destacado."));
      }
    },
    [onSetPinned]
  );

  const detail = useProfilePostDetailState({
    resolvePost,
    patchPost: patchPostInLists,
    ownProfile: true,
    openingMeta: { pinnedPostId, onSetPinned: handlePin },
    onLikeError: (msg) => setActionMessage(msg),
    onDeleteError: (msg) => setActionMessage(msg),
    onDeleteSuccess: (postId) => {
      if (pinnedPostId === postId) void onSetPinned(null);
      postsState.removePost(postId);
    },
    onPostSync: (sync) => {
      if (sync.deleted && sync.post) {
        postsState.removePost(sync.post.id);
        if (pinnedPostId === sync.post.id) void onSetPinned(null);
        return;
      }
      if (sync.post) {
        patchPostInLists(sync.post.id, () => sync.post!);
      }
    },
  });

  useEffect(() => {
    onBindRefresh?.(postsState.refreshAll);
  }, [onBindRefresh, postsState.refreshAll]);

  useEffect(() => {
    onPostsTotalChange?.(postsState.total);
  }, [onPostsTotalChange, postsState.total]);

  const handleEdit = useCallback(
    (postId: string) => {
      detail.closePostDetail();
      router.push({ pathname: "/editar-publicacion", params: { id: postId } });
    },
    [router, detail]
  );

  const handleToggleSave = useCallback(
    (postId: string) => {
      if (!userId) return;
      toggleSavedPostForUser(userId, postId);
    },
    [userId, toggleSavedPostForUser]
  );

  const emptyMessage =
    postsState.sourceTab === "mine"
      ? "Aún no tienes publicaciones. Crea la primera desde el botón + del feed."
      : "No tienes publicaciones guardadas. En Inicio, toca el icono de guardar en una tarjeta.";

  const filteredEmpty =
    postsState.sourceTab === "mine" &&
    postsState.myPosts.length > 0 &&
    postsState.displayedPosts.length === 0
      ? "Ninguna publicación coincide con el filtro «Con foto»."
      : postsState.sourceTab === "saved" &&
          postsState.savedPosts.length > 0 &&
          postsState.displayedPosts.length === 0
        ? "Ningún guardado coincide con el filtro «Con foto»."
        : null;

  const showPinnedBanner =
    postsState.sourceTab === "mine" &&
    Boolean(pinnedPostId?.trim()) &&
    postsState.displayedPosts.some((p) => p.id === pinnedPostId?.trim());

  const header = (
    <>
      <ProfilePostsToolbar
        sourceTab={postsState.sourceTab}
        onSourceTabChange={postsState.setSourceTab}
        filter={postsState.filter}
        onFilterChange={postsState.setFilter}
      />

      {actionMessage ? (
        <Text style={styles.banner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {actionMessage}
        </Text>
      ) : null}

      {postsState.sourceTab === "saved" && postsState.savedOrphansCount > 0 ? (
        <View style={styles.orphanBanner}>
          <Text style={styles.orphanText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Hay {postsState.savedOrphansCount} guardado{postsState.savedOrphansCount === 1 ? "" : "s"}{" "}
            que ya no aparecen en el feed.
          </Text>
          <Pressable onPress={() => void postsState.pruneSavedOrphans()} style={styles.orphanBtn}>
            <Text style={styles.orphanBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Limpiar lista
            </Text>
          </Pressable>
        </View>
      ) : null}

      {postsState.error ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {postsState.error}
          </Text>
          <Pressable onPress={() => void postsState.refreshAll()}>
            <Text style={styles.retry} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );

  const emptyContent = postsState.error ? null : (
    <View style={styles.emptyBlock}>
      <Text style={styles.emptyText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {filteredEmpty ?? emptyMessage}
      </Text>
    </View>
  );

  return (
    <ProfilePostsShell
      displayedPosts={postsState.error ? [] : postsState.displayedPosts}
      pinnedPostId={pinnedPostId}
      showSkeleton={!postsState.error && postsState.loading}
      emptyContent={emptyContent}
      hasMore={postsState.hasMore}
      loadingMore={postsState.loadingMore}
      onLoadMore={postsState.loadMore}
      showGridHint
      detail={detail}
      modal={{
        saved: detail.selectedPostId ? savedIdSet.has(detail.selectedPostId) : false,
        onToggleSave: detail.selectedPostId
          ? () => void handleToggleSave(detail.selectedPostId!)
          : undefined,
        onEdit: handleEdit,
        pinnedPostId,
        onSetPinned: (id) => void handlePin(id),
      }}
      header={header}
      beforeGrid={showPinnedBanner ? <ProfilePinnedPostBanner /> : null}
    />
  );
}

const styles = StyleSheet.create({
  banner: {
    fontSize: 13,
    marginBottom: 8,
    marginHorizontal: 16,
    color: AUTH.success,
  },
  orphanBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.35)",
    backgroundColor: "rgba(40, 32, 16, 0.45)",
    gap: 8,
  },
  orphanText: {
    color: AUTH.steel,
    fontSize: 12,
    lineHeight: 18,
  },
  orphanBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  orphanBtnText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyBlock: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
    textAlign: "center",
  },
  retry: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
});
