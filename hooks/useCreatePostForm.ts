import { useCallback, useEffect, useMemo, useState } from "react";
import { POST_BODY_MAX, type PostVisibility } from "../constants/createPost";
import type { PostFormat } from "../constants/postFormat";
import { validateCreatePost } from "../utils/createPostValidation";
import { usePostDraftPersistence } from "./usePostDraftPersistence";
import { usePostImageAssets } from "./usePostImageAssets";
import { usePostSessionLink } from "./usePostSessionLink";
import { usePostSubmit } from "./usePostSubmit";

export type { SessionSelectMeta } from "./createPost/types";
export type { PendingPostImage } from "./createPost/postImageUtils";

export function useCreatePostForm(
  userId: string | undefined,
  postFormat: PostFormat,
  initialVisibility: PostVisibility = "public",
  initialSessionId: string | null = null,
  legacyWorkoutId: string | null = null
) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(initialVisibility);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    setVisibility(initialVisibility);
  }, [initialVisibility]);

  const imageAssets = usePostImageAssets(setImageError);
  const sessionLink = usePostSessionLink(postFormat, setContent);

  const draft = usePostDraftPersistence({
    userId,
    postFormat,
    initialVisibility,
    initialSessionId,
    legacyWorkoutId,
    content,
    visibility,
    images: imageAssets.images,
    sessionId: sessionLink.sessionId,
    sessionWorkoutTitle: sessionLink.sessionWorkoutTitle,
    setContent,
    setVisibility,
    setImages: imageAssets.setImages,
    restoreSessionBasics: sessionLink.restoreSessionBasics,
    applyLinkedSession: sessionLink.applyLinkedSession,
    setSuggestedSessionId: sessionLink.setSuggestedSessionId,
  });

  const validation = useMemo(
    () => validateCreatePost(content, imageAssets.images.length, postFormat),
    [content, imageAssets.images.length, postFormat]
  );

  const submitHook = usePostSubmit({
    userId,
    postFormat,
    content,
    visibility,
    sessionId: sessionLink.sessionId,
    sessionWorkoutTitle: sessionLink.sessionWorkoutTitle,
    images: imageAssets.images,
    canSubmit: validation.canSubmit,
    clearDraftAfterSubmit: draft.clearDraftAfterSubmit,
    queuePendingPublish: draft.queuePendingPublish,
  });

  useEffect(() => {
    if (!sessionLink.sessionId || draft.restoringDraft || !draft.hydrated) return;
    if (sessionLink.sessionSnapshot?.blocks?.length) return;
    let cancelled = false;
    void (async () => {
      try {
        const meta = await sessionLink.enrichSessionMeta(sessionLink.sessionId!, {
          workoutTitle: sessionLink.sessionWorkoutTitle ?? "",
          performedAt: sessionLink.sessionPerformedAt ?? new Date().toISOString(),
          notes: sessionLink.sessionNotes ?? undefined,
          snapshot: sessionLink.sessionSnapshot,
        });
        if (cancelled || !meta.snapshot?.blocks?.length) return;
        sessionLink.applySessionFields(sessionLink.sessionId!, meta);
      } catch {
        /* preview puede usar notes como fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    sessionLink.sessionId,
    sessionLink.sessionSnapshot,
    sessionLink.sessionWorkoutTitle,
    sessionLink.sessionPerformedAt,
    sessionLink.sessionNotes,
    draft.restoringDraft,
    draft.hydrated,
    sessionLink.enrichSessionMeta,
    sessionLink.applySessionFields,
  ]);

  const charProgress = useMemo(
    () => Math.min(1, validation.charCount / POST_BODY_MAX),
    [validation.charCount]
  );

  const photoOnlyOk = imageAssets.images.length > 0 && validation.canSubmit;

  const hasDraft =
    content.trim().length > 0 ||
    imageAssets.images.length > 0 ||
    sessionLink.sessionId != null ||
    visibility !== draft.initialVisibility;

  const discardDraft = useCallback(async () => {
    await draft.discardDraft(() => {
      setContent("");
      imageAssets.clearImages();
      sessionLink.clearSession();
      submitHook.setSubmitError(null);
      setImageError(null);
    });
  }, [draft, imageAssets, sessionLink, submitHook]);

  const removeImage = useCallback(
    (id: string) => {
      imageAssets.removeImage(id);
      submitHook.setSubmitError(null);
      setImageError(null);
    },
    [imageAssets, submitHook]
  );

  const appendUris = useCallback(
    async (uris: string[], cropSquare: boolean) => {
      submitHook.setSubmitError(null);
      setImageError(null);
      await imageAssets.appendUris(uris, cropSquare);
    },
    [imageAssets, submitHook]
  );

  const toggleImageCrop = useCallback(
    async (id: string) => {
      submitHook.setSubmitError(null);
      await imageAssets.toggleImageCrop(id);
    },
    [imageAssets, submitHook]
  );

  const submitError = submitHook.submitError ?? imageError;

  return {
    content,
    setContent,
    visibility,
    setVisibility,
    postFormat,
    sessionId: sessionLink.sessionId,
    sessionWorkoutTitle: sessionLink.sessionWorkoutTitle,
    sessionPerformedAt: sessionLink.sessionPerformedAt,
    sessionNotes: sessionLink.sessionNotes,
    sessionCompletedSets: sessionLink.sessionCompletedSets,
    sessionTotalSets: sessionLink.sessionTotalSets,
    sessionCompletedExercises: sessionLink.sessionCompletedExercises,
    sessionTotalExercises: sessionLink.sessionTotalExercises,
    sessionSnapshot: sessionLink.sessionSnapshot,
    suggestedSessionId: sessionLink.suggestedSessionId,
    selectSession: sessionLink.selectSession,
    images: imageAssets.images,
    mediaBusy: imageAssets.mediaBusy,
    submitting: submitHook.submitting,
    submitError,
    validation,
    charProgress,
    photoOnlyOk,
    hasDraft,
    draftBanner: draft.draftBanner,
    restoringDraft: draft.restoringDraft,
    pendingPublish: draft.pendingPublish,
    dismissDraftBanner: draft.dismissDraftBanner,
    discardDraft,
    dismissPendingPublish: draft.dismissPendingPublish,
    pickImages: imageAssets.pickImages,
    pickCamera: imageAssets.pickCamera,
    appendUris,
    toggleImageCrop,
    removeImage,
    moveImage: imageAssets.moveImage,
    submit: submitHook.submit,
    setSubmitError: submitHook.setSubmitError,
    defaultVisibility: draft.initialVisibility,
  };
}
