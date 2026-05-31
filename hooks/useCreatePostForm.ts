import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { createPost } from "../api/posts";
import { ApiError } from "../api/client";
import { sessionPostTemplate } from "../constants/createPostPrompts";
import { POST_BODY_MAX, POST_IMAGE_MAX_FILES, type PostVisibility } from "../constants/createPost";
import type { PostFormat } from "../constants/postFormat";
import type { WorkoutSessionSnapshot } from "../types/workoutSessionSnapshot";
import { clearPostCreateDraft, loadPostCreateDraft, savePostCreateDraft } from "../utils/postCreateDraft";
import {
  clearPendingPostPublish,
  loadPendingPostPublish,
  savePendingPostPublish,
  type PendingPostPublish,
} from "../utils/postPublishQueue";
import {
  pickPostImages,
  takePostPhoto,
  uriToPostImageDataUrl,
  type PickPostImagesResult,
} from "../utils/postImage";
import { validateCreatePost } from "../utils/createPostValidation";
import { getWorkoutSession, getWorkoutSessions } from "../api/workoutSessions";
import {
  getLatestSessionIdForUser,
  resolveSessionIdFromWorkoutId,
} from "../utils/sessionLinkSuggest";
import { resolveSessionSnapshotForPreview } from "../utils/deriveSessionSnapshotFromWorkout";


export type SessionSelectMeta = {
  workoutTitle: string;
  performedAt: string;
  notes?: string;
  workoutId?: string;
  snapshot?: WorkoutSessionSnapshot | null;
};

function metricsFromSnapshot(snapshot?: WorkoutSessionSnapshot | null) {
  if (!snapshot) {
    return {
      sessionCompletedSets: null as number | null,
      sessionTotalSets: null as number | null,
      sessionCompletedExercises: null as number | null,
      sessionTotalExercises: null as number | null,
    };
  }
  return {
    sessionCompletedSets: snapshot.completedSets,
    sessionTotalSets: snapshot.totalSets,
    sessionCompletedExercises: snapshot.completedExercises,
    sessionTotalExercises: snapshot.totalExercises,
  };
}

function applySessionMeta(meta: SessionSelectMeta | null | undefined) {
  if (!meta) {
    return {
      sessionWorkoutTitle: null as string | null,
      sessionPerformedAt: null as string | null,
      sessionNotes: null as string | null,
      ...metricsFromSnapshot(null),
    };
  }
  return {
    sessionWorkoutTitle: meta.workoutTitle,
    sessionPerformedAt: meta.performedAt,
    sessionNotes: meta.notes ?? null,
    ...metricsFromSnapshot(meta.snapshot),
  };
}

export type PendingPostImage = {
  id: string;
  uri: string;
  dataUrl: string;
  sourceUri: string;
  cropSquare: boolean;
};

function newImageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function imagesFromUris(uris: string[], cropSquare: boolean): Promise<PendingPostImage[]> {
  const out: PendingPostImage[] = [];
  for (const uri of uris) {
    try {
      const dataUrl = await uriToPostImageDataUrl(uri, { cropSquare });
      out.push({ id: newImageId(), uri: dataUrl, dataUrl, sourceUri: uri, cropSquare });
    } catch {
      /* URI caducada o inaccesible */
    }
  }
  return out;
}

export function useCreatePostForm(
  userId: string | undefined,
  postFormat: PostFormat,
  initialVisibility: PostVisibility = "public",
  initialSessionId: string | null = null,
  legacyWorkoutId: string | null = null
) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(initialVisibility);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [sessionWorkoutTitle, setSessionWorkoutTitle] = useState<string | null>(null);
  const [sessionPerformedAt, setSessionPerformedAt] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string | null>(null);
  const [sessionCompletedSets, setSessionCompletedSets] = useState<number | null>(null);
  const [sessionTotalSets, setSessionTotalSets] = useState<number | null>(null);
  const [sessionCompletedExercises, setSessionCompletedExercises] = useState<number | null>(null);
  const [sessionTotalExercises, setSessionTotalExercises] = useState<number | null>(null);
  const [sessionSnapshot, setSessionSnapshot] = useState<WorkoutSessionSnapshot | null>(null);
  const [suggestedSessionId, setSuggestedSessionId] = useState<string | null>(null);
  const [images, setImages] = useState<PendingPostImage[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftBanner, setDraftBanner] = useState(false);
  const [restoringDraft, setRestoringDraft] = useState(false);
  const [pendingPublish, setPendingPublish] = useState<PendingPostPublish | null>(null);
  const hydratedRef = useRef(false);
  const initialVisibilityRef = useRef(initialVisibility);
  const initialSessionIdRef = useRef(initialSessionId);
  const legacyWorkoutIdRef = useRef(legacyWorkoutId);

  useEffect(() => {
    initialVisibilityRef.current = initialVisibility;
    setVisibility(initialVisibility);
  }, [initialVisibility]);

  useEffect(() => {
    initialSessionIdRef.current = initialSessionId;
    legacyWorkoutIdRef.current = legacyWorkoutId;
    if (initialSessionId && !hydratedRef.current) {
      setSessionId(initialSessionId);
    }
  }, [initialSessionId, legacyWorkoutId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    hydratedRef.current = false;
    void (async () => {
      setRestoringDraft(true);
      try {
        let resolvedInitialSessionId = initialSessionIdRef.current;
        if (!resolvedInitialSessionId && legacyWorkoutIdRef.current) {
          resolvedInitialSessionId = await resolveSessionIdFromWorkoutId(
            userId,
            legacyWorkoutIdRef.current
          );
        }

        const resolveInitialMeta = async () => {
          if (!resolvedInitialSessionId) return getLatestSessionIdForUser(userId);
          try {
            const detail = await getWorkoutSession(resolvedInitialSessionId);
            return {
              sessionId: resolvedInitialSessionId,
              workoutTitle: detail.workoutTitle,
              performedAt: detail.performedAt,
              notes: detail.notes,
              snapshot: detail.snapshot ?? null,
            };
          } catch {
            try {
              const list = await getWorkoutSessions();
              const match = list.find((s) => s.id === resolvedInitialSessionId);
              return {
                sessionId: resolvedInitialSessionId,
                workoutTitle: match?.workoutTitle ?? null,
                performedAt: match?.performedAt ?? null,
                notes: match?.notes ?? null,
                snapshot: match?.snapshot ?? null,
              };
            } catch {
              return {
                sessionId: resolvedInitialSessionId,
                workoutTitle: null,
                performedAt: null,
                notes: null,
                snapshot: null,
              };
            }
          }
        };

        const [draft, pending, latest] = await Promise.all([
          loadPostCreateDraft(userId, postFormat),
          loadPendingPostPublish(userId),
          resolveInitialMeta(),
        ]);

        if (cancelled) return;

        if (pending) {
          setPendingPublish(pending);
          setContent(pending.content);
          setVisibility(pending.visibility);
          setSessionId(pending.sessionId);
          setSessionWorkoutTitle(pending.sessionWorkoutTitle);
          if (pending.imageDataUrls.length > 0) {
            const restored = pending.imageDataUrls.slice(0, POST_IMAGE_MAX_FILES).map((dataUrl, i) => ({
              id: `pending-${i}`,
              uri: dataUrl,
              dataUrl,
              sourceUri: dataUrl,
              cropSquare: true,
            }));
            setImages(restored);
          }
        } else if (draft && draft.format === postFormat) {
          const hasSomething =
            draft.content.trim().length > 0 ||
            draft.imageUris.length > 0 ||
            draft.sessionId != null;
          if (hasSomething) {
            setContent(draft.content);
            setVisibility(draft.visibility);
            setSessionId(draft.sessionId);
            setSessionWorkoutTitle(draft.sessionWorkoutTitle);
            if (draft.imageUris.length > 0) {
              const restored = await imagesFromUris(
                draft.imageUris.slice(0, POST_IMAGE_MAX_FILES),
                true
              );
              if (!cancelled && restored.length > 0) setImages(restored);
            }
            if (!cancelled) setDraftBanner(true);
          }
        }

        if (!cancelled && !pending) {
          const applyLatest = (
            id: string,
            title: string | null,
            performedAt: string | null,
            notes: string | null,
            snapshot: WorkoutSessionSnapshot | null
          ) => {
            setSessionId(id);
            if (title && performedAt) {
              const applied = applySessionMeta({
                workoutTitle: title,
                performedAt,
                notes: notes ?? undefined,
                snapshot,
              });
              setSessionWorkoutTitle(applied.sessionWorkoutTitle);
              setSessionPerformedAt(applied.sessionPerformedAt);
              setSessionNotes(applied.sessionNotes);
              setSessionCompletedSets(applied.sessionCompletedSets);
              setSessionTotalSets(applied.sessionTotalSets);
              setSessionCompletedExercises(applied.sessionCompletedExercises);
              setSessionTotalExercises(applied.sessionTotalExercises);
              setSessionSnapshot(snapshot);
            }
          };

          if (resolvedInitialSessionId) {
            applyLatest(
              resolvedInitialSessionId,
              latest.workoutTitle,
              latest.performedAt,
              latest.notes ?? null,
              latest.snapshot ?? null
            );
          } else if (latest.sessionId && postFormat === "training") {
            setSuggestedSessionId(latest.sessionId);
            if (!draft?.sessionId) {
              applyLatest(
                latest.sessionId,
                latest.workoutTitle,
                latest.performedAt,
                latest.notes ?? null,
                latest.snapshot ?? null
              );
            }
          }
        }
      } finally {
        if (!cancelled) {
          setRestoringDraft(false);
          hydratedRef.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, postFormat]);

  useEffect(() => {
    if (!userId || !hydratedRef.current || pendingPublish) return;
    const t = setTimeout(() => {
      const trimmed = content.trim();
      if (
        !trimmed &&
        images.length === 0 &&
        sessionId == null &&
        visibility === initialVisibilityRef.current
      ) {
        void clearPostCreateDraft(userId, postFormat);
        return;
      }
      void savePostCreateDraft(userId, {
        format: postFormat,
        content,
        visibility,
        imageUris: images.map((img) => img.uri),
        sessionId,
        sessionWorkoutTitle,
        savedAt: new Date().toISOString(),
      });
    }, 700);
    return () => clearTimeout(t);
  }, [userId, postFormat, content, visibility, images, sessionId, sessionWorkoutTitle, pendingPublish]);

  const validation = useMemo(
    () => validateCreatePost(content, images.length, postFormat),
    [content, images.length, postFormat]
  );

  const charProgress = useMemo(
    () => Math.min(1, validation.charCount / POST_BODY_MAX),
    [validation.charCount]
  );

  const photoOnlyOk = images.length > 0 && validation.canSubmit;

  const pickImages = useCallback(async (): Promise<PickPostImagesResult> => {
    if (mediaBusy || images.length >= POST_IMAGE_MAX_FILES) {
      return { ok: false, cancelled: true };
    }
    const slots = POST_IMAGE_MAX_FILES - images.length;
    return pickPostImages(slots);
  }, [images.length, mediaBusy]);

  const pickCamera = useCallback(async (): Promise<PickPostImagesResult> => {
    if (mediaBusy || images.length >= POST_IMAGE_MAX_FILES) {
      return { ok: false, cancelled: true };
    }
    return takePostPhoto();
  }, [images.length, mediaBusy]);

  const appendUris = useCallback(
    async (uris: string[], cropSquare: boolean) => {
      if (!uris.length || mediaBusy) return;
      setSubmitError(null);
      setMediaBusy(true);
      try {
        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => resolve());
        });
        const next = await imagesFromUris(uris, cropSquare);
        if (next.length === 0) {
          setSubmitError("No se pudo procesar una o más imágenes.");
          return;
        }
        setImages((prev) => [...prev, ...next].slice(0, POST_IMAGE_MAX_FILES));
      } finally {
        setMediaBusy(false);
      }
    },
    [mediaBusy]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSubmitError(null);
  }, []);

  const toggleImageCrop = useCallback(
    async (id: string) => {
      const img = images.find((i) => i.id === id);
      if (!img || mediaBusy) return;
      setMediaBusy(true);
      setSubmitError(null);
      try {
        const nextCrop = !img.cropSquare;
        const dataUrl = await uriToPostImageDataUrl(img.sourceUri, { cropSquare: nextCrop });
        setImages((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, cropSquare: nextCrop, dataUrl, uri: dataUrl } : i
          )
        );
      } catch {
        setSubmitError("No se pudo recortar la imagen.");
      } finally {
        setMediaBusy(false);
      }
    },
    [images, mediaBusy]
  );

  const moveImage = useCallback((id: string, direction: -1 | 1) => {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      if (index < 0) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  }, []);

  const applySessionFields = useCallback(
    (id: string | null, meta?: SessionSelectMeta) => {
      setSessionId(id);
      const applied = applySessionMeta(meta);
      setSessionWorkoutTitle(applied.sessionWorkoutTitle);
      setSessionPerformedAt(applied.sessionPerformedAt);
      setSessionNotes(applied.sessionNotes);
      setSessionCompletedSets(applied.sessionCompletedSets);
      setSessionTotalSets(applied.sessionTotalSets);
      setSessionCompletedExercises(applied.sessionCompletedExercises);
      setSessionTotalExercises(applied.sessionTotalExercises);
      setSessionSnapshot(meta?.snapshot ?? null);
      if (id && meta?.workoutTitle && postFormat === "training") {
        setContent((prev) => (prev.trim() ? prev : sessionPostTemplate(meta.workoutTitle)));
      }
    },
    [postFormat]
  );

  const enrichSessionMeta = useCallback(async (id: string, meta?: SessionSelectMeta): Promise<SessionSelectMeta> => {
    let workoutTitle = meta?.workoutTitle ?? "";
    let performedAt = meta?.performedAt ?? new Date().toISOString();
    let notes = meta?.notes ?? "";
    let snapshot = meta?.snapshot ?? null;
    let workoutId = meta?.workoutId;

    if (!snapshot?.blocks?.length) {
      try {
        const detail = await getWorkoutSession(id);
        workoutTitle = detail.workoutTitle;
        performedAt = detail.performedAt;
        notes = detail.notes;
        snapshot = detail.snapshot ?? null;
        workoutId = detail.workoutId;
      } catch {
        /* list meta only */
      }
    }

    if (!snapshot?.blocks?.length && workoutId) {
      snapshot = await resolveSessionSnapshotForPreview({
        workoutId,
        notes,
        workoutTitle,
        snapshot,
      });
    }

    return {
      workoutTitle,
      performedAt,
      notes,
      snapshot,
    };
  }, []);

  const selectSession = useCallback(
    async (id: string | null, meta?: SessionSelectMeta) => {
      if (!id) {
        applySessionFields(null, undefined);
        return;
      }

      const resolvedMeta = await enrichSessionMeta(id, meta);
      applySessionFields(id, resolvedMeta);
    },
    [applySessionFields, enrichSessionMeta]
  );

  useEffect(() => {
    if (!sessionId || restoringDraft || !hydratedRef.current) return;
    if (sessionSnapshot?.blocks?.length) return;
    let cancelled = false;
    void (async () => {
      try {
        const meta = await enrichSessionMeta(sessionId, {
          workoutTitle: sessionWorkoutTitle ?? "",
          performedAt: sessionPerformedAt ?? new Date().toISOString(),
          notes: sessionNotes ?? undefined,
          snapshot: sessionSnapshot,
        });
        if (cancelled || !meta.snapshot?.blocks?.length) return;
        applySessionFields(sessionId, meta);
      } catch {
        /* preview puede usar notes como fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    sessionId,
    sessionSnapshot,
    sessionWorkoutTitle,
    sessionPerformedAt,
    sessionNotes,
    restoringDraft,
    applySessionFields,
    enrichSessionMeta,
  ]);

  const dismissDraftBanner = useCallback(() => setDraftBanner(false), []);

  const discardDraft = useCallback(async () => {
    if (userId) {
      await Promise.all([clearPostCreateDraft(userId, postFormat), clearPendingPostPublish(userId)]);
    }
    setDraftBanner(false);
    setPendingPublish(null);
    setContent("");
    setImages([]);
    setSessionId(null);
    setSessionWorkoutTitle(null);
    setSessionPerformedAt(null);
    setSessionNotes(null);
    setSessionCompletedSets(null);
    setSessionTotalSets(null);
    setSessionCompletedExercises(null);
    setSessionTotalExercises(null);
    setSessionSnapshot(null);
    setSuggestedSessionId(null);
    setSubmitError(null);
    setVisibility(initialVisibilityRef.current);
  }, [userId, postFormat]);

  const dismissPendingPublish = useCallback(async () => {
    if (userId) await clearPendingPostPublish(userId);
    setPendingPublish(null);
  }, [userId]);

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
        format: postFormat,
        sessionId,
        visibility,
        ...(images.length > 0
          ? { media: images.map((img) => ({ type: "image" as const, url: img.dataUrl })) }
          : {}),
      });
      if (userId) {
        await Promise.all([clearPostCreateDraft(userId, postFormat), clearPendingPostPublish(userId)]);
      }
      setPendingPublish(null);
      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo publicar.";
      setSubmitError(msg);
      const isNetwork =
        e instanceof ApiError
          ? e.status === 0 || e.status >= 500
          : msg.includes("Network") || msg.includes("conexión");
      if (userId && isNetwork) {
        const pending: PendingPostPublish = {
          format: postFormat,
          content: content.trim(),
          visibility,
          sessionId,
          sessionWorkoutTitle,
          imageDataUrls: images.map((i) => i.dataUrl),
          failedAt: new Date().toISOString(),
          errorMessage: msg,
        };
        await savePendingPostPublish(userId, pending);
        setPendingPublish(pending);
      }
      return { ok: false as const };
    } finally {
      setSubmitting(false);
    }
  }, [
    content,
    images,
    submitting,
    userId,
    validation.canSubmit,
    visibility,
    postFormat,
    sessionId,
    sessionWorkoutTitle,
  ]);

  const hasDraft =
    content.trim().length > 0 ||
    images.length > 0 ||
    sessionId != null ||
    visibility !== initialVisibilityRef.current;

  return {
    content,
    setContent,
    visibility,
    setVisibility,
    postFormat,
    sessionId,
    sessionWorkoutTitle,
    sessionPerformedAt,
    sessionNotes,
    sessionCompletedSets,
    sessionTotalSets,
    sessionCompletedExercises,
    sessionTotalExercises,
    sessionSnapshot,
    suggestedSessionId,
    selectSession,
    images,
    mediaBusy,
    submitting,
    submitError,
    validation,
    charProgress,
    photoOnlyOk,
    hasDraft,
    draftBanner,
    restoringDraft,
    pendingPublish,
    dismissDraftBanner,
    discardDraft,
    dismissPendingPublish,
    pickImages,
    pickCamera,
    appendUris,
    toggleImageCrop,
    removeImage,
    moveImage,
    submit,
    setSubmitError,
    defaultVisibility: initialVisibilityRef.current,
  };
}
