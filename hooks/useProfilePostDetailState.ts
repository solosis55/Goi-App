import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Post } from "../types/post";
import {
  openProfilePostDetail,
  usesProfilePostDetailScreen,
} from "../utils/openProfilePostDetail";
import type { ProfilePostOpeningMeta } from "../utils/profilePostDetailSession";
import { usePostInteractions } from "./usePostInteractions";
import { useSyncProfilePostFromDetail } from "./useSyncProfilePostFromDetail";

export type ProfilePostSyncPayload = {
  post: Post | null;
  deleted?: boolean;
};

type UseProfilePostDetailStateOptions = {
  resolvePost: (postId: string) => Post | undefined;
  patchPost: (postId: string, updater: (p: Post) => Post) => void;
  onPostSync?: (sync: ProfilePostSyncPayload) => void;
  onDeleteSuccess?: (postId: string) => void;
  onDeleteError?: (message: string) => void;
  onLikeError?: (message: string) => void;
  ownProfile?: boolean;
  openingMeta?: ProfilePostOpeningMeta;
};

export function useProfilePostDetailState({
  resolvePost,
  patchPost,
  onPostSync,
  onDeleteSuccess,
  onDeleteError,
  onLikeError,
  ownProfile,
  openingMeta,
}: UseProfilePostDetailStateOptions) {
  const router = useRouter();
  const { user } = useAuth();
  const useDetailScreen = usesProfilePostDetailScreen();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const [gridThumbKey, setGridThumbKey] = useState(0);
  const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
  const [commentErrorsByPostId, setCommentErrorsByPostId] = useState<
    Record<string, string | null>
  >({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const { toggleLikeForPost, submitComment, deletePostById } = usePostInteractions({
    actor: user ? { id: user.id, username: user.username, avatarUrl: user.avatarUrl } : null,
    resolvePost,
    patchPost,
    isCommenting: () => commentingPostId != null,
    setCommentingPostId,
    isDeleting: () => deletingPostId != null,
    setDeletingPostId,
    onLikeError,
    onCommentValidated: (postId) =>
      setCommentErrorsByPostId((prev) => ({ ...prev, [postId]: null })),
    onCommentError: (postId, msg) =>
      setCommentErrorsByPostId((prev) => ({ ...prev, [postId]: msg })),
    onCommentSuccess: (postId) =>
      setCommentByPostId((prev) => ({ ...prev, [postId]: "" })),
    onDeleteError: onDeleteError,
    onDeleteSuccess: (postId) => {
      setSelectedPostId((id) => (id === postId ? null : id));
      setCommentByPostId((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      onDeleteSuccess?.(postId);
    },
  });

  const applyPostSync = useCallback(
    (sync: ProfilePostSyncPayload) => {
      onPostSync?.(sync);
    },
    [onPostSync]
  );

  useSyncProfilePostFromDetail(applyPostSync);

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return resolvePost(selectedPostId) ?? null;
  }, [selectedPostId, resolvePost]);

  useEffect(() => {
    if (selectedPost) setModalPost(selectedPost);
  }, [selectedPost]);

  const detailPost = modalPost ?? selectedPost;

  const closePostDetail = useCallback(() => {
    setGridThumbKey((k) => k + 1);
    setSelectedPostId(null);
  }, []);

  const openPost = useCallback(
    (id: string) => {
      const post = resolvePost(id);
      if (!post) return;
      openProfilePostDetail({
        router,
        post,
        ownProfile,
        openingMeta,
        onOpenModal: () => {
          setModalPost(post);
          setSelectedPostId(id);
        },
      });
    },
    [resolvePost, router, ownProfile, openingMeta]
  );

  const handleToggleLike = useCallback(() => {
    if (selectedPostId) void toggleLikeForPost(selectedPostId);
  }, [selectedPostId, toggleLikeForPost]);

  const handleCreateComment = useCallback(() => {
    if (!selectedPostId) return;
    void submitComment(selectedPostId, commentByPostId[selectedPostId] ?? "");
  }, [selectedPostId, commentByPostId, submitComment]);

  const handleDeletePost = useCallback(
    (postId: string) => {
      void deletePostById(postId);
    },
    [deletePostById]
  );

  return {
    useDetailScreen,
    user,
    selectedPostId,
    detailPost,
    gridThumbKey,
    commentingPostId,
    deletingPostId,
    commentErrorsByPostId,
    openPost,
    closePostDetail,
    setModalPost,
    handleToggleLike,
    handleCreateComment,
    handleDeletePost,
    getCommentValue: (postId: string) => commentByPostId[postId] ?? "",
    setCommentValue: (postId: string, value: string) => {
      setCommentByPostId((prev) => ({ ...prev, [postId]: value }));
    },
  };
}

export type ProfilePostDetailState = ReturnType<typeof useProfilePostDetailState>;
