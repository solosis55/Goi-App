import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  POST_BODY_MAX,
  POST_IMAGE_MAX_FILES,
  POST_VISIBILITY_OPTIONS,
} from "../../constants/createPost";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { useCreatePostForm } from "../../hooks/useCreatePostForm";
import { visibilityBadgeStyle, visibilityLabel } from "../../utils/visibilityStyles";
import { UserAvatar } from "../ui/UserAvatar";

export function CreatePostScreen() {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const defaultPostVisibility =
    user?.defaultPostVisibility === "followers" || user?.defaultPostVisibility === "private"
      ? user.defaultPostVisibility
      : "public";
  const form = useCreatePostForm(defaultPostVisibility);

  const close = useCallback(() => {
    if (form.hasDraft && !form.submitting) {
      showAlert({
        title: "Descartar borrador",
        message: "Perderás el texto y las fotos.",
        buttons: [
          { text: "Seguir editando", style: "cancel" },
          { text: "Descartar", style: "destructive", onPress: () => router.back() },
        ],
      });
      return;
    }
    router.back();
  }, [form.hasDraft, form.submitting, router, showAlert]);

  const onPublish = useCallback(async () => {
    const result = await form.submit();
    if (result.ok) {
      router.replace("/(tabs)");
      showAlert({
        title: "Goi",
        message: "Publicación creada.",
        buttons: [{ text: "Entendido", style: "cancel" }],
      });
    }
  }, [form, router, showAlert]);

  const canPublish = form.validation.canSubmit && !form.submitting && !form.mediaBusy;
  const slotsLeft = POST_IMAGE_MAX_FILES - form.images.length;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={close} hitSlop={10} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Cancelar">
          <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cancelar
          </Text>
        </Pressable>
        <Text style={styles.headerTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Nueva publicación
        </Text>
        <Pressable
          onPress={() => void onPublish()}
          disabled={!canPublish}
          hitSlop={10}
          style={styles.headerSide}
          accessibilityRole="button"
          accessibilityLabel="Publicar"
        >
          {form.submitting ? (
            <ActivityIndicator size="small" color={AUTH.gold} />
          ) : (
            <Text
              style={[styles.publishText, !canPublish ? styles.publishDisabled : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              Publicar
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 48}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authorRow}>
            <UserAvatar src={user?.avatarUrl} username={user?.username ?? "?"} size={44} />
            <View style={styles.authorMeta}>
              <Text style={styles.username} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{user?.username ?? "usuario"}
              </Text>
              <Text style={styles.authorHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Visible en el feed según la privacidad elegida
              </Text>
            </View>
          </View>

          <TextInput
            value={form.content}
            onChangeText={(t) => {
              form.setContent(t);
              if (form.submitError) form.setSubmitError(null);
            }}
            placeholder="¿Qué tal el entreno?"
            placeholderTextColor={AUTH.faint}
            multiline
            textAlignVertical="top"
            style={styles.input}
            maxLength={POST_BODY_MAX + 80}
            editable={!form.submitting}
            selectionColor={AUTH.gold}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          />

          <View style={styles.mediaSection}>
            <Text style={styles.sectionLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Fotos
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
              {form.images.map((img) => (
                <View key={img.id} style={styles.thumbWrap}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} resizeMode="cover" accessibilityIgnoresInvertColors />
                  <Pressable
                    onPress={() => form.removeImage(img.id)}
                    style={styles.thumbRemove}
                    accessibilityRole="button"
                    accessibilityLabel="Quitar foto"
                  >
                    <Text style={styles.thumbRemoveText}>×</Text>
                  </Pressable>
                </View>
              ))}
              {slotsLeft > 0 ? (
                <Pressable
                  onPress={() => void form.addImages()}
                  disabled={form.mediaBusy || form.submitting}
                  style={({ pressed }) => [styles.addTile, pressed ? styles.addTilePressed : null, form.mediaBusy ? styles.addTileBusy : null]}
                  accessibilityRole="button"
                  accessibilityLabel="Añadir fotos"
                >
                  {form.mediaBusy ? (
                    <ActivityIndicator color={AUTH.gold} />
                  ) : (
                    <>
                      <Text style={styles.addIcon}>+</Text>
                      <Text style={styles.addLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        {form.images.length === 0 ? "Añadir" : `+${slotsLeft}`}
                      </Text>
                    </>
                  )}
                </Pressable>
              ) : null}
            </ScrollView>
            <Text style={styles.mediaHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Hasta {POST_IMAGE_MAX_FILES} fotos · En el feed se verán en carrusel
            </Text>
          </View>

          <View style={styles.visibilitySection}>
            <Text style={styles.sectionLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Quién puede verlo
            </Text>
            <View style={styles.visRow}>
              {POST_VISIBILITY_OPTIONS.map((opt) => {
                const selected = form.visibility === opt.value;
                const badge = visibilityBadgeStyle(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => form.setVisibility(opt.value)}
                    disabled={form.submitting}
                    style={[
                      styles.visChip,
                      {
                        borderColor: selected ? badge.borderColor : "rgba(82, 82, 82, 0.85)",
                        backgroundColor: selected ? badge.backgroundColor : "rgba(20, 20, 22, 0.9)",
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[styles.visChipText, { color: selected ? badge.color : AUTH.muted }]}
                      maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                    >
                      {visibilityLabel(opt.value)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.footerMeta}>
            <Text
              style={[
                styles.charCount,
                form.validation.charCount > POST_BODY_MAX ? styles.charCountOver : null,
              ]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {form.validation.charCount}/{POST_BODY_MAX}
            </Text>
            {form.validation.hint ? (
              <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {form.validation.hint}
              </Text>
            ) : null}
            {form.submitError ? (
              <Text style={styles.error} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {form.submitError}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const THUMB = 88;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(82, 82, 82, 0.65)",
  },
  headerSide: {
    width: 88,
    minHeight: 36,
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: AUTH.muted,
    fontSize: 16,
  },
  publishText: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  publishDisabled: {
    opacity: 0.4,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 18,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  username: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  authorHint: {
    color: AUTH.faint,
    fontSize: 12,
  },
  input: {
    minHeight: 140,
    color: AUTH.neutral100,
    fontSize: 17,
    lineHeight: 25,
    padding: 0,
  },
  mediaSection: {
    gap: 10,
  },
  sectionLabel: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  mediaStrip: {
    gap: 10,
    alignItems: "center",
  },
  thumbWrap: {
    width: THUMB,
    height: THUMB,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#141416",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbRemoveText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "600",
  },
  addTile: {
    width: THUMB,
    height: THUMB,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addTilePressed: {
    opacity: 0.88,
  },
  addTileBusy: {
    opacity: 0.7,
  },
  addIcon: {
    color: AUTH.gold,
    fontSize: 26,
    fontWeight: "300",
  },
  addLabel: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  mediaHint: {
    color: AUTH.faint,
    fontSize: 12,
  },
  visibilitySection: {
    gap: 10,
  },
  visRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  visChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  visChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  footerMeta: {
    gap: 6,
    paddingTop: 4,
  },
  charCount: {
    color: AUTH.faint,
    fontSize: 12,
    textAlign: "right",
  },
  charCountOver: {
    color: AUTH.danger,
  },
  hint: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: AUTH.danger,
    fontSize: 13,
    lineHeight: 18,
  },
});
