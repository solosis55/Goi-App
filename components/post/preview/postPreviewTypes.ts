import type { PostVisibility } from "../../../constants/createPost";
import type { PostFormat } from "../../../constants/postFormat";
import type { SessionExercisePreview } from "../../../utils/sessionExercisePreview";
import type { WorkoutSessionSnapshot } from "../../../types/workoutSessionSnapshot";

export type PostPreviewDraft = {
  format: PostFormat;
  username: string;
  avatarUrl?: string | null;
  content: string;
  visibility: PostVisibility;
  imageUris: string[];
  workoutTitle: string | null;
  sessionId?: string | null;
  sessionPerformedAt?: string | null;
  sessionNotes?: string | null;
  sessionCompletedSets?: number | null;
  sessionTotalSets?: number | null;
  sessionCompletedExercises?: number | null;
  sessionTotalExercises?: number | null;
  sessionExercisePreviews?: SessionExercisePreview[];
  sessionMoreExercisesCount?: number;
  sessionSnapshot?: WorkoutSessionSnapshot | null;
};
