import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { getPosts, updatePost } from "../../api/posts";
import { resolveMediaUrl } from "../../api/config";
import { ApiError } from "../../api/client";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { POST_BODY_MAX, POST_VISIBILITY_OPTIONS, type PostVisibility } from "../../constants/createPost";
import type { Post } from "../../types/post";
import { validateCreatePost } from "../../utils/createPostValidation";
import { visibilityBadgeStyle, visibilityLabel } from "../../utils/visibilityStyles";

type EditPostScreenProps = {
  postId: string;
};

export function EditPostScreen({ postId }: EditPostScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const all = await getPosts();
        const found = all.find((p) => p.id === postId) ?? null;
        if (cancelled) return;
        if (!found) {
          setNotFound(true);
          return;
        }
        setPost(found);
        setContent(found.content);
        setVisibility(found.visibility ?? "public");
      } catch {
        if (!cancelled) setError("No se pudo cargar la publicación.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const imageCount = post?.media?.length ?? 0;
  const validation = useMemo(() => validateCreatePost(content, imageCount), [content, imageCount]);
  const canSave = validation.canSubmit && !submitting && !loading;

  const close = useCallback(() => router.back(), [router]);

  const onSave = useCallback(async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      await updatePost(postId, { content: content.trim(), visibility });
      router.back();
      if (Platform.OS !== "web") {
        Alert.alert("Goi", "Publicación actualizada.");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    } finally {
      setSubmitting(false);
    }
  }, [canSave, content, postId, router, visibility]);

  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootText}>Publicación no encontrada</Text>
        <Pressable onPress={close} style={styles.bootBtn}>
          <Text style={styles.bootBtnText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={close} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Cancelar">
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.headerTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Editar
        </Text>
        <Pressable onPress={() => void onSave()} disabled={!canSave} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Guardar">
          {submitting ? (
            <ActivityIndicator size="small" color={AUTH.gold} />
          ) : (
            <Text style={[styles.saveText, !canSave ? styles.saveDisabled : null]}>Guardar</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {imageCount > 0 ? (
            <View style={styles.mediaNote}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
                {post?.media?.map((m, i) => (
                  <Image
                    key={`${m.url}-${i}`}
                    source={{ uri: resolveMediaUrl(m.url) }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <Text style={styles.mediaHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Las fotos no se pueden cambiar aquí; solo texto y visibilidad.
              </Text>
            </View>
          ) : null}

          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            style={styles.input}
            placeholder="Texto de la publicación"
            placeholderTextColor={AUTH.faint}
            maxLength={POST_BODY_MAX + 40}
            selectionColor={AUTH.gold}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          />

          <Text style={styles.sectionLabel}>Visibilidad</Text>
          <View style={styles.visRow}>
            {POST_VISIBILITY_OPTIONS.map((opt) => {
              const selected = visibility === opt.value;
              const badge = visibilityBadgeStyle(opt.value);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setVisibility(opt.value)}
                  style={[
                    styles.visChip,
                    {
                      borderColor: selected ? badge.borderColor : "rgba(82, 82, 82, 0.85)",
                      backgroundColor: selected ? badge.backgroundColor : "rgba(20, 20, 22, 0.9)",
                    },
                  ]}
                >
                  <Text style={[styles.visChipText, { color: selected ? badge.color : AUTH.muted }]}>
                    {visibilityLabel(opt.value)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.charCount}>
            {validation.charCount}/{POST_BODY_MAX}
          </Text>
          {validation.hint ? <Text style={styles.hint}>{validation.hint}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AUTH.bg },
  flex: { flex: 1 },
  boot: { flex: 1, backgroundColor: AUTH.bg, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  bootText: { color: AUTH.muted, fontSize: 16 },
  bootBtn: { padding: 12 },
  bootBtnText: { color: AUTH.gold, fontSize: 16, fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(82, 82, 82, 0.65)",
  },
  headerSide: { width: 88, minHeight: 36, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: AUTH.neutral100, fontSize: 16, fontWeight: "600" },
  cancelText: { color: AUTH.muted, fontSize: 16 },
  saveText: { color: AUTH.gold, fontSize: 16, fontWeight: "700", textAlign: "right" },
  saveDisabled: { opacity: 0.4 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  mediaNote: { gap: 8 },
  mediaStrip: { gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: "#141416" },
  mediaHint: { color: AUTH.faint, fontSize: 12 },
  input: { minHeight: 140, color: AUTH.neutral100, fontSize: 17, lineHeight: 25, padding: 0 },
  sectionLabel: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  visRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  visChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  visChipText: { fontSize: 13, fontWeight: "600" },
  charCount: { color: AUTH.faint, fontSize: 12, textAlign: "right" },
  hint: { color: AUTH.muted, fontSize: 13 },
  error: { color: AUTH.danger, fontSize: 13 },
});
