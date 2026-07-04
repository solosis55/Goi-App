import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SessionExercisePreview } from "../../utils/sessionExercisePreview";
import {
  PostSessionAttachment,
  type PostSessionAttachmentMetrics,
} from "./PostSessionAttachment";

export type PostTrainingBodyProps = {
  sessionId?: string | null;
  workoutTitle?: string | null;
  performedAt?: string | null;
  sessionNotes?: string | null;
  metrics?: PostSessionAttachmentMetrics | null;
  exercisePreviews?: SessionExercisePreview[];
  moreExercisesCount?: number;
  onPressSession?: () => void;
  onPressLinkSession?: () => void;
  compact?: boolean;
  /** Selector de formato: tarjeta de sesión aún más compacta. */
  chooserMini?: boolean;
  linked?: boolean;
  showViewFullCta?: boolean;
  mediaLabel?: string;
  mediaSlot?: ReactNode;
  mediaInsetStyle?: StyleProp<ViewStyle>;
  showAddMediaPrompt?: boolean;
  onPressAddMedia?: () => void;
  addMediaHint?: string;
};

/**
 * Bloque compartido sesión + fotos insertadas en posts Training (feed y editor).
 */
export function PostTrainingBody({
  sessionId,
  workoutTitle,
  performedAt,
  sessionNotes,
  metrics,
  exercisePreviews = [],
  moreExercisesCount = 0,
  onPressSession,
  onPressLinkSession,
  compact = false,
  chooserMini = false,
  linked = false,
  showViewFullCta = false,
  mediaLabel,
  mediaSlot,
  mediaInsetStyle,
  showAddMediaPrompt = false,
  onPressAddMedia,
  addMediaHint,
}: PostTrainingBodyProps) {
  return (
    <>
      {sessionId ? (
        <PostSessionAttachment
          workoutTitle={workoutTitle}
          performedAt={performedAt}
          sessionNotes={sessionNotes}
          metrics={metrics}
          exercisePreviews={exercisePreviews}
          moreExercisesCount={moreExercisesCount}
          linked={linked}
          compact={compact}
          chooserMini={chooserMini}
          onPress={onPressSession}
          showViewFullCta={showViewFullCta || Boolean(onPressSession)}
        />
      ) : onPressLinkSession != null ? (
        <PostSessionAttachment empty compact={compact} chooserMini={chooserMini} onPressLink={onPressLinkSession} />
      ) : null}

      {mediaSlot ? (
        <View style={[styles.mediaInset, compact ? styles.mediaInsetCompact : null, mediaInsetStyle]}>
          {mediaLabel ? (
            <Text style={styles.mediaInsetLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {mediaLabel}
            </Text>
          ) : null}
          {mediaSlot}
        </View>
      ) : showAddMediaPrompt && onPressAddMedia ? (
        <Pressable
          onPress={onPressAddMedia}
          style={[styles.mediaInset, styles.mediaInsetAdd, mediaInsetStyle]}
        >
          <Text style={styles.mediaInsetAddTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Añadir fotos (opcional)
          </Text>
          {addMediaHint ? (
            <Text style={styles.mediaInsetAddSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {addMediaHint}
            </Text>
          ) : null}
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  mediaInset: {
    paddingHorizontal: 14,
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
