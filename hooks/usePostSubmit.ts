import { useCallback, useState } from "react";
import { createPost } from "../api/posts";
import { ApiError } from "../api/client";
import type { PostFormat } from "../constants/postFormat";
import type { PostVisibility } from "../constants/createPost";
import type { PendingPostPublish } from "../utils/postPublishQueue";
import type { PostImageUploadFile } from "../utils/postImage";
import {
  pendingImageEntriesFromImages,
  type PendingPostImage,
} from "./createPost/postImageUtils";

type UsePostSubmitOptions = {
  userId: string | undefined;
  postFormat: PostFormat;
  content: string;
  visibility: PostVisibility;
  sessionId: string | null;
  sessionWorkoutTitle: string | null;
  images: PendingPostImage[];
  canSubmit: boolean;
  clearDraftAfterSubmit: () => Promise<void>;
  queuePendingPublish: (pending: PendingPostPublish) => Promise<void>;
};

export function usePostSubmit({
  userId,
  postFormat,
  content,
  visibility,
  sessionId,
  sessionWorkoutTitle,
  images,
  canSubmit,
  clearDraftAfterSubmit,
  queuePendingPublish,
}: UsePostSubmitOptions) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (!canSubmit || submitting) {
      return { ok: false as const };
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const trimmed = content.trim();
      const uploadFiles = images
        .map((img) => img.uploadFile)
        .filter((f): f is PostImageUploadFile => Boolean(f));
      await createPost({
        content: trimmed,
        format: postFormat,
        sessionId,
        visibility,
        ...(uploadFiles.length > 0
          ? { uploadFiles }
          : images.some((img) => img.dataUrl)
            ? {
                media: images
                  .filter((img) => img.dataUrl)
                  .map((img) => ({ type: "image" as const, url: img.dataUrl })),
              }
            : {}),
      });
      await clearDraftAfterSubmit();
      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo publicar.";
      setSubmitError(msg);
      const isNetwork =
        e instanceof ApiError
          ? e.status === 0 || e.status >= 500
          : false;
      if (userId && isNetwork) {
        await queuePendingPublish({
          format: postFormat,
          content: content.trim(),
          visibility,
          sessionId,
          sessionWorkoutTitle,
          imageEntries: pendingImageEntriesFromImages(images),
          imageDataUrls: images.filter((i) => i.dataUrl).map((i) => i.dataUrl),
          failedAt: new Date().toISOString(),
          errorMessage: msg,
        });
      }
      return { ok: false as const };
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    submitting,
    content,
    images,
    userId,
    visibility,
    postFormat,
    sessionId,
    sessionWorkoutTitle,
    clearDraftAfterSubmit,
    queuePendingPublish,
  ]);

  return {
    submitting,
    submitError,
    setSubmitError,
    submit,
  };
}
