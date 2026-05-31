import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { POST_IMAGE_MAX_FILES } from "../../../constants/createPost";
import { CreatePostPreviewMedia } from "./CreatePostPreviewMedia";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { visibilityLabel } from "../../../utils/visibilityStyles";
import { UserAvatar } from "../../ui/UserAvatar";
import { PostSessionAttachment } from "../PostSessionAttachment";
import {
  POST_PREVIEW_CARD,
  shouldShowPreviewMediaPlaceholder,
} from "./postPreviewTheme";
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
  const cardW = layoutWidth ?? (fullBleed ? windowWidth : windowWidth - 32);
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
      style={[
        styles.card,
        {
          width: cardW,
          borderColor: POST_PREVIEW_CARD.border,
          backgroundColor: POST_PREVIEW_CARD.background,
        },
        fullBleed && !isEmbedded ? styles.cardBleed : null,
        isEmbedded && !embedded ? styles.cardEmbedded : null,
        embedded ? styles.cardFrameless : null,
      ]}
    >
      <View style={[styles.head, compact ? styles.headCompact : null]}>
        <UserAvatar src={draft.avatarUrl} username={draft.username} size={avatarSize} />
        <View style={styles.headMeta}>
          <Text
            style={[styles.user, compact ? styles.userCompact : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            numberOfLines={1}
          >
            @{draft.username}
          </Text>
          <Text style={[styles.meta, compact ? styles.metaCompact : null]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {visibilityLabel(draft.visibility)} · Training · ahora
          </Text>
        </View>
      </View>

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

      {hasSession ? (
        <PostSessionAttachment
          workoutTitle={draft.workoutTitle}
          performedAt={draft.sessionPerformedAt}
          sessionNotes={draft.sessionNotes}
          metrics={{
            completedSets: draft.sessionCompletedSets,
            totalSets: draft.sessionTotalSets,
            completedExercises: draft.sessionCompletedExercises,
            totalExercises: draft.sessionTotalExercises,
          }}
          linked={previewMode}
          compact={false}
          onPress={onPressViewSession}
          showViewFullCta={showViewFullCta || previewMode || Boolean(onPressViewSession)}
          exercisePreviews={exercisePreviews}
          moreExercisesCount={moreExercisesCount}
        />
      ) : (
        <PostSessionAttachment
          empty
          compact={compact || isEmbedded}
          onPressLink={onPressLinkSession}
        />
      )}

      {hasMedia ? (
        <View style={[styles.mediaInset, compact ? styles.mediaInsetCompact : null]}>
          <Text style={styles.mediaInsetLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {draft.imageUris.length > 1
              ? `Fotos del entreno · ${draft.imageUris.length}`
              : "Foto del entreno"}
          </Text>
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
        </View>
      ) : editorMode && previewMode && onPressEditMedia ? (
        <Pressable
          onPress={onPressAddMedia ?? onPressEditMedia}
          style={[styles.mediaInset, styles.mediaInsetAdd]}
        >
          <Text style={styles.mediaInsetAddTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Añadir fotos (opcional)
          </Text>
          <Text style={styles.mediaInsetAddSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Hasta {maxImageFiles} imágenes
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: "hidden",
  },
  cardBleed: {
    marginHorizontal: 0,
    borderLeftWidth: 1,
    borderRightWidth: 0,
  },
  cardEmbedded: {
    borderRadius: 12,
  },
  cardFrameless: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headCompact: {
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headMeta: { flex: 1, gap: 2 },
  user: { color: AUTH.neutral100, fontSize: 14, fontWeight: "700" },
  userCompact: { fontSize: 13 },
  meta: { color: POST_PREVIEW_CARD.metaColor, fontSize: 11, fontWeight: "500" },
  metaCompact: { fontSize: 10 },
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    color: AUTH.faint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    textAlign: "center",
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
  mediaInset: {
    paddingHorizontal: TRAINING_INSET_MEDIA.horizontalPad,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  mediaInsetCompact: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  mediaInsetLabel: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
  },
  mediaFrame: {
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: "#141416",
  },
  mediaInsetAdd: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(212, 175, 55, 0.35)",
    borderRadius: 12,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  mediaInsetAddTitle: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  mediaInsetAddSub: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
