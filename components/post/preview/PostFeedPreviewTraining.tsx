import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { POST_IMAGE_MAX_FILES } from "../../../constants/createPost";
import { CreatePostPreviewMedia } from "./CreatePostPreviewMedia";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { PostTrainingBody } from "../PostTrainingBody";
import { PostPreviewCardHeader } from "./PostPreviewCardHeader";
import { postPreviewCardStyles, previewCardShellStyle } from "./postPreviewCardStyles";
import { resolvePreviewCardWidth } from "./postPreviewLayout";
import {
  trainingInsetMediaHeight,
  trainingInsetMediaWidth,
  TRAINING_INSET_MEDIA,
} from "./postPreviewMediaLayout";
import {
  resolveSessionExercisePreviews,
  resolveSessionMoreExercisesCount,
} from "../../../utils/sessionExercisePreview";
import type { PostPreviewDraft } from "./postPreviewTypes";

type PostFeedPreviewTrainingProps = {
  draft: PostPreviewDraft;
  fullBleed?: boolean;
  layoutWidth?: number;
  compact?: boolean;
  embedded?: boolean;
  previewMode?: boolean;
  onPressLinkSession?: () => void;
  onPressViewSession?: () => void;
  showViewFullCta?: boolean;
  editorMode?: boolean;
  onPressEditMedia?: () => void;
  onPressAddMedia?: () => void;
  onPressEditCaption?: () => void;
  maxImageFiles?: number;
};

/**
 * Training: sin foto → sesión protagonista.
 * Con foto → texto + sesión primero; foto insertada al final (no estilo feed clásico).
 */
export function PostFeedPreviewTraining({
  draft,
  fullBleed = true,
  layoutWidth,
  compact = false,
  embedded = false,
  previewMode = false,
  onPressLinkSession,
  onPressViewSession,
  showViewFullCta = false,
  editorMode = false,
  onPressEditMedia,
  onPressAddMedia,
  onPressEditCaption,
  maxImageFiles = POST_IMAGE_MAX_FILES,
}: PostFeedPreviewTrainingProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isEmbedded = embedded || layoutWidth != null;
  const cardW = resolvePreviewCardWidth(windowWidth, { fullBleed, layoutWidth });
  const previewText = draft.content.trim();
  const hasMedia = draft.imageUris.length > 0;
  const avatarSize = compact ? 28 : 38;
  const hasSession = Boolean(draft.sessionId);
  const insetW = trainingInsetMediaWidth(cardW);
  const insetH = hasMedia
    ? trainingInsetMediaHeight(insetW, {
        maxHeight:
          previewMode && fullBleed
            ? Math.round(windowHeight * TRAINING_INSET_MEDIA.maxHeightRatio)
            : compact
              ? 140
              : undefined,
      })
    : 0;
  const maxExercisePreview = compact || isEmbedded ? 2 : 3;
  const exercisePreviews = resolveSessionExercisePreviews({
    snapshot: draft.sessionSnapshot,
    previews: draft.sessionExercisePreviews,
    notes: draft.sessionNotes,
    maxExercises: maxExercisePreview,
  });
  const moreExercisesCount = resolveSessionMoreExercisesCount({
    snapshot: draft.sessionSnapshot,
    previews: draft.sessionExercisePreviews,
    notes: draft.sessionNotes,
    shown: exercisePreviews.length,
  });

  return (
    <View
      style={previewCardShellStyle({
        cardWidth: cardW,
        fullBleed,
        isEmbedded,
        embedded,
      })}
    >
      <PostPreviewCardHeader
        draft={draft}
        compact={compact}
        avatarSize={avatarSize}
        metaSuffix=" · Training · ahora"
      />

      <View
        style={[
          styles.actions,
          compact ? styles.actionsCompact : null,
          !hasMedia ? styles.actionsAfterHead : null,
          editorMode ? styles.actionsDim : null,
        ]}
        pointerEvents="none"
      >
        {editorMode ? (
          <Text style={styles.previewHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Vista previa del feed
          </Text>
        ) : null}
        <Text style={[styles.actionIcon, compact ? styles.actionIconCompact : null]}>♡</Text>
        <Text style={[styles.actionIcon, compact ? styles.actionIconCompact : null]}>💬</Text>
      </View>

      <Pressable
        onPress={editorMode ? onPressEditCaption : undefined}
        disabled={!editorMode || !onPressEditCaption}
        style={[editorMode ? styles.captionEditable : null]}
      >
        {previewText ? (
          <Text
            style={[styles.caption, compact ? styles.captionCompact : null]}
            numberOfLines={compact ? 2 : undefined}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {previewText}
          </Text>
        ) : (
          <Text
            style={[styles.captionPlaceholder, compact ? styles.captionCompact : null]}
            numberOfLines={compact ? 1 : undefined}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {editorMode ? "Toca para comentar el entreno…" : compact ? "Comentario del entreno…" : "Añade un comentario sobre el entreno…"}
          </Text>
        )}
      </Pressable>

      <PostTrainingBody
        sessionId={hasSession ? draft.sessionId : null}
        workoutTitle={draft.workoutTitle}
        performedAt={draft.sessionPerformedAt}
        sessionNotes={draft.sessionNotes}
        metrics={{
          completedSets: draft.sessionCompletedSets,
          totalSets: draft.sessionTotalSets,
          completedExercises: draft.sessionCompletedExercises,
          totalExercises: draft.sessionTotalExercises,
        }}
        exercisePreviews={exercisePreviews}
        moreExercisesCount={moreExercisesCount}
        linked={previewMode}
        compact={compact || isEmbedded}
        onPressSession={onPressViewSession}
        onPressLinkSession={onPressLinkSession}
        showViewFullCta={showViewFullCta || previewMode || Boolean(onPressViewSession)}
        mediaLabel={
          hasMedia
            ? draft.imageUris.length > 1
              ? `Fotos del entreno · ${draft.imageUris.length}`
              : "Foto del entreno"
            : undefined
        }
        mediaInsetStyle={{ paddingHorizontal: TRAINING_INSET_MEDIA.horizontalPad }}
        mediaSlot={
          hasMedia ? (
            <View
              style={[
                styles.mediaFrame,
                {
                  width: insetW,
                  height: insetH,
                  borderRadius: TRAINING_INSET_MEDIA.borderRadius,
                },
              ]}
            >
              <CreatePostPreviewMedia
                imageUris={draft.imageUris}
                width={insetW}
                height={insetH}
                layout="inset"
                editorMode={editorMode}
                maxFiles={maxImageFiles}
                onPressEdit={onPressEditMedia}
                onPressAdd={onPressAddMedia}
              />
            </View>
          ) : undefined
        }
        showAddMediaPrompt={editorMode && previewMode && !hasMedia && Boolean(onPressEditMedia)}
        onPressAddMedia={onPressAddMedia ?? onPressEditMedia}
        addMediaHint={`Hasta ${maxImageFiles} imágenes`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  actionsCompact: {
    gap: 12,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 2,
  },
  actionsAfterHead: {
    paddingTop: 4,
  },
  actionIcon: { color: AUTH.neutral100, fontSize: 20 },
  actionIconCompact: { fontSize: 16 },
  actionsDim: { opacity: 0.42 },
  previewHint: {
    ...postPreviewCardStyles.previewHint,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    fontSize: 9,
  },
  captionEditable: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 10,
  },
  caption: {
    color: AUTH.neutral100,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  captionCompact: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 10,
    paddingTop: 2,
  },
  captionPlaceholder: {
    color: AUTH.faint,
    fontSize: 14,
    fontStyle: "italic",
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  mediaFrame: {
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: "#141416",
  },
});
