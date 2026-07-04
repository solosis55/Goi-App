import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { POST_IMAGE_MAX_FILES } from "../../../constants/createPost";
import { CreatePostPreviewMedia } from "./CreatePostPreviewMedia";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { PostActionBar } from "../../feed/PostActionBar";
import { postCardStyles } from "../../feed/postCardStyles";
import { PublicationLinkedSessionBody } from "../PublicationLinkedSessionBody";
import { PostPreviewMediaPlaceholder } from "./PostPreviewMediaPlaceholder";
import { PostPreviewCardHeader } from "./PostPreviewCardHeader";
import { postPreviewCardStyles, previewCardShellStyle } from "./postPreviewCardStyles";
import { resolvePreviewCardWidth } from "./postPreviewLayout";
import {
  previewMediaHeight,
  shouldShowPreviewMediaPlaceholder,
} from "./postPreviewTheme";
import type { PostPreviewDraft } from "./postPreviewTypes";

type PostFeedPreviewStandardProps = {
  draft: PostPreviewDraft;
  fullBleed?: boolean;
  layoutWidth?: number;
  compact?: boolean;
  embedded?: boolean;
  previewMode?: boolean;
  showSessionInline?: boolean;
  sessionPreviewActive?: boolean;
  onPressSessionPreview?: () => void;
  onPressViewSession?: () => void;
  editorMode?: boolean;
  onPressEditMedia?: () => void;
  onPressAddMedia?: () => void;
  onPressEditCaption?: () => void;
  maxImageFiles?: number;
  /** Selector de formato: tarjeta completa visible (foto cuadrada a ancho de tarjeta). */
  formatChooser?: boolean;
};

/** Vista previa feed — layout tipo Instagram (foto → acciones → caption). */
export function PostFeedPreviewStandard({
  draft,
  fullBleed = true,
  layoutWidth,
  compact = false,
  embedded = false,
  previewMode = false,
  showSessionInline = false,
  sessionPreviewActive = false,
  onPressSessionPreview,
  onPressViewSession,
  editorMode = false,
  onPressEditMedia,
  onPressAddMedia,
  onPressEditCaption,
  maxImageFiles = POST_IMAGE_MAX_FILES,
  formatChooser = false,
}: PostFeedPreviewStandardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isEmbedded = embedded || layoutWidth != null;
  const feedMatch = previewMode && !formatChooser;
  const cardW = resolvePreviewCardWidth(windowWidth, { fullBleed, layoutWidth });
  const mediaW = cardW;
  const hasMedia = draft.imageUris.length > 0;
  const avatarSize = feedMatch ? 46 : compact && !formatChooser ? 28 : 40;
  const showPlaceholder =
    shouldShowPreviewMediaPlaceholder("standard", hasMedia) &&
    (compact || isEmbedded || previewMode) &&
    !formatChooser;
  const captionText = draft.content.trim();
  const showCaptionPlaceholder = !captionText && (previewMode || compact) && !showSessionInline && !formatChooser;
  const mediaSizingCompact = (compact || isEmbedded) && !previewMode && !formatChooser;
  const mediaHeight = feedMatch
    ? mediaW
    : previewMediaHeight(mediaW, "standard", mediaSizingCompact, {
        fullBleed: (previewMode && fullBleed) || formatChooser,
        maxHeight: formatChooser ? mediaW : previewMode && fullBleed ? mediaW : undefined,
      });

  return (
    <View
      style={previewCardShellStyle({
        cardWidth: cardW,
        fullBleed,
        isEmbedded,
        embedded,
        feedMatch,
      })}
    >
      <PostPreviewCardHeader
        draft={draft}
        compact={compact}
        avatarSize={avatarSize}
        metaSuffix=" · ahora"
        headVariant="roomy"
        userFontSize={compact ? undefined : 15}
        feedMatch={feedMatch}
      />

      {formatChooser ? (
        <PostPreviewMediaPlaceholder
          width={mediaW}
          height={mediaHeight}
          gradientId="previewFormatChooserStandard"
          format="standard"
          minimal
          label="Foto"
        />
      ) : hasMedia ? (
        <CreatePostPreviewMedia
          imageUris={draft.imageUris}
          width={mediaW}
          height={mediaHeight}
          layout="bleed"
          editorMode={editorMode}
          maxFiles={maxImageFiles}
          onPressEdit={onPressEditMedia}
          onPressAdd={onPressAddMedia}
        />
      ) : showPlaceholder ? (
        <Pressable
          onPress={editorMode ? onPressEditMedia : undefined}
          disabled={!editorMode || !onPressEditMedia}
          style={{ position: "relative" }}
        >
          <PostPreviewMediaPlaceholder
            width={mediaW}
            gradientId="previewStandardMedia"
            compact={mediaSizingCompact}
            format="standard"
            backgroundOnly={editorMode}
          />
          {editorMode ? (
            <View style={[styles.editZoneCta, { width: mediaW, height: mediaHeight }]}>
              <View style={styles.editZoneIconRing}>
                <Text style={styles.editZoneIcon} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  +
                </Text>
              </View>
              <Text style={styles.editZoneCtaTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Añadir foto
              </Text>
              <Text style={styles.editZoneCtaSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Obligatoria · hasta {maxImageFiles} fotos
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}

      <View style={[editorMode ? styles.actionBarDim : null, feedMatch ? postCardStyles.actionBarPad : null]} pointerEvents={editorMode ? "none" : "auto"}>
        <PostActionBar
          compact={compact || isEmbedded}
          liked={false}
          likesCount={0}
          commentsCount={0}
          onToggleLike={() => {}}
          onPressComment={() => {}}
          onToggleSave={() => {}}
          saved={false}
          onPressSessionPreview={onPressSessionPreview}
          sessionPreviewActive={sessionPreviewActive}
        />
      </View>

      <Pressable
        onPress={editorMode ? onPressEditCaption : undefined}
        disabled={!editorMode || !onPressEditCaption || showSessionInline}
        style={[
          feedMatch ? postCardStyles.bodyPad : styles.body,
          compact ? styles.bodyCompact : null,
          editorMode && !feedMatch ? styles.bodyEditable : null,
        ]}
      >
        {showSessionInline && draft.sessionId ? (
          <PublicationLinkedSessionBody
            draft={draft}
            compact={compact}
            onPressViewSession={onPressViewSession}
          />
        ) : showCaptionPlaceholder ? (
          <Text
            style={[styles.captionPlaceholder, compact ? styles.captionCompact : null]}
            numberOfLines={compact ? 2 : undefined}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {editorMode ? "Toca para escribir el pie de foto…" : compact ? "Tu caption aquí…" : "Escribe el pie de foto debajo de los iconos…"}
          </Text>
        ) : captionText ? (
          <Text
            style={[
              feedMatch ? postCardStyles.content : styles.caption,
              compact ? styles.captionCompact : null,
            ]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            numberOfLines={compact ? 3 : undefined}
          >
            {captionText}
          </Text>
        ) : null}
        {editorMode && !showSessionInline && !feedMatch ? (
          <Text style={styles.editCaptionHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Toca para editar texto
          </Text>
        ) : null}
      </Pressable>

      {editorMode && feedMatch ? (
        <Text style={styles.previewHintFeed} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Vista previa del feed
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 14, paddingVertical: 10, paddingBottom: 16 },
  bodyCompact: { paddingHorizontal: 10, paddingVertical: 6, paddingBottom: 12 },
  caption: { color: AUTH.neutral100, fontSize: 14, lineHeight: 20 },
  captionCompact: { fontSize: 12, lineHeight: 17 },
  captionPlaceholder: {
    color: AUTH.faint,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  actionBarDim: { opacity: 0.42 },
  previewHintFeed: {
    ...postPreviewCardStyles.previewHint,
    paddingVertical: 10,
    paddingBottom: 14,
    backgroundColor: "#0a0a0c",
  },
  bodyEditable: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  editZoneCta: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    gap: 6,
  },
  editZoneIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(35, 32, 22, 0.85)",
  },
  editZoneIcon: {
    color: AUTH.gold,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },
  editZoneCtaTitle: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "800",
  },
  editZoneCtaSub: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  editCaptionHint: {
    marginTop: 6,
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "600",
  },
});
