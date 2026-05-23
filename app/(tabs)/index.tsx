import { Box, Text } from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type FlatList as FlatListType,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { FeedPostCardSkeleton } from "../../components/feed/FeedPostCardSkeleton";
import { createComment, deletePost, getPosts, toggleLike } from "../../api/posts";
import { getStories } from "../../api/stories";
import { ApiError } from "../../api/client";
import { AppScreenShell } from "../../components/AppScreenShell";
import { FeedStatusBanner } from "../../components/feed/FeedStatusBanner";
import { FeedTopBar } from "../../components/feed/FeedTopBar";
import { PostCard } from "../../components/feed/PostCard";
import { StoriesRow } from "../../components/stories/StoriesRow";
import { StoryViewerModal } from "../../components/stories/StoryViewerModal";
import { AUTH } from "../../constants/authUi";
import { camaraHistoriaHref } from "../../constants/storyRoutes";
import { commentFormSchema } from "../../constants/commentSchema";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorMessages";
import { loadMutedUserIds, loadSavedPostIds, muteUser, toggleSavedPost } from "../../utils/feedLocalPrefs";
import type { Post } from "../../types/post";
import type { FeedStoryAuthor } from "../../types/story";

const FEED_MAX_WIDTH = 672;
const LIST_BOTTOM_PAD = 24;

function FeedListSeparator() {
  return <View style={{ height: 20 }} />;
}

export default function HomeFeedScreen() {
  const router = useRouter();
  const { palette, typography } = useGoiTheme();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [storyAuthorsFromApi, setStoryAuthorsFromApi] = useState<FeedStoryAuthor[]>([]);
  const [storySeenRevision, setStorySeenRevision] = useState(0);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerAuthorIdx, setStoryViewerAuthorIdx] = useState(0);
  const [storyViewerSlideIdx, setStoryViewerSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
  const [commentErrorsByPostId, setCommentErrorsByPostId] = useState<Record<string, string | null>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [savedPostIdSet, setSavedPostIdSet] = useState<Set<string>>(() => new Set());
  const [mutedUserIdSet, setMutedUserIdSet] = useState<Set<string>>(() => new Set());
  const feedFocusCountRef = useRef(0);
  const listRef = useRef<FlatListType<Post>>(null);
  const likeInFlightRef = useRef(new Set<string>());

  const scrollFeedToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const storyStripAuthors = useMemo((): FeedStoryAuthor[] => {
    if (!user) return [];
    const withoutSelf = storyAuthorsFromApi.filter((a) => a.userId !== user.id);
    const mine = storyAuthorsFromApi.find((a) => a.userId === user.id);
    const selfRow: FeedStoryAuthor =
      mine ?? {
        userId: user.id,
        authorUsername: user.username,
        authorAvatarUrl: user.avatarUrl ?? "",
        slides: [],
      };
    return [selfRow, ...withoutSelf];
  }, [storyAuthorsFromApi, user]);

  const storyViewerAuthors = useMemo(
    () => storyStripAuthors.filter((a) => a.slides.length > 0),
    [storyStripAuthors]
  );

  const refreshStories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStories();
      setStoryAuthorsFromApi(data.authors ?? []);
    } catch {
      /* no bloquea el feed */
    }
  }, [user]);

  const handleStoryCellClick = useCallback(
    (clickedUserId: string) => {
      if (!user) return;
      const row = storyStripAuthors.find((a) => a.userId === clickedUserId);
      if (!row) return;
      if (clickedUserId === user.id && row.slides.length === 0) {
        router.push(camaraHistoriaHref());
        return;
      }
      const idx = storyViewerAuthors.findIndex((a) => a.userId === clickedUserId);
      if (idx === -1) return;
      setStoryViewerAuthorIdx(idx);
      setStoryViewerSlideIdx(0);
      setStoryViewerOpen(true);
    },
    [router, storyStripAuthors, storyViewerAuthors, user]
  );

  const refreshSavedIds = useCallback(async () => {
    if (!user?.id) {
      setSavedPostIdSet(new Set());
      return;
    }
    const ids = await loadSavedPostIds(user.id);
    setSavedPostIdSet(new Set(ids));
  }, [user?.id]);

  const refreshMutedIds = useCallback(async () => {
    if (!user?.id) {
      setMutedUserIdSet(new Set());
      return;
    }
    const ids = await loadMutedUserIds(user.id);
    setMutedUserIdSet(new Set(ids));
  }, [user?.id]);

  const visiblePosts = useMemo(
    () => posts.filter((p) => !mutedUserIdSet.has(p.userId)),
    [posts, mutedUserIdSet]
  );

  const handleOpenAuthor = useCallback(
    (authorUserId: string) => {
      if (!authorUserId || authorUserId === user?.id) return;
      router.push({ pathname: "/usuario/[id]", params: { id: authorUserId } });
    },
    [router, user?.id]
  );

  const handleMuteAuthor = useCallback(
    async (authorUserId: string) => {
      if (!user?.id || authorUserId === user.id) return;
      await muteUser(user.id, authorUserId);
      await refreshMutedIds();
      setPosts((prev) => prev.filter((p) => p.userId !== authorUserId));
      setActionMessage("Usuario silenciado. Puedes gestionarlo en Perfil → Privado.");
    },
    [user?.id, refreshMutedIds]
  );

  const handleToggleSave = useCallback(
    async (postId: string) => {
      if (!user?.id) return;
      const nowSaved = await toggleSavedPost(user.id, postId);
      setSavedPostIdSet((prev) => {
        const next = new Set(prev);
        if (nowSaved) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setActionMessage(nowSaved ? "Guardado en tu perfil" : "Quitado de guardados");
    },
    [user?.id]
  );

  const fetchPosts = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e instanceof ApiError) {
        setError({
          message: e.message,
          detail: `Código ${e.code} · HTTP ${e.status}`,
        });
      } else {
        setError({ message: "No se pudo cargar el feed." });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!user?.id || likeInFlightRef.current.has(postId)) return;

      const snapshot = posts.find((p) => p.id === postId);
      if (!snapshot) return;

      const wasLiked = !!snapshot.likedByMe;
      const optimisticLiked = !wasLiked;

      setActionMessage(null);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          let nextCount = p.likesCount;
          if (optimisticLiked && !wasLiked) nextCount += 1;
          else if (!optimisticLiked && wasLiked) nextCount = Math.max(0, nextCount - 1);
          return { ...p, likedByMe: optimisticLiked, likesCount: nextCount };
        })
      );

      likeInFlightRef.current.add(postId);
      try {
        const { liked } = await toggleLike(postId);
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            let nextCount = snapshot.likesCount;
            if (liked && !snapshot.likedByMe) nextCount += 1;
            else if (!liked && snapshot.likedByMe) nextCount = Math.max(0, snapshot.likesCount - 1);
            return { ...p, likedByMe: liked, likesCount: nextCount };
          })
        );
      } catch (e) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? snapshot : p)));
        setActionMessage(getErrorMessage(e, "No se pudo actualizar el me gusta."));
      } finally {
        likeInFlightRef.current.delete(postId);
      }
    },
    [posts, user?.id]
  );

  const handleCreateComment = useCallback(
    async (postId: string) => {
      if (!user?.id || commentingPostId) return;
      const raw = commentByPostId[postId] ?? "";
      const parsed = commentFormSchema.safeParse({ content: raw });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Comentario no válido";
        setCommentErrorsByPostId((prev) => ({ ...prev, [postId]: msg }));
        return;
      }

      setActionMessage(null);
      setCommentErrorsByPostId((prev) => ({ ...prev, [postId]: null }));
      setCommentingPostId(postId);
      try {
        const newComment = await createComment(postId, { content: parsed.data.content });
        setCommentByPostId((prev) => ({ ...prev, [postId]: "" }));
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const comments = [...p.comments, newComment].sort((a, b) =>
              a.createdAt < b.createdAt ? -1 : 1
            );
            return { ...p, comments };
          })
        );
        setActionMessage("Comentario publicado");
      } catch (e) {
        setCommentErrorsByPostId((prev) => ({
          ...prev,
          [postId]: getErrorMessage(e, "No se pudo publicar el comentario."),
        }));
      } finally {
        setCommentingPostId(null);
      }
    },
    [commentByPostId, commentingPostId, user?.id]
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!user?.id || deletingPostId) return;
      setActionMessage(null);
      setDeletingPostId(postId);
      try {
        await deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setCommentByPostId((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
        setCommentErrorsByPostId((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
        setActionMessage("Publicación eliminada");
      } catch (e) {
        setActionMessage(getErrorMessage(e, "No se pudo eliminar la publicación."));
      } finally {
        setDeletingPostId(null);
      }
    },
    [deletingPostId, user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      if (!isHydrated || !isAuthenticated) return;
      feedFocusCountRef.current += 1;
      const mode = feedFocusCountRef.current === 1 ? "initial" : "refresh";
      void fetchPosts(mode);
      void refreshStories();
      void refreshSavedIds();
      void refreshMutedIds();
    }, [isHydrated, isAuthenticated, fetchPosts, refreshStories, refreshSavedIds, refreshMutedIds])
  );

  if (!isHydrated) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" style={{ backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const listHeader = (
    <View style={styles.headerBlock}>
      {user ? (
        <View style={styles.storiesSection}>
          <Text style={styles.storiesTitle} maxFontSizeMultiplier={1.2}>
            Historias
          </Text>
          <StoriesRow
            authors={storyStripAuthors}
            currentUserId={user.id}
            seenRevision={storySeenRevision}
            onSelectAuthor={handleStoryCellClick}
          />
        </View>
      ) : null}
      <FeedStatusBanner
        actionMessage={actionMessage}
        errorMessage={error?.message}
        errorDetail={error?.detail}
        onRetry={error ? () => void fetchPosts("initial") : undefined}
      />
      {loading && posts.length === 0 ? <FeedPostCardSkeleton count={3} /> : null}
    </View>
  );

  const listEmpty =
    !loading && !error && visiblePosts.length === 0 ? (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Aún no hay publicaciones</Text>
        <Text style={styles.emptyBody}>
          Pulsa el + del menú inferior para publicar, o tira hacia abajo para actualizar.
        </Text>
      </View>
    ) : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreenShell>
        <View style={styles.screen}>
          <FeedTopBar user={user} onBrandPress={scrollFeedToTop} />
          <FlatList
            ref={listRef}
            style={styles.list}
            data={visiblePosts}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            extraData={{
              commentByPostId,
              commentErrorsByPostId,
              commentingPostId,
              deletingPostId,
              savedPostIdSet,
              mutedUserIdSet,
            }}
            ItemSeparatorComponent={FeedListSeparator}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                palette={palette}
                typography={typography}
                currentUserId={user?.id}
                sessionAvatarUrl={user?.avatarUrl}
                commentValue={commentByPostId[item.id] ?? ""}
                onChangeComment={(value) => {
                  setCommentByPostId((prev) => ({ ...prev, [item.id]: value }));
                  if (commentErrorsByPostId[item.id]) {
                    setCommentErrorsByPostId((prev) => ({ ...prev, [item.id]: null }));
                  }
                  if (actionMessage) setActionMessage(null);
                }}
                onSubmitComment={() => void handleCreateComment(item.id)}
                onToggleLike={() => void handleToggleLike(item.id)}
                onDelete={(postId) => void handleDeletePost(postId)}
                onEdit={(postId) => router.push({ pathname: "/editar-publicacion", params: { id: postId } })}
                deleting={deletingPostId === item.id}
                commenting={commentingPostId === item.id}
                commentError={commentErrorsByPostId[item.id]}
                saved={savedPostIdSet.has(item.id)}
                onToggleSave={() => void handleToggleSave(item.id)}
                onMuteAuthor={(authorId) => void handleMuteAuthor(authorId)}
                onOpenAuthor={handleOpenAuthor}
              />
            )}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  void fetchPosts("refresh");
                  void refreshStories();
                }}
                tintColor={AUTH.gold}
              />
            }
          />
        </View>
      </AppScreenShell>

      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerAuthors}
        startAuthorIdx={storyViewerAuthorIdx}
        startSlideIdx={storyViewerSlideIdx}
        onClose={() => setStoryViewerOpen(false)}
        onStoriesUiRefresh={() => setStorySeenRevision((n) => n + 1)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: LIST_BOTTOM_PAD,
    width: "100%",
    maxWidth: FEED_MAX_WIDTH,
    alignSelf: "center",
  },
  headerBlock: {
    width: "100%",
  },
  storiesSection: {
    marginBottom: 16,
    gap: 10,
  },
  storiesTitle: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 10,
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
});
