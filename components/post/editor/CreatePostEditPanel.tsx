import { Image } from "expo-image";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import {
  POST_BODY_MAX,
  POST_IMAGE_MAX_FILES,
  POST_VISIBILITY_CHIPS,
  visibilityDescription,
} from "../../../constants/createPost";
import type { PostVisibility } from "../../../constants/createPost";
import type { PostFormat } from "../../../constants/postFormat";
import {
  CAPTION_PROMPTS_STANDARD,
  CAPTION_PROMPTS_TRAINING,
} from "../../../constants/createPostPrompts";
import type { PendingPostImage } from "../../../hooks/useCreatePostForm";
import { SocialChipRow } from "../../social/SocialChipRow";
import { SocialSectionHeader } from "../../social/SocialSectionHeader";

export type CreatePostEditPanelKind = "text" | "media" | "options" | null;

type CreatePostEditPanelProps = {
  kind: CreatePostEditPanelKind;
  onClose: () => void;
  content: string;
  onChangeContent: (text: string) => void;
  images: PendingPostImage[];
  mediaBusy: boolean;
  onAddMedia: () => void;
  onRemoveImage: (id: string) => void;
  onMoveImage: (id: string, direction: -1 | 1) => void;
  onToggleCrop: (id: string) => void;
  visibility: PostVisibility;
  onChangeVisibility: (v: PostVisibility) => void;
  defaultVisibility: PostVisibility;
  charCount: number;
  validationHint: string;
  hasDraft?: boolean;
  onClearDraft?: () => void;
  clearDraftDisabled?: boolean;
  format?: PostFormat;
};

export function CreatePostEditPanel({
  kind,
  onClose,
  content,
  onChangeContent,
  images,
  mediaBusy,
  onAddMedia,
  onRemoveImage,
  onMoveImage,
  onToggleCrop,
  visibility,
  onChangeVisibility,
  defaultVisibility,
  charCount,
  validationHint,
  hasDraft = false,
  onClearDraft,
  clearDraftDisabled = false,
  format = "standard",
}: CreatePostEditPanelProps) {
  const insets = useSafeAreaInsets();
  if (!kind) return null;

  const title =
    kind === "text" ? "Texto" : kind === "media" ? "Fotos" : "Ajustes";
  const captionPrompts =
    format === "training" ? CAPTION_PROMPTS_TRAINING : CAPTION_PROMPTS_STANDARD;
  const textPlaceholder =
    format === "training" ? "¿Cómo fue el entreno?" : "Pie de foto o comentario…";

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8, maxHeight: "75%" }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.done} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Listo
            </Text>
          </Pressable>
        </View>

        {kind === "text" ? (
          <View style={styles.panelBody}>
            <TextInput
              value={content}
              onChangeText={onChangeContent}
              placeholder={textPlaceholder}
              placeholderTextColor={AUTH.faint}
              multiline
              autoFocus
              style={styles.textInput}
              maxLength={POST_BODY_MAX + 80}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prompts}>
              {captionPrompts.map((prompt) => (
                <Pressable
                  key={prompt}
                  onPress={() => onChangeContent(prompt)}
                  style={({ pressed }) => [styles.promptChip, pressed ? styles.promptPressed : null]}
                >
                  <Text style={styles.promptText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER} numberOfLines={1}>
                    {prompt}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text
              style={[styles.charCount, charCount > POST_BODY_MAX ? styles.charOver : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {charCount}/{POST_BODY_MAX}
            </Text>
            {validationHint ? (
              <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {validationHint}
              </Text>
            ) : null}
          </View>
        ) : null}

        {kind === "media" ? (
          <ScrollView style={styles.panelBody} keyboardShouldPersistTaps="handled">
            <ScrollView horizontal contentContainerStyle={styles.mediaStrip} showsHorizontalScrollIndicator={false}>
              {images.length < POST_IMAGE_MAX_FILES ? (
                <Pressable onPress={onAddMedia} disabled={mediaBusy} style={styles.addTile}>
                  {mediaBusy ? (
                    <ActivityIndicator color={AUTH.gold} />
                  ) : (
                    <>
                      <Text style={styles.addIcon}>+</Text>
                      <Text style={styles.addLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        Añadir
                      </Text>
                    </>
                  )}
                </Pressable>
              ) : null}
              {images.map((img, index) => (
                <View
                  key={img.id}
                  style={[styles.thumbWrap, index === 0 ? styles.thumbWrapCover : null]}
                >
                  {index === 0 ? (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        Portada
                      </Text>
                    </View>
                  ) : null}
                  <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" />
                  <Pressable onPress={() => void onToggleCrop(img.id)} style={styles.cropBtn}>
                    <Text style={styles.cropBtnText}>{img.cropSquare ? "1:1" : "Orig."}</Text>
                  </Pressable>
                  {images.length > 1 ? (
                    <View style={styles.moveRow}>
                      <Pressable
                        onPress={() => onMoveImage(img.id, -1)}
                        disabled={index === 0}
                        style={styles.moveBtn}
                      >
                        <Text style={styles.moveText}>‹</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onMoveImage(img.id, 1)}
                        disabled={index === images.length - 1}
                        style={styles.moveBtn}
                      >
                        <Text style={styles.moveText}>›</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  <Pressable onPress={() => onRemoveImage(img.id)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.mediaHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Hasta {POST_IMAGE_MAX_FILES} fotos · recorte 1:1 por defecto · Orig. mantiene proporción
            </Text>
          </ScrollView>
        ) : null}

        {kind === "options" ? (
          <View style={styles.panelBody}>
            <SocialSectionHeader title="Visibilidad" subtitle="Quién puede ver esta publicación" />
            <SocialChipRow options={POST_VISIBILITY_CHIPS} value={visibility} onChange={onChangeVisibility} />
            <Text style={styles.visHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {visibility === defaultVisibility
                ? `Por defecto: ${visibilityDescription(defaultVisibility)}`
                : visibilityDescription(visibility)}
            </Text>
            {hasDraft && onClearDraft ? (
              <SocialSectionHeader title="Borrador" subtitle="Elimina el contenido guardado en este dispositivo" />
            ) : null}
            {hasDraft && onClearDraft ? (
              <Pressable
                onPress={onClearDraft}
                disabled={clearDraftDisabled}
                style={({ pressed }) => [
                  styles.clearDraftBtn,
                  clearDraftDisabled ? styles.clearDraftBtnDisabled : null,
                  pressed && !clearDraftDisabled ? styles.clearDraftBtnPressed : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Borrar borrador y empezar publicación nueva"
              >
                <Text style={styles.clearDraftBtnTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Empezar publicación nueva
                </Text>
                <Text style={styles.clearDraftBtnHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Borra texto, fotos y sesión vinculada del borrador local
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const THUMB = 120;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#0c0c0e",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(82, 82, 82, 0.55)",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.65)",
    marginBottom: 10,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: { color: AUTH.neutral100, fontSize: 17, fontWeight: "700" },
  done: { color: AUTH.gold, fontSize: 16, fontWeight: "600" },
  panelBody: { gap: 10, paddingBottom: 8 },
  textInput: {
    minHeight: 120,
    color: AUTH.neutral100,
    fontSize: 17,
    lineHeight: 24,
    padding: 0,
  },
  charCount: { color: AUTH.faint, fontSize: 12, textAlign: "right" },
  charOver: { color: AUTH.danger },
  hint: { color: AUTH.muted, fontSize: 13 },
  prompts: { gap: 8, paddingVertical: 4 },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(115, 115, 115, 0.45)",
    backgroundColor: "rgba(24, 24, 26, 0.9)",
    maxWidth: 200,
  },
  promptPressed: { opacity: 0.85 },
  promptText: { color: AUTH.muted, fontSize: 12, fontWeight: "600" },
  mediaStrip: { gap: 10, alignItems: "center" },
  thumbWrap: {
    width: THUMB,
    height: THUMB,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#141416",
  },
  thumbWrapCover: {
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.55)",
  },
  coverBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(212, 175, 55, 0.9)",
  },
  coverBadgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "800",
  },
  thumb: { width: "100%", height: "100%" },
  cropBtn: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  cropBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  moveRow: {
    position: "absolute",
    left: 4,
    right: 4,
    top: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moveBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  moveText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  addTile: {
    width: THUMB,
    height: THUMB,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(212, 175, 55, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: { color: AUTH.gold, fontSize: 26, fontWeight: "300" },
  addLabel: { color: AUTH.gold, fontSize: 11, fontWeight: "700", marginTop: 2 },
  mediaHint: { color: AUTH.faint, fontSize: 12, marginTop: 8 },
  visHint: { color: AUTH.faint, fontSize: 12, lineHeight: 17 },
  clearDraftBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    gap: 4,
  },
  clearDraftBtnPressed: { opacity: 0.88 },
  clearDraftBtnDisabled: { opacity: 0.45 },
  clearDraftBtnTitle: { color: AUTH.danger, fontSize: 15, fontWeight: "700" },
  clearDraftBtnHint: { color: AUTH.faint, fontSize: 12, lineHeight: 17 },
});
