import { useCallback, useEffect, useRef, useState } from "react";
import { getWorkoutSession, getWorkoutSessions } from "../api/workoutSessions";
import { POST_IMAGE_MAX_FILES, type PostVisibility } from "../constants/createPost";
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
  getLatestSessionIdForUser,
  resolveSessionIdFromWorkoutId,
} from "../utils/sessionLinkSuggest";
import {
  imagesFromUris,
  pendingImagesFromDataUrls,
  pendingImagesFromEntries,
  type PendingPostImage,
} from "./createPost/postImageUtils";

type UsePostDraftPersistenceOptions = {
  userId: string | undefined;
  postFormat: PostFormat;
  initialVisibility: PostVisibility;
  initialSessionId: string | null;
  legacyWorkoutId: string | null;
  content: string;
  visibility: PostVisibility;
  images: PendingPostImage[];
  sessionId: string | null;
  sessionWorkoutTitle: string | null;
  setContent: (value: string) => void;
  setVisibility: (value: PostVisibility) => void;
  setImages: (images: PendingPostImage[]) => void;
  restoreSessionBasics: (sessionId: string | null, sessionWorkoutTitle: string | null) => void;
  applyLinkedSession: (
    id: string,
    title: string | null,
    performedAt: string | null,
    notes: string | null,
    snapshot: WorkoutSessionSnapshot | null
  ) => void;
  setSuggestedSessionId: (id: string | null) => void;
};

export function usePostDraftPersistence({
  userId,
  postFormat,
  initialVisibility,
  initialSessionId,
  legacyWorkoutId,
  content,
  visibility,
  images,
  sessionId,
  sessionWorkoutTitle,
  setContent,
  setVisibility,
  setImages,
  restoreSessionBasics,
  applyLinkedSession,
  setSuggestedSessionId,
}: UsePostDraftPersistenceOptions) {
  const [draftBanner, setDraftBanner] = useState(false);
  const [restoringDraft, setRestoringDraft] = useState(false);
  const [pendingPublish, setPendingPublish] = useState<PendingPostPublish | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const initialVisibilityRef = useRef(initialVisibility);
  const initialSessionIdRef = useRef(initialSessionId);
  const legacyWorkoutIdRef = useRef(legacyWorkoutId);

  useEffect(() => {
    initialVisibilityRef.current = initialVisibility;
  }, [initialVisibility]);

  useEffect(() => {
    initialSessionIdRef.current = initialSessionId;
    legacyWorkoutIdRef.current = legacyWorkoutId;
  }, [initialSessionId, legacyWorkoutId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setHydrated(false);
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

        const preferLinkedSession = Boolean(resolvedInitialSessionId);
        let restoredFromPending = false;
        let restoredFromDraft = false;

        if (pending && pending.format === postFormat) {
          const pendingMatchesSession =
            !preferLinkedSession || pending.sessionId === resolvedInitialSessionId;
          if (pendingMatchesSession) {
            restoredFromPending = true;
            setPendingPublish(pending);
            setContent(pending.content);
            setVisibility(pending.visibility);
            if (pending.imageEntries?.length) {
              const restored = await pendingImagesFromEntries(
                pending.imageEntries.slice(0, POST_IMAGE_MAX_FILES)
              );
              if (!cancelled && restored.length > 0) setImages(restored);
            } else if (pending.imageDataUrls.length > 0) {
              setImages(
                pendingImagesFromDataUrls(
                  pending.imageDataUrls.slice(0, POST_IMAGE_MAX_FILES)
                )
              );
            }
            restoreSessionBasics(pending.sessionId, pending.sessionWorkoutTitle);
          } else {
            await clearPendingPostPublish(userId);
          }
        }

        if (!restoredFromPending && draft && draft.format === postFormat) {
          const draftMatchesSession =
            !preferLinkedSession || draft.sessionId === resolvedInitialSessionId;
          const hasSomething =
            draft.content.trim().length > 0 ||
            draft.imageUris.length > 0 ||
            draft.sessionId != null;
          if (draftMatchesSession && hasSomething) {
            restoredFromDraft = true;
            setContent(draft.content);
            setVisibility(draft.visibility);
            if (draft.imageUris.length > 0) {
              const restored = await imagesFromUris(
                draft.imageUris.slice(0, POST_IMAGE_MAX_FILES),
                true
              );
              if (!cancelled && restored.length > 0) setImages(restored);
            }
            if (draft.sessionId) {
              restoreSessionBasics(draft.sessionId, draft.sessionWorkoutTitle);
            }
            if (!cancelled) setDraftBanner(true);
          }
        }

        if (!cancelled) {
          if (resolvedInitialSessionId && !restoredFromPending) {
            applyLinkedSession(
              resolvedInitialSessionId,
              latest.workoutTitle,
              latest.performedAt,
              latest.notes ?? null,
              latest.snapshot ?? null
            );
          } else if (
            !restoredFromPending &&
            !preferLinkedSession &&
            latest.sessionId &&
            postFormat === "training" &&
            !restoredFromDraft
          ) {
            setSuggestedSessionId(latest.sessionId);
            if (!draft?.sessionId) {
              applyLinkedSession(
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
          setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    userId,
    postFormat,
    setContent,
    setVisibility,
    setImages,
    restoreSessionBasics,
    applyLinkedSession,
    setSuggestedSessionId,
  ]);

  useEffect(() => {
    if (!userId || !hydrated || pendingPublish) return;
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
  }, [
    userId,
    postFormat,
    content,
    visibility,
    images,
    sessionId,
    sessionWorkoutTitle,
    pendingPublish,
    hydrated,
  ]);

  const dismissDraftBanner = useCallback(() => setDraftBanner(false), []);

  const discardDraft = useCallback(
    async (reset: () => void) => {
      if (userId) {
        await Promise.all([clearPostCreateDraft(userId, postFormat), clearPendingPostPublish(userId)]);
      }
      setDraftBanner(false);
      setPendingPublish(null);
      reset();
      setVisibility(initialVisibilityRef.current);
    },
    [userId, postFormat, setVisibility]
  );

  const dismissPendingPublish = useCallback(async () => {
    if (userId) await clearPendingPostPublish(userId);
    setPendingPublish(null);
  }, [userId]);

  const clearDraftAfterSubmit = useCallback(async () => {
    if (userId) {
      await Promise.all([clearPostCreateDraft(userId, postFormat), clearPendingPostPublish(userId)]);
    }
    setPendingPublish(null);
  }, [userId, postFormat]);

  const queuePendingPublish = useCallback(
    async (pending: PendingPostPublish) => {
      if (userId) await savePendingPostPublish(userId, pending);
      setPendingPublish(pending);
    },
    [userId]
  );

  return {
    draftBanner,
    restoringDraft,
    pendingPublish,
    hydrated,
    initialVisibility: initialVisibilityRef.current,
    dismissDraftBanner,
    discardDraft,
    dismissPendingPublish,
    clearDraftAfterSubmit,
    queuePendingPublish,
  };
}
