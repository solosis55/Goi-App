import { useCallback, useMemo, useState } from "react";
import { createPost } from "../api/posts";
import { ApiError } from "../api/client";
import { POST_IMAGE_MAX_FILES, type PostVisibility } from "../constants/createPost";
import { uriToPostImageDataUrl, pickPostImages } from "../utils/postImage";
import { validateCreatePost } from "../utils/createPostValidation";

export type PendingPostImage = {
  id: string;
  uri: string;
  dataUrl: string;
};

function newImageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useCreatePostForm() {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [images, setImages] = useState<PendingPostImage[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useMemo(
    () => validateCreatePost(content, images.length),
    [content, images.length]
  );

  const addImages = useCallback(async () => {
    if (mediaBusy || images.length >= POST_IMAGE_MAX_FILES) return;
    setSubmitError(null);
    const slots = POST_IMAGE_MAX_FILES - images.length;
    const picked = await pickPostImages(slots);
    if (!picked.ok) {
      if ("error" in picked) setSubmitError(picked.error);
      return;
    }

    setMediaBusy(true);
    try {
      const next: PendingPostImage[] = [];
      for (const uri of picked.uris) {
        const dataUrl = await uriToPostImageDataUrl(uri);
        next.push({ id: newImageId(), uri, dataUrl });
      }
      setImages((prev) => [...prev, ...next].slice(0, POST_IMAGE_MAX_FILES));
    } catch {
      setSubmitError("No se pudo procesar una o más imágenes.");
    } finally {
      setMediaBusy(false);
    }
  }, [images.length, mediaBusy]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSubmitError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!validation.canSubmit || submitting) {
      return { ok: false as const };
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const trimmed = content.trim();
      await createPost({
        content: trimmed,
        workoutId: null,
        visibility,
        ...(images.length > 0
          ? { media: images.map((img) => ({ type: "image" as const, url: img.dataUrl })) }
          : {}),
      });
      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo publicar.";
      setSubmitError(msg);
      return { ok: false as const };
    } finally {
      setSubmitting(false);
    }
  }, [content, images, submitting, validation.canSubmit, visibility]);

  const hasDraft = content.trim().length > 0 || images.length > 0 || visibility !== "public";

  return {
    content,
    setContent,
    visibility,
    setVisibility,
    images,
    mediaBusy,
    submitting,
    submitError,
    validation,
    hasDraft,
    addImages,
    removeImage,
    submit,
    setSubmitError,
  };
}
