import AsyncStorage from "@react-native-async-storage/async-storage";
import { POST_PUBLISH_QUEUE_KEY } from "../constants/storageKeys";
import type { PostVisibility } from "../constants/createPost";
import type { PostFormat } from "../constants/postFormat";
import { parsePostFormat } from "../constants/postFormat";

export type PendingPostPublish = {
  format: PostFormat;
  content: string;
  visibility: PostVisibility;
  sessionId: string | null;
  sessionWorkoutTitle: string | null;
  imageDataUrls: string[];
  failedAt: string;
  errorMessage: string;
};

export async function loadPendingPostPublish(userId: string): Promise<PendingPostPublish | null> {
  try {
    const raw = await AsyncStorage.getItem(`${POST_PUBLISH_QUEUE_KEY}:${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPostPublish & {
      workoutId?: string | null;
      workoutTitle?: string | null;
    };
    if (typeof parsed.content !== "string") return null;
    return {
      format: parsePostFormat(parsed.format, "standard"),
      content: parsed.content,
      visibility: parsed.visibility,
      sessionId:
        typeof parsed.sessionId === "string"
          ? parsed.sessionId
          : typeof parsed.workoutId === "string"
            ? parsed.workoutId
            : null,
      sessionWorkoutTitle:
        typeof parsed.sessionWorkoutTitle === "string"
          ? parsed.sessionWorkoutTitle
          : typeof parsed.workoutTitle === "string"
            ? parsed.workoutTitle
            : null,
      imageDataUrls: Array.isArray(parsed.imageDataUrls) ? parsed.imageDataUrls : [],
      failedAt: parsed.failedAt,
      errorMessage: parsed.errorMessage,
    };
  } catch {
    return null;
  }
}

export async function savePendingPostPublish(userId: string, pending: PendingPostPublish): Promise<void> {
  try {
    await AsyncStorage.setItem(`${POST_PUBLISH_QUEUE_KEY}:${userId}`, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export async function clearPendingPostPublish(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${POST_PUBLISH_QUEUE_KEY}:${userId}`);
  } catch {
    /* ignore */
  }
}
