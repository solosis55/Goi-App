import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PostPreviewDraft } from "./preview/postPreviewTypes";
import { PostSessionAttachment } from "./PostSessionAttachment";

type PublicationLinkedSessionBodyProps = {
  draft: PostPreviewDraft;
  compact?: boolean;
  onPressViewSession?: () => void;
};

/** Bloque de entreno vinculado dentro de una publicación estándar (sustituye el caption). */
export function PublicationLinkedSessionBody({
  draft,
  compact = false,
  onPressViewSession,
}: PublicationLinkedSessionBodyProps) {
  if (!draft.sessionId) return null;

  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null]}>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Entreno vinculado
      </Text>
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
        exercisePreviews={draft.sessionExercisePreviews}
        moreExercisesCount={draft.sessionMoreExercisesCount ?? 0}
        linked
        compact={compact}
        onPress={onPressViewSession}
        showViewFullCta={Boolean(onPressViewSession)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 4,
  },
  wrapCompact: {
    paddingBottom: 2,
  },
  label: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.35,
    textTransform: "uppercase",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
});
