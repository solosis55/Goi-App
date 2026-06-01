import type { Post } from "../types/post";
import type { PostPreviewDraft } from "../components/post/preview/postPreviewTypes";
import { resolveSessionExercisePreviews } from "./sessionExercisePreview";

/** Draft para la hoja de preview Training (desde post publicado o borrador del editor). */
export function buildTrainingPreviewDraft(
  source: PostPreviewDraft | Post,
  viewer?: { username?: string; avatarUrl?: string | null }
): PostPreviewDraft {
  if ("format" in source && "imageUris" in source) {
    return {
      ...source,
      format: "training",
      imageUris: [],
    };
  }
  const post = source;
  const sessionExercisePreviews = resolveSessionExercisePreviews({
    previews: post.sessionExercisePreviews,
  });
  return {
    format: "training",
    username: viewer?.username ?? post.authorUsername,
    avatarUrl: viewer?.avatarUrl ?? post.authorAvatarUrl,
    content: post.content,
    visibility: post.visibility ?? "public",
    imageUris: [],
    workoutTitle: post.sessionWorkoutTitle ?? null,
    sessionId: post.sessionId,
    sessionPerformedAt: post.sessionPerformedAt,
    sessionExercisePreviews,
    sessionMoreExercisesCount: post.sessionMoreExercisesCount,
    sessionCompletedSets: post.sessionCompletedSets,
    sessionTotalSets: post.sessionTotalSets,
    sessionCompletedExercises: post.sessionCompletedExercises,
    sessionTotalExercises: post.sessionTotalExercises,
  };
}
