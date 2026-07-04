import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthTopGlow } from "../AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { POST_IMAGE_MAX_FILES } from "../../constants/createPost";
import { POST_FORMAT_LABELS, type PostFormat } from "../../constants/postFormat";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { goiToast } from "../../context/GoiToastContext";
import { useCreatePostForm } from "../../hooks/useCreatePostForm";
import { useMentionCandidates } from "../../hooks/useMentionCandidates";
import { usePostSessionPicker } from "../../hooks/usePostSessionPicker";
import { hapticLight, hapticSuccess } from "../../utils/appHaptics";
import { CreatePostSessionPickerSheet } from "./CreatePostSessionPickerSheet";
import { CreatePostSessionTodayCta } from "./CreatePostSessionHero";
import {
  CreatePostEditPanel,
  type CreatePostEditPanelKind,
} from "./editor/CreatePostEditPanel";
import { CreatePostDraftRecoveredBanner } from "./editor/CreatePostDraftRecoveredBanner";
import { CreatePostPendingPublishBanner } from "./editor/CreatePostPendingPublishBanner";
import { CreatePostWorkoutShareBanner } from "./editor/CreatePostWorkoutShareBanner";
import { CreatePostFormatSegment } from "./editor/CreatePostFormatSegment";
import { CreatePostInlineCaption } from "./editor/CreatePostInlineCaption";
import {
  CreatePostToolbar,
  type CreatePostToolbarAction,
} from "./editor/CreatePostToolbar";
import { PostFeedPreviewStandard } from "./preview/PostFeedPreviewStandard";
import { PostFeedPreviewTraining } from "./preview/PostFeedPreviewTraining";
import {
  resolveSessionExercisePreviews,
  resolveSessionMoreExercisesCount,
} from "../../utils/sessionExercisePreview";
import type { PostPreviewDraft } from "./preview/postPreviewTypes";

type CreatePostScreenProps = {
  format: PostFormat;
  initialSessionId?: string | null;
  legacyWorkoutId?: string | null;
  fromWorkoutFinish?: boolean;
  onChangeFormat?: (format: PostFormat) => void;
};

export function CreatePostScreen({
  format,
  initialSessionId = null,
  legacyWorkoutId = null,
  fromWorkoutFinish = false,
  onChangeFormat,
}: CreatePostScreenProps) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { user } = useAuth();
  const [editPanel, setEditPanel] = useState<CreatePostEditPanelKind>(null);
  const [sessionPickerOpen, setSessionPickerOpen] = useState(false);
  const [sessionInlineOpen, setSessionInlineOpen] = useState(false);

  const defaultPostVisibility =
    user?.defaultPostVisibility === "followers" || user?.defaultPostVisibility === "private"
      ? user.defaultPostVisibility
      : "public";

  const form = useCreatePostForm(
    user?.id,
    format,
    defaultPostVisibility,
    initialSessionId,
    legacyWorkoutId
  );
  const sessionPicker = usePostSessionPicker(user?.id);
  const { candidates: mentionCandidates, recordMentionPick } = useMentionCandidates();
  const formBusy = form.submitting || form.restoringDraft;
  const previewScrollRef = useRef<ScrollView>(null);
  const captionInputRef = useRef<TextInput>(null);

  const sessionExercisePreviews = useMemo(
    () =>
      resolveSessionExercisePreviews({
        snapshot: form.sessionSnapshot,
        notes: form.sessionNotes,
      }),
    [form.sessionSnapshot, form.sessionNotes]
  );

  const previewDraft: PostPreviewDraft = useMemo(
    () => ({
      format,
      username: user?.username ?? "usuario",
      avatarUrl: user?.avatarUrl,
      content: form.content,
      visibility: form.visibility,
      imageUris: form.images.map((i) => i.uri),
      workoutTitle: form.sessionWorkoutTitle,
      sessionId: form.sessionId,
      sessionPerformedAt: form.sessionPerformedAt,
      sessionNotes: form.sessionNotes,
      sessionCompletedSets: form.sessionCompletedSets,
      sessionTotalSets: form.sessionTotalSets,
      sessionCompletedExercises: form.sessionCompletedExercises,
      sessionTotalExercises: form.sessionTotalExercises,
      sessionSnapshot: form.sessionSnapshot,
      sessionExercisePreviews,
      sessionMoreExercisesCount: resolveSessionMoreExercisesCount({
        snapshot: form.sessionSnapshot,
        notes: form.sessionNotes,
        shown: sessionExercisePreviews.length,
      }),
    }),
    [
      format,
      user?.username,
      user?.avatarUrl,
      form.content,
      form.visibility,
      form.images,
      form.sessionWorkoutTitle,
      form.sessionId,
      form.sessionPerformedAt,
      form.sessionNotes,
      form.sessionCompletedSets,
      form.sessionTotalSets,
      form.sessionCompletedExercises,
      form.sessionTotalExercises,
      form.sessionSnapshot,
      sessionExercisePreviews,
    ]
  );

  useEffect(() => {
    if (!form.sessionId) setSessionInlineOpen(false);
  }, [form.sessionId]);

  useEffect(() => {
    if (!form.sessionId) return;
    const t = setTimeout(() => {
      previewScrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
    return () => clearTimeout(t);
  }, [form.sessionId, form.sessionWorkoutTitle, form.sessionSnapshot, sessionExercisePreviews.length]);

  const openLinkedSessionDetail = useCallback(() => {
    if (!form.sessionId) return;
    hapticLight();
    router.push({ pathname: "/sesion/[id]", params: { id: form.sessionId } });
  }, [form.sessionId, router]);

  const handleClearDraft = useCallback(() => {
    if (!form.hasDraft || form.submitting || form.restoringDraft) return;
    hapticLight();
    showAlert({
      title: "Empezar de cero",
      message:
        "Se borrará el borrador guardado: texto, fotos y sesión vinculada. Podrás crear una publicación nueva desde cero.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar borrador",
          style: "destructive",
          onPress: () => {
            void form.discardDraft().then(() => {
              hapticLight();
              goiToast("Borrador eliminado");
              setEditPanel(null);
              setSessionPickerOpen(false);
            });
          },
        },
      ],
    });
  }, [form, showAlert]);

  const close = useCallback(() => {
    if (form.hasDraft && !form.submitting) {
      showAlert({
        title: "Descartar borrador",
        message: "Perderás los cambios no publicados.",
        buttons: [
          { text: "Seguir", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => {
              void form.discardDraft();
              router.back();
            },
          },
        ],
      });
      return;
    }
    router.back();
  }, [form, router, showAlert]);

  const onPublish = useCallback(async () => {
    Keyboard.dismiss();
    const result = await form.submit();
    if (result.ok) {
      hapticSuccess();
      goiToast(format === "training" ? "Training publicado" : `${POST_FORMAT_LABELS.standard} publicado`);
      InteractionManager.runAfterInteractions(() => {
        router.replace({ pathname: "/(tabs)", params: { feedRefresh: "1" } });
      });
    }
  }, [form, router, format]);

  const onRetryPendingPublish = useCallback(() => {
    void onPublish();
  }, [onPublish]);

  const onDismissPendingPublish = useCallback(() => {
    showAlert({
      title: "Descartar publicación pendiente",
      message: "Se borrará el intento guardado sin conexión.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => void form.dismissPendingPublish(),
        },
      ],
    });
  }, [form, showAlert]);

  const onAddFromLibrary = useCallback(async () => {
    const result = await form.pickImages();
    if (result.ok) void form.appendUris(result.uris, true);
    else if (!result.ok && "error" in result) form.setSubmitError(result.error);
  }, [form]);

  const onAddFromCamera = useCallback(async () => {
    const result = await form.pickCamera();
    if (result.ok) void form.appendUris(result.uris, true);
    else if (!result.ok && "error" in result) form.setSubmitError(result.error);
  }, [form]);

  const onAddMedia = useCallback(() => {
    hapticLight();
    if (form.mediaBusy || form.submitting) return;
    showAlert({
      title: "Añadir foto",
      message: "Recorte cuadrado por defecto",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Galería", onPress: () => void onAddFromLibrary() },
        { text: "Cámara", onPress: () => void onAddFromCamera() },
      ],
    });
  }, [form, onAddFromCamera, onAddFromLibrary, showAlert]);

  const canAddMorePhotos = form.images.length < POST_IMAGE_MAX_FILES;

  const openAddMedia = useCallback(() => {
    if (form.mediaBusy || form.submitting || !canAddMorePhotos) return;
    void onAddMedia();
  }, [canAddMorePhotos, form.mediaBusy, form.submitting, onAddMedia]);

  const openEditMedia = useCallback(() => {
    if (form.mediaBusy || form.submitting) return;
    if (form.images.length === 0) {
      void onAddMedia();
      return;
    }
    setEditPanel("media");
  }, [form.images.length, form.mediaBusy, form.submitting, onAddMedia]);

  const focusStandardCaption = useCallback(() => {
    captionInputRef.current?.focus();
  }, []);

  const canPublish =
    form.validation.canSubmit && !form.submitting && !form.mediaBusy && !form.restoringDraft;

  const openToolbarAction = useCallback(
    (action: CreatePostToolbarAction) => {
      hapticLight();
      if (form.submitting || form.restoringDraft) return;
      if (action === "session") {
        setSessionPickerOpen(true);
        return;
      }
      if (action === "media") {
        if (canAddMorePhotos && form.images.length === 0) openAddMedia();
        else openEditMedia();
        return;
      }
      if (action === "text" && format === "standard") {
        focusStandardCaption();
        return;
      }
      setEditPanel(action);
    },
    [
      canAddMorePhotos,
      form.images.length,
      form.restoringDraft,
      form.submitting,
      format,
      openAddMedia,
      openEditMedia,
      focusStandardCaption,
    ]
  );

  const requestFormatChange = useCallback(
    (next: PostFormat) => {
      if (next === format || !onChangeFormat) return;
      onChangeFormat(next);
    },
    [format, onChangeFormat]
  );

  const toolbarPanel: CreatePostToolbarAction | null =
    editPanel === "text" || editPanel === "media" || editPanel === "options" ? editPanel : null;

  const linkTodaySession = useCallback(async () => {
    const session = sessionPicker.todayAvailableSession ?? (await sessionPicker.linkTodaySession());
    if (!session) return;
    hapticLight();
    await form.selectSession(session.id, {
      workoutTitle: session.workoutTitle,
      performedAt: session.performedAt,
      notes: session.notes,
      snapshot: session.snapshot,
      workoutId: session.workoutId,
    });
  }, [form, sessionPicker]);

  const applySuggestedSession = useCallback(async () => {
    const id = form.suggestedSessionId;
    if (!id) return;
    const session = sessionPicker.getSession(id);
    hapticLight();
    await form.selectSession(id, session
      ? {
          workoutTitle: session.workoutTitle,
          performedAt: session.performedAt,
          notes: session.notes,
          snapshot: session.snapshot,
          workoutId: session.workoutId,
        }
      : undefined);
  }, [form, sessionPicker]);

  return (
    <View style={styles.root}>
      <AuthTopGlow width={screenWidth} windowHeight={screenHeight} />

      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={close} hitSlop={10} style={styles.headerSide}>
          <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cancelar
          </Text>
        </Pressable>
        <View style={[styles.headerSide, styles.headerSideEnd]}>
          {form.submitting ? (
            <ActivityIndicator size="small" color={AUTH.gold} />
          ) : (
            <Pressable
              onPress={() => void onPublish()}
              disabled={!canPublish}
              style={({ pressed }) => [
                styles.publishPill,
                canPublish ? styles.publishPillReady : styles.publishPillDisabled,
                pressed && canPublish ? styles.publishPillPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Publicar"
            >
              <Text
                style={[styles.publishPillText, !canPublish ? styles.publishPillTextDisabled : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                Publicar
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {!sessionPickerOpen ? (
        <>
      {onChangeFormat ? (
        <CreatePostFormatSegment value={format} onChange={requestFormatChange} compact />
      ) : null}

      {!form.sessionId && sessionPicker.todayAvailableSession && !form.restoringDraft ? (
        <View style={styles.quickLinkWrap}>
          <CreatePostSessionTodayCta
            session={sessionPicker.todayAvailableSession}
            onPress={() => void linkTodaySession()}
          />
        </View>
      ) : null}

      {!form.sessionId && form.suggestedSessionId && !form.restoringDraft && !sessionPicker.todayAvailableSession ? (
        <Pressable
          onPress={() => void applySuggestedSession()}
          style={({ pressed }) => [styles.suggestBanner, pressed ? styles.pressed : null]}
        >
          <Text style={styles.suggestEyebrow} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Recomendado
          </Text>
          <Text style={styles.suggestTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Vincular tu última sesión sin publicar
          </Text>
        </Pressable>
      ) : null}

      <CreatePostDraftRecoveredBanner
        active={form.draftBanner && !form.restoringDraft && !fromWorkoutFinish}
        onDismiss={form.dismissDraftBanner}
      />

      {fromWorkoutFinish && !form.restoringDraft && !form.pendingPublish ? (
        <CreatePostWorkoutShareBanner workoutTitle={form.sessionWorkoutTitle} />
      ) : null}

      {form.pendingPublish && !form.restoringDraft ? (
        <CreatePostPendingPublishBanner
          message={form.pendingPublish.errorMessage}
          retrying={form.submitting}
          onRetry={onRetryPendingPublish}
          onDismiss={onDismissPendingPublish}
        />
      ) : null}

      {form.restoringDraft ? (
        <ActivityIndicator color={AUTH.gold} style={{ marginTop: 24 }} />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 48 : 0}
        >
          <ScrollView
            ref={previewScrollRef}
            style={styles.previewScroll}
            contentContainerStyle={styles.previewScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {format === "training" ? (
            <PostFeedPreviewTraining
              draft={previewDraft}
              fullBleed
              previewMode
              editorMode
              onPressEditMedia={openEditMedia}
              onPressAddMedia={canAddMorePhotos ? openAddMedia : undefined}
              onPressEditCaption={() => setEditPanel("text")}
              onPressLinkSession={() => setSessionPickerOpen(true)}
              onPressViewSession={form.sessionId ? openLinkedSessionDetail : undefined}
            />
          ) : (
            <PostFeedPreviewStandard
              draft={previewDraft}
              fullBleed
              previewMode
              editorMode
              onPressEditMedia={openEditMedia}
              onPressAddMedia={canAddMorePhotos ? openAddMedia : undefined}
              onPressEditCaption={focusStandardCaption}
              showSessionInline={sessionInlineOpen}
              sessionPreviewActive={sessionInlineOpen}
              onPressSessionPreview={
                form.sessionId
                  ? () => {
                      hapticLight();
                      setSessionInlineOpen((v) => !v);
                    }
                  : undefined
              }
              onPressViewSession={form.sessionId ? openLinkedSessionDetail : undefined}
            />
          )}
          </ScrollView>

          {format === "standard" ? (
            <CreatePostInlineCaption
              inputRef={captionInputRef}
              value={form.content}
              onChange={form.setContent}
              charCount={form.validation.charCount}
              mentionCandidates={mentionCandidates}
              onMentionPick={recordMentionPick}
            />
          ) : null}

          <View style={[styles.toolbarDock, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <CreatePostToolbar
              format={format}
              hasSession={Boolean(form.sessionId)}
              imageCount={form.images.length}
              activePanel={toolbarPanel}
              onPress={openToolbarAction}
            />
          </View>
        </KeyboardAvoidingView>
      )}
        </>
      ) : null}

      {form.submitError && !sessionPickerOpen ? (
        <Text style={styles.error} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {form.submitError}
        </Text>
      ) : null}

      <CreatePostEditPanel
        kind={editPanel}
        onClose={() => setEditPanel(null)}
        content={form.content}
        onChangeContent={form.setContent}
        images={form.images}
        mediaBusy={form.mediaBusy}
        onAddMedia={onAddMedia}
        onRemoveImage={form.removeImage}
        onMoveImage={form.moveImage}
        onToggleCrop={(id) => void form.toggleImageCrop(id)}
        visibility={form.visibility}
        onChangeVisibility={form.setVisibility}
        defaultVisibility={form.defaultVisibility}
        charCount={form.validation.charCount}
        validationHint={form.validation.hint}
        hasDraft={form.hasDraft}
        onClearDraft={handleClearDraft}
        clearDraftDisabled={form.submitting || form.restoringDraft}
        format={format}
        mentionCandidates={mentionCandidates}
        onMentionPick={recordMentionPick}
      />

      <CreatePostSessionPickerSheet
        visible={sessionPickerOpen}
        onClose={() => setSessionPickerOpen(false)}
        picker={sessionPicker}
        value={form.sessionId}
        showUnlink
        onSelect={(id, meta) => void form.selectSession(id, meta)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AUTH.bg },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(82, 82, 82, 0.6)",
    backgroundColor: "rgba(8, 8, 10, 0.95)",
  },
  headerSide: { justifyContent: "center", minHeight: 40 },
  headerSideEnd: { alignItems: "flex-end" },
  cancelText: { color: AUTH.muted, fontSize: 16 },
  publishPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 84,
    alignItems: "center",
  },
  publishPillReady: {
    backgroundColor: AUTH.gold,
  },
  publishPillDisabled: {
    backgroundColor: "rgba(115, 115, 115, 0.35)",
  },
  publishPillPressed: { opacity: 0.9 },
  publishPillText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },
  publishPillTextDisabled: {
    color: "rgba(245, 245, 245, 0.55)",
  },
  previewScroll: { flex: 1 },
  previewScrollContent: { flexGrow: 1, justifyContent: "flex-start", paddingVertical: 8 },
  quickLinkWrap: { marginHorizontal: 12, marginTop: 8, marginBottom: 2 },
  suggestBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    backgroundColor: "rgba(14, 14, 16, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  pressed: { opacity: 0.88 },
  suggestEyebrow: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  suggestTitle: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
  },
  toolbarDock: {
    marginHorizontal: 10,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(82, 82, 82, 0.55)",
    borderRadius: 16,
    backgroundColor: "rgba(8, 8, 10, 0.94)",
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
  },
  error: {
    color: AUTH.danger,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
});
