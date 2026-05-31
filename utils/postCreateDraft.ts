import AsyncStorage from "@react-native-async-storage/async-storage";
import { POST_CREATE_DRAFT_KEY } from "../constants/storageKeys";
import type { PostVisibility } from "../constants/createPost";
import type { PostFormat } from "../constants/postFormat";
import { parsePostFormat } from "../constants/postFormat";

export type PostCreateDraftStored = {
  format: PostFormat;
  content: string;
  visibility: PostVisibility;
  imageUris: string[];
  sessionId: string | null;
  sessionWorkoutTitle: string | null;
  savedAt: string;
};

function draftKey(userId: string, format: PostFormat) {
  return `${POST_CREATE_DRAFT_KEY}:${userId}:${format}`;
}

export async function loadPostCreateDraft(
  userId: string,
  format: PostFormat
): Promise<PostCreateDraftStored | null> {
  try {
    const raw = await AsyncStorage.getItem(draftKey(userId, format));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PostCreateDraftStored & {
      workoutId?: string | null;
      workoutTitle?: string | null;
    };
    if (typeof parsed.content !== "string" || !parsed.visibility) return null;
    const sessionId =
      typeof parsed.sessionId === "string"
        ? parsed.sessionId
        : typeof parsed.workoutId === "string"
          ? parsed.workoutId
          : null;
    return {
      format: parsePostFormat(parsed.format, format),
      content: parsed.content,
      visibility: parsed.visibility,
      imageUris: Array.isArray(parsed.imageUris)
        ? parsed.imageUris.filter((u): u is string => typeof u === "string")
        : [],
      sessionId,
      sessionWorkoutTitle:
        typeof parsed.sessionWorkoutTitle === "string"
          ? parsed.sessionWorkoutTitle
          : typeof parsed.workoutTitle === "string"
            ? parsed.workoutTitle
            : null,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return null;
  }
}

export async function savePostCreateDraft(userId: string, draft: PostCreateDraftStored): Promise<void> {
  try {
    await AsyncStorage.setItem(draftKey(userId, draft.format), JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export async function clearPostCreateDraft(userId: string, format: PostFormat): Promise<void> {
  try {
    await AsyncStorage.removeItem(draftKey(userId, format));
  } catch {
    /* ignore */
  }
}
