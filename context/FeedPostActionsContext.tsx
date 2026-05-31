import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Post } from "../types/post";

export type FeedPostActionsHandlers = {
  toggleLike: (postId: string) => void;
  submitComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;
  toggleSave: (postId: string) => void;
  muteAuthor: (authorId: string) => void;
  openAuthor: (userId: string, username: string) => void;
  reportPost: (post: Post) => void;
  openWorkoutForPost: (post: Post) => void;
  openSession: (sessionId: string, postId: string) => void;
  clearCommentError: () => void;
};

export type FeedPostActionsSnapshot = {
  getCommentError: (postId: string) => string | undefined;
  isCommenting: (postId: string) => boolean;
  isDeleting: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
};

type FeedPostActionsContextValue = {
  invoke: FeedPostActionsHandlers;
  snapshot: FeedPostActionsSnapshot;
};

const FeedPostActionsContext = createContext<FeedPostActionsContextValue | null>(null);

export function FeedPostActionsProvider({
  children,
  handlers,
  snapshot,
}: {
  children: ReactNode;
  handlers: FeedPostActionsHandlers;
  snapshot: FeedPostActionsSnapshot;
}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const value = useMemo<FeedPostActionsContextValue>(
    () => ({
      invoke: {
        toggleLike: (postId) => handlersRef.current.toggleLike(postId),
        submitComment: (postId, content) => handlersRef.current.submitComment(postId, content),
        deletePost: (postId) => handlersRef.current.deletePost(postId),
        toggleSave: (postId) => handlersRef.current.toggleSave(postId),
        muteAuthor: (authorId) => handlersRef.current.muteAuthor(authorId),
        openAuthor: (userId, username) => handlersRef.current.openAuthor(userId, username),
        reportPost: (post) => handlersRef.current.reportPost(post),
        openWorkoutForPost: (post) => handlersRef.current.openWorkoutForPost(post),
        openSession: (sessionId, postId) => handlersRef.current.openSession(sessionId, postId),
        clearCommentError: () => handlersRef.current.clearCommentError(),
      },
      snapshot: {
        getCommentError: (postId) => snapshotRef.current.getCommentError(postId),
        isCommenting: (postId) => snapshotRef.current.isCommenting(postId),
        isDeleting: (postId) => snapshotRef.current.isDeleting(postId),
        isSaved: (postId) => snapshotRef.current.isSaved(postId),
      },
    }),
    []
  );

  return <FeedPostActionsContext.Provider value={value}>{children}</FeedPostActionsContext.Provider>;
}

export function useFeedPostActions(): FeedPostActionsContextValue {
  const ctx = useContext(FeedPostActionsContext);
  if (!ctx) {
    throw new Error("useFeedPostActions debe usarse dentro de FeedPostActionsProvider");
  }
  return ctx;
}
