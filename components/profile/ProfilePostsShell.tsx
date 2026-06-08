import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { Post } from "../../types/post";
import type { ProfilePostDetailState } from "../../hooks/useProfilePostDetailState";
import { ProfilePostDetailModal } from "./ProfilePostDetailModal";
import { ProfilePostsGrid } from "./ProfilePostsGrid";
import { ProfilePostsGridSkeleton } from "./ProfilePostsGridSkeleton";

export type ProfilePostsShellModalProps = {
  saved?: boolean;
  onToggleSave?: () => void;
  onEdit?: (postId: string) => void;
  pinnedPostId?: string | null;
  onSetPinned?: (postId: string | null) => void;
};

export type ProfilePostsShellProps = {
  displayedPosts: Post[];
  pinnedPostId?: string | null;
  showSkeleton: boolean;
  emptyContent?: React.ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  workoutLabelByPostId?: Record<string, string>;
  showGridHint?: boolean;
  detail: ProfilePostDetailState;
  modal?: ProfilePostsShellModalProps;
  header?: React.ReactNode;
  beforeGrid?: React.ReactNode;
};

export function ProfilePostsShell({
  displayedPosts,
  pinnedPostId,
  showSkeleton,
  emptyContent,
  hasMore,
  loadingMore,
  onLoadMore,
  workoutLabelByPostId,
  showGridHint = false,
  detail,
  modal,
  header,
  beforeGrid,
}: ProfilePostsShellProps) {
  const {
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
    getCommentValue,
    setCommentValue,
  } = detail;

  return (
    <View style={styles.wrap}>
      {header}

      {showSkeleton ? (
        <ProfilePostsGridSkeleton />
      ) : displayedPosts.length === 0 ? (
        emptyContent
      ) : (
        <>
          {beforeGrid}
          <ProfilePostsGrid
            posts={displayedPosts}
            pinnedPostId={pinnedPostId}
            selectedId={selectedPostId}
            thumbRemountKey={gridThumbKey}
            openPostId={useDetailScreen ? null : selectedPostId}
            workoutLabelByPostId={workoutLabelByPostId}
            onSelect={openPost}
          />
          {hasMore ? (
            <Pressable
              onPress={onLoadMore}
              disabled={loadingMore}
              style={({ pressed }) => [styles.loadMore, pressed ? styles.loadMorePressed : null]}
            >
              {loadingMore ? (
                <ActivityIndicator color={AUTH.gold} size="small" />
              ) : (
                <Text style={styles.loadMoreText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Cargar más
                </Text>
              )}
            </Pressable>
          ) : null}
          {showGridHint ? (
            <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Toca una miniatura para ver la publicación completa.
            </Text>
          ) : null}
        </>
      )}

      {!useDetailScreen ? (
        <ProfilePostDetailModal
          visible={selectedPostId != null}
          post={detailPost}
          currentUserId={user?.id}
          sessionAvatarUrl={user?.avatarUrl}
          commentValue={detailPost ? getCommentValue(detailPost.id) : ""}
          onChangeComment={(value) => {
            if (!detailPost) return;
            setCommentValue(detailPost.id, value);
          }}
          onSubmitComment={() => void handleCreateComment()}
          onToggleLike={() => void handleToggleLike()}
          onDelete={modal ? handleDeletePost : undefined}
          onEdit={modal?.onEdit}
          deleting={deletingPostId === selectedPostId}
          commenting={commentingPostId === selectedPostId}
          commentError={selectedPostId ? commentErrorsByPostId[selectedPostId] : null}
          onClose={closePostDetail}
          onAfterClose={() => setModalPost(null)}
          saved={modal?.saved}
          onToggleSave={modal?.onToggleSave}
          pinnedPostId={modal?.pinnedPostId}
          onSetPinned={modal?.onSetPinned}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  loadMore: {
    marginTop: 14,
    marginHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
  },
  loadMorePressed: {
    opacity: 0.88,
  },
  loadMoreText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    color: AUTH.faint,
    fontSize: 12,
    marginTop: 10,
    marginHorizontal: 16,
    textAlign: "center",
  },
});
