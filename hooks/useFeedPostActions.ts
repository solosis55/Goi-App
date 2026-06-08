import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { goiToast } from "../context/GoiToastContext";
import {
  type FeedPostActionsHandlers,
} from "../context/FeedPostActionsContext";
import { usePostInteractions } from "./usePostInteractions";
import { useFeedInteractionStore } from "../stores/useFeedInteractionStore";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";
import type { Post, FeedTimelineItemDto } from "../types/post";
import type { SafeUser } from "../types/auth";
import { appendLocalReport } from "../utils/feedLocalPrefs";

type UseFeedPostActionsOptions = {
  user: SafeUser | null | undefined;
  posts: Post[];
  patchPost: (postId: string, updater: (post: Post) => Post) => void;
  patchTimeline: (updater: (prev: FeedTimelineItemDto[]) => FeedTimelineItemDto[]) => void;
};

export function useFeedPostActions({
  user,
  posts,
  patchPost,
  patchTimeline,
}: UseFeedPostActionsOptions) {
  const router = useRouter();
  const setCommentFieldError = useFeedInteractionStore((s) => s.setCommentFieldError);
  const setCommentingPostId = useFeedInteractionStore((s) => s.setCommentingPostId);
  const setDeletingPostId = useFeedInteractionStore((s) => s.setDeletingPostId);
  const clearCommentError = useFeedInteractionStore((s) => s.clearCommentError);
  const muteAuthorInStore = useFeedPrefsStore((s) => s.muteAuthor);
  const toggleSavedPostForUser = useFeedPrefsStore((s) => s.toggleSavedPostForUser);

  const [reportTarget, setReportTarget] = useState<Post | null>(null);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const resolveFeedPost = useCallback(
    (postId: string) => postsRef.current.find((p) => p.id === postId),
    []
  );

  const {
    toggleLikeForPost: handleToggleLike,
    submitComment: handleCreateComment,
    deletePostById: handleDeletePost,
  } = usePostInteractions({
    actor: user ? { id: user.id, username: user.username, avatarUrl: user.avatarUrl } : null,
    resolvePost: resolveFeedPost,
    patchPost,
    isCommenting: () => !!useFeedInteractionStore.getState().commentingPostId,
    setCommentingPostId,
    isDeleting: () => !!useFeedInteractionStore.getState().deletingPostId,
    setDeletingPostId,
    onLikeError: (msg) => goiToast(msg),
    onCommentValidated: () => setCommentFieldError(null),
    onCommentError: (postId, msg) => setCommentFieldError({ postId, message: msg }),
    onCommentSuccess: () => goiToast("Comentario publicado"),
    onDeleteError: (msg) => goiToast(msg),
    onDeleteSuccess: (postId) => {
      patchTimeline((prev) => prev.filter((e) => e.kind !== "post" || e.post.id !== postId));
      const err = useFeedInteractionStore.getState().commentFieldError;
      if (err?.postId === postId) setCommentFieldError(null);
      goiToast("Publicación eliminada");
    },
  });

  const handleOpenAuthor = useCallback(
    (authorUserId: string) => {
      if (!authorUserId || authorUserId === user?.id) return;
      router.push({ pathname: "/usuario/[id]", params: { id: authorUserId } });
    },
    [router, user?.id]
  );

  const handleMuteAuthor = useCallback(
    (authorUserId: string) => {
      if (!user?.id || authorUserId === user.id) return;
      void muteAuthorInStore(user.id, authorUserId);
      goiToast("Usuario silenciado");
    },
    [user?.id, muteAuthorInStore]
  );

  const handleToggleSave = useCallback(
    (postId: string) => {
      if (!user?.id) return;
      const nowSaved = toggleSavedPostForUser(user.id, postId);
      goiToast(nowSaved ? "Guardado en tu perfil" : "Quitado de guardados");
    },
    [user?.id, toggleSavedPostForUser]
  );

  const handleReportSubmit = useCallback(
    async (reason: string) => {
      if (!user?.id || !reportTarget) return;
      await appendLocalReport(user.id, {
        postId: reportTarget.id,
        authorId: reportTarget.userId,
        reason,
      });
      goiToast("Informe registrado en este dispositivo");
      setReportTarget(null);
    },
    [user?.id, reportTarget]
  );

  const handlePressSession = useCallback(
    (sessionId: string, fromPostId?: string | null) => {
      router.push({
        pathname: "/sesion/[id]",
        params: {
          id: sessionId,
          ...(fromPostId ? { postId: fromPostId } : {}),
        },
      });
    },
    [router]
  );

  const handlePressWorkout = useCallback(
    (post: Post) => {
      if (!post.workoutId) return;
      if (post.userId === user?.id) {
        router.push({ pathname: "/rutina/[id]", params: { id: post.workoutId } });
        return;
      }
      handleOpenAuthor(post.userId);
    },
    [router, user?.id, handleOpenAuthor]
  );

  const handlers = useMemo<FeedPostActionsHandlers>(
    () => ({
      toggleLike: (postId) => void handleToggleLike(postId),
      submitComment: (postId, content) => void handleCreateComment(postId, content),
      deletePost: (postId) => void handleDeletePost(postId),
      toggleSave: (postId) => void handleToggleSave(postId),
      muteAuthor: (authorId) => void handleMuteAuthor(authorId),
      openAuthor: handleOpenAuthor,
      reportPost: (post) => setReportTarget(post),
      openWorkoutForPost: handlePressWorkout,
      openSession: handlePressSession,
      clearCommentError: () => clearCommentError(),
    }),
    [
      handleToggleLike,
      handleCreateComment,
      handleDeletePost,
      handleToggleSave,
      handleMuteAuthor,
      handleOpenAuthor,
      handlePressWorkout,
      handlePressSession,
      clearCommentError,
    ]
  );

  return {
    handlers,
    reportTarget,
    setReportTarget,
    handleReportSubmit,
    handleOpenAuthor,
  };
}
