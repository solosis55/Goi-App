import { StyleSheet, View } from "react-native";
import type { Post } from "../../types/post";
import type { PostPreviewDraft } from "../post/preview/postPreviewTypes";
import { MentionHighlightedText } from "../post/MentionHighlightedText";
import { PublicationLinkedSessionBody } from "../post/PublicationLinkedSessionBody";
import { PostTrainingBody } from "../post/PostTrainingBody";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { PostCardCommentsBody } from "./PostCardComments";
import { postCardStyles as styles } from "./postCardStyles";

type SessionPreview = { exerciseName: string; summary: string };

type PostCardBodyProps = {
  postId: string;
  displayPost: Post;
  isTrainingPost: boolean;
  showStandardMedia: boolean;
  hasMedia: boolean;
  sessionInlineOpen: boolean;
  canPreviewLinkedSession: boolean;
  linkedSessionDraft: PostPreviewDraft;
  sessionExercisePreviews: SessionPreview[];
  workoutTitle?: string | null;
  commentsCount: number;
  commentsSectionOpen: boolean;
  commentsUiVisible: boolean;
  currentUserId: string | undefined;
  canOpenAuthor: boolean;
  mentionDirectory: Map<string, string>;
  trainingFeedMediaWidth: number;
  trainingFeedMediaHeight: number;
  onPressSession?: () => void;
  onPressComment: () => void;
  onOpenAuthor?: (authorUserId: string, authorUsername: string) => void;
  onOpenMentionProfile: (userId: string) => void;
  onDoubleTapLike: () => void;
  wrapPress: <T extends () => void>(fn: T) => T;
};

export function PostCardBody({
  postId,
  displayPost,
  isTrainingPost,
  showStandardMedia,
  hasMedia,
  sessionInlineOpen,
  canPreviewLinkedSession,
  linkedSessionDraft,
  sessionExercisePreviews,
  workoutTitle,
  commentsCount,
  commentsSectionOpen,
  commentsUiVisible,
  currentUserId,
  canOpenAuthor,
  mentionDirectory,
  trainingFeedMediaWidth,
  trainingFeedMediaHeight,
  onPressSession,
  onPressComment,
  onOpenAuthor,
  onOpenMentionProfile,
  onDoubleTapLike,
  wrapPress: press,
}: PostCardBodyProps) {
  return (
    <View
      style={[
        styles.bodyPad,
        !showStandardMedia && !isTrainingPost ? styles.bodyPadCompact : null,
      ]}
    >
      {!isTrainingPost && sessionInlineOpen && canPreviewLinkedSession ? (
        <PublicationLinkedSessionBody
          draft={linkedSessionDraft}
          onPressViewSession={
            displayPost.sessionId && onPressSession ? press(onPressSession) : undefined
          }
        />
      ) : displayPost.content ? (
        <MentionHighlightedText
          text={displayPost.content}
          userDirectory={mentionDirectory}
          onOpenProfile={canOpenAuthor ? onOpenMentionProfile : undefined}
          style={[
            styles.content,
            !showStandardMedia && !isTrainingPost ? styles.contentTextOnly : null,
          ]}
        />
      ) : null}

      {isTrainingPost ? (
        <PostTrainingBody
          sessionId={displayPost.sessionId}
          workoutTitle={displayPost.sessionWorkoutTitle ?? workoutTitle ?? "Entrenamiento"}
          performedAt={displayPost.sessionPerformedAt}
          metrics={{
            completedSets: displayPost.sessionCompletedSets,
            totalSets: displayPost.sessionTotalSets,
            completedExercises: displayPost.sessionCompletedExercises,
            totalExercises: displayPost.sessionTotalExercises,
          }}
          exercisePreviews={sessionExercisePreviews}
          moreExercisesCount={displayPost.sessionMoreExercisesCount ?? 0}
          onPressSession={
            displayPost.sessionId && onPressSession ? press(onPressSession) : undefined
          }
          showViewFullCta={Boolean(displayPost.sessionId && onPressSession)}
          mediaLabel={hasMedia ? "Foto del entreno" : undefined}
          mediaSlot={
            hasMedia ? (
              <View style={[bodyStyles.trainingMediaWrap, { width: trainingFeedMediaWidth }]}>
                <PostMediaCarousel
                  postId={postId}
                  media={displayPost.media ?? []}
                  onDoubleTapLike={onDoubleTapLike}
                  slideWidth={trainingFeedMediaWidth}
                  slideHeight={trainingFeedMediaHeight}
                  layout="inset"
                />
              </View>
            ) : undefined
          }
        />
      ) : null}

      <PostCardCommentsBody
        comments={displayPost.comments}
        commentsCount={commentsCount}
        commentsSectionOpen={commentsSectionOpen}
        commentsUiVisible={commentsUiVisible}
        currentUserId={currentUserId}
        canOpenAuthor={canOpenAuthor}
        onOpenAuthor={onOpenAuthor}
        onToggleComments={onPressComment}
        mentionDirectory={mentionDirectory}
      />
    </View>
  );
}

const bodyStyles = StyleSheet.create({
  trainingMediaWrap: {
    position: "relative",
    alignSelf: "center",
    overflow: "hidden",
  },
});
