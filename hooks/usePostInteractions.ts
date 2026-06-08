import { useCallback, useRef } from "react";
import { createComment, deletePost as deletePostApi, toggleLike } from "../api/posts";
import { commentFormSchema } from "../constants/commentSchema";
import type { Post } from "../types/post";
import { getErrorMessage } from "../utils/errorMessages";
import {
  applyLikeToggle,
  buildOptimisticComment,
  reconcileLikeFromServer,
  sortPostComments,
} from "../utils/postInteractionLogic";

export type PostPatchFn = (postId: string, updater: (post: Post) => Post) => void;

export type PostInteractionsActor = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type UsePostInteractionsOptions = {
  actor: PostInteractionsActor | null | undefined;
  resolvePost: (postId: string) => Post | undefined;
  patchPost: PostPatchFn;
  isCommenting?: () => boolean;
  setCommentingPostId?: (postId: string | null) => void;
  isDeleting?: () => boolean;
  setDeletingPostId?: (postId: string | null) => void;
  optimisticComments?: boolean;
  onLikeError?: (message: string) => void;
  onCommentError?: (postId: string, message: string) => void;
  onCommentSuccess?: (postId: string) => void;
  onCommentValidated?: (postId: string) => void;
  onDeleteError?: (message: string) => void;
  onDeleteSuccess?: (postId: string) => void;
};

export function usePostInteractions({
  actor,
  resolvePost,
  patchPost,
  isCommenting,
  setCommentingPostId,
  isDeleting,
  setDeletingPostId,
  optimisticComments = true,
  onLikeError,
  onCommentError,
  onCommentSuccess,
  onCommentValidated,
  onDeleteError,
  onDeleteSuccess,
}: UsePostInteractionsOptions) {
  const likeInFlightRef = useRef(new Set<string>());

  const toggleLikeForPost = useCallback(
    async (postId: string) => {
      if (!actor?.id || likeInFlightRef.current.has(postId)) return;

      const snapshot = resolvePost(postId);
      if (!snapshot) return;

      const optimistic = applyLikeToggle(snapshot, !snapshot.likedByMe);
      patchPost(postId, (p) => ({ ...p, ...optimistic }));

      likeInFlightRef.current.add(postId);
      try {
        const { liked } = await toggleLike(postId);
        patchPost(postId, (p) => ({
          ...p,
          ...reconcileLikeFromServer(snapshot, liked),
        }));
      } catch (e) {
        patchPost(postId, () => snapshot);
        onLikeError?.(getErrorMessage(e, "No se pudo actualizar el me gusta."));
      } finally {
        likeInFlightRef.current.delete(postId);
      }
    },
    [actor?.id, resolvePost, patchPost, onLikeError]
  );

  const submitComment = useCallback(
    async (postId: string, raw: string) => {
      if (!actor?.id || isCommenting?.()) return;

      const parsed = commentFormSchema.safeParse({ content: raw });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Comentario no válido";
        onCommentError?.(postId, msg);
        return;
      }

      onCommentValidated?.(postId);

      const tempId = optimisticComments ? `temp-comment-${Date.now()}` : null;
      if (tempId) {
        const optimisticComment = buildOptimisticComment({
          tempId,
          postId,
          userId: actor.id,
          username: actor.username,
          avatarUrl: actor.avatarUrl,
          content: parsed.data.content,
        });
        patchPost(postId, (p) => ({
          ...p,
          comments: sortPostComments([...p.comments, optimisticComment]),
        }));
      }

      setCommentingPostId?.(postId);
      try {
        const newComment = await createComment(postId, { content: parsed.data.content });
        patchPost(postId, (p) => {
          const base = tempId ? p.comments.filter((c) => c.id !== tempId) : p.comments;
          return {
            ...p,
            comments: sortPostComments([...base, newComment]),
          };
        });
        onCommentSuccess?.(postId);
      } catch (e) {
        if (tempId) {
          patchPost(postId, (p) => ({
            ...p,
            comments: p.comments.filter((c) => c.id !== tempId),
          }));
        }
        onCommentError?.(postId, getErrorMessage(e, "No se pudo publicar el comentario."));
      } finally {
        setCommentingPostId?.(null);
      }
    },
    [
      actor,
      isCommenting,
      optimisticComments,
      patchPost,
      setCommentingPostId,
      onCommentError,
      onCommentValidated,
      onCommentSuccess,
    ]
  );

  const deletePostById = useCallback(
    async (postId: string) => {
      if (!actor?.id || isDeleting?.()) return;

      setDeletingPostId?.(postId);
      try {
        await deletePostApi(postId);
        onDeleteSuccess?.(postId);
      } catch (e) {
        onDeleteError?.(getErrorMessage(e, "No se pudo eliminar la publicación."));
      } finally {
        setDeletingPostId?.(null);
      }
    },
    [actor?.id, isDeleting, setDeletingPostId, onDeleteSuccess, onDeleteError]
  );

  return {
    toggleLikeForPost,
    submitComment,
    deletePostById,
    likeInFlightRef,
  };
}
