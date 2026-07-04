import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { POST_IMAGE_MAX_FILES } from "../../../constants/createPost";
import { CreatePostPreviewMedia } from "./CreatePostPreviewMedia";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { PostActionBar } from "../../feed/PostActionBar";
import { postCardStyles } from "../../feed/postCardStyles";
import { PostTrainingBody } from "../PostTrainingBody";
import { PostPreviewCardHeader } from "./PostPreviewCardHeader";
import { PostPreviewMediaPlaceholder } from "./PostPreviewMediaPlaceholder";
import { postPreviewCardStyles, previewCardShellStyle } from "./postPreviewCardStyles";
import { resolvePreviewCardWidth } from "./postPreviewLayout";
import {
  trainingInsetMediaHeight,
  trainingInsetMediaWidth,
  trainingFeedInsetHeight,
  trainingFeedInsetWidth,
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
  /** Selector de formato: tarjeta completa visible. */
  formatChooser?: boolean;
};

/**
 * Training: sin foto → sesión protagonista.
 * Con foto → acciones → caption → sesión → foto inset (como en feed).
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
  formatChooser = false,
}: PostFeedPreviewTrainingProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isEmbedded = embedded || layoutWidth != null;
  const feedMatch = previewMode && !formatChooser;
  const cardW = resolvePreviewCardWidth(windowWidth, { fullBleed, layoutWidth });
  const previewText = draft.content.trim();
  const hasMedia = draft.imageUris.length > 0;
  const showChooserMediaPlaceholder = formatChooser && !hasMedia;
  const avatarSize = feedMatch ? 46 : formatChooser ? 26 : compact ? 28 : 38;
  const hasSession = Boolean(draft.sessionId);
  const insetW = feedMatch ? trainingFeedInsetWidth(cardW) : trainingInsetMediaWidth(cardW);
  const insetH =
    hasMedia || showChooserMediaPlaceholder
      ? feedMatch
        ? trainingFeedInsetHeight(insetW)
        : trainingInsetMediaHeight(insetW, {
            maxHeight: formatChooser
              ? Math.min(trainingFeedInsetHeight(insetW), 72)
              : previewMode && fullBleed
                ? Math.round(windowHeight * TRAINING_INSET_MEDIA.maxHeightRatio)
                : compact
                  ? 140
                  : undefined,
          })
      : 0;
  const maxExercisePreview =
    feedMatch && hasMedia ? 1 : formatChooser ? 2 : compact || isEmbedded ? 2 : 3;
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

  const captionBlock = (
    <Pressable
      onPress={editorMode ? onPressEditCaption : undefined}
      disabled={!editorMode || !onPressEditCaption}
      style={editorMode && !feedMatch ? styles.captionEditable : null}
    >
      {previewText ? (
        <Text
          style={[
            feedMatch ? postCardStyles.content : styles.caption,
            compact ? styles.captionCompact : null,
            formatChooser ? styles.captionChooser : null,
            feedMatch && hasMedia ? styles.captionClamp : null,
          ]}
          numberOfLines={
            formatChooser ? 1 : feedMatch && hasMedia ? 2 : compact ? 2 : undefined
          }
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          {previewText}
        </Text>
      ) : (
        <Text
          style={[
            styles.captionPlaceholder,
            compact ? styles.captionCompact : null,
            feedMatch ? styles.captionPlaceholderFeed : null,
          ]}
          numberOfLines={compact ? 1 : undefined}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          {editorMode ? "Toca para comentar el entreno…" : compact ? "Comentario del entreno…" : "Añade un comentario sobre el entreno…"}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View
      style={previewCardShellStyle({
        cardWidth: cardW,
        fullBleed,
        isEmbedded,
        embedded,
        feedMatch,
        trainingAccent: feedMatch,
      })}
    >
      <PostPreviewCardHeader
        draft={draft}
        compact={compact}
        avatarSize={avatarSize}
        metaSuffix=" · Training · ahora"
        feedMatch={feedMatch}
      />

      <View
        style={[
          feedMatch ? postCardStyles.actionBarPad : null,
          !feedMatch && !formatChooser ? styles.actions : null,
          compact && !feedMatch && !formatChooser ? styles.actionsCompact : null,
          !hasMedia && !feedMatch && !formatChooser ? styles.actionsAfterHead : null,
          editorMode ? styles.actionsDim : null,
        ]}
        pointerEvents={editorMode ? "none" : "auto"}
      >
        {feedMatch || formatChooser ? (
          <PostActionBar
            liked={false}
            likesCount={0}
            commentsCount={0}
            onToggleLike={() => {}}
            onPressComment={() => {}}
            saved={false}
            onToggleSave={() => {}}
            compact={compact || isEmbedded || formatChooser}
          />
        ) : (
          <>
            {editorMode ? (
              <Text style={styles.previewHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Vista previa del feed
              </Text>
            ) : null}
            <Text style={[styles.actionIcon, compact ? styles.actionIconCompact : null]}>♡</Text>
            <Text style={[styles.actionIcon, compact ? styles.actionIconCompact : null]}>💬</Text>
          </>
        )}
      </View>

      <View style={feedMatch ? postCardStyles.bodyPad : styles.legacyBody}>
        {captionBlock}
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
          compact={feedMatch ? false : compact || isEmbedded || formatChooser}
          chooserMini={formatChooser}
          onPressSession={onPressViewSession}
          onPressLinkSession={onPressLinkSession}
          showViewFullCta={
            !formatChooser && (showViewFullCta || previewMode || Boolean(onPressViewSession))
          }
          mediaLabel={
            hasMedia
              ? draft.imageUris.length > 1
                ? `Fotos del entreno · ${draft.imageUris.length}`
                : "Foto del entreno"
              : undefined
          }
          mediaInsetStyle={
            feedMatch
              ? [styles.mediaInsetFeed, { width: insetW }]
              : formatChooser
                ? styles.mediaInsetChooser
                : { paddingHorizontal: TRAINING_INSET_MEDIA.horizontalPad }
          }
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
            ) : showChooserMediaPlaceholder ? (
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
                <PostPreviewMediaPlaceholder
                  width={insetW}
                  height={insetH}
                  gradientId="previewFormatChooserTraining"
                  format="training"
                  minimal
                  label="Foto opcional"
                  style={styles.chooserMediaPlaceholder}
                />
              </View>
            ) : undefined
          }
          showAddMediaPrompt={editorMode && previewMode && !hasMedia && Boolean(onPressEditMedia)}
          onPressAddMedia={onPressAddMedia ?? onPressEditMedia}
          addMediaHint={`Hasta ${maxImageFiles} imágenes`}
        />
      </View>

      {editorMode && feedMatch ? (
        <Text style={styles.previewHintFeed} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Vista previa del feed
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  legacyBody: {
    gap: 0,
  },
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
  previewHintFeed: {
    ...postPreviewCardStyles.previewHint,
    paddingVertical: 10,
    paddingBottom: 14,
    backgroundColor: "#0a0a0c",
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
  captionClamp: {
    marginBottom: 0,
  },
  captionCompact: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 10,
    paddingTop: 2,
  },
  captionChooser: {
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 2,
  },
  captionPlaceholder: {
    color: AUTH.faint,
    fontSize: 14,
    fontStyle: "italic",
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  captionPlaceholderFeed: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  mediaInsetFeed: {
    alignSelf: "center",
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  mediaFrame: {
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: "#141416",
  },
  mediaInsetChooser: {
    paddingHorizontal: 6,
    paddingTop: 2,
    paddingBottom: 4,
  },
  chooserMediaPlaceholder: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: "rgba(115, 115, 115, 0.28)",
  },
});
