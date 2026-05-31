import { create } from "zustand";

type CommentFieldError = { postId: string; message: string } | null;

type FeedInteractionState = {
  commentingPostId: string | null;
  deletingPostId: string | null;
  commentFieldError: CommentFieldError;
  setCommentingPostId: (postId: string | null) => void;
  setDeletingPostId: (postId: string | null) => void;
  setCommentFieldError: (err: CommentFieldError) => void;
  clearCommentError: () => void;
};

export const useFeedInteractionStore = create<FeedInteractionState>((set, get) => ({
  commentingPostId: null,
  deletingPostId: null,
  commentFieldError: null,
  setCommentingPostId: (postId) => set({ commentingPostId: postId }),
  setDeletingPostId: (postId) => set({ deletingPostId: postId }),
  setCommentFieldError: (err) => set({ commentFieldError: err }),
  clearCommentError: () => {
    const err = get().commentFieldError;
    if (err) set({ commentFieldError: null });
  },
}));
