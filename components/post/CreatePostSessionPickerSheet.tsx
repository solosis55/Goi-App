import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";
import type { SessionSelectMeta } from "../../hooks/useCreatePostForm";
import { formatSessionPerformedAt } from "../../utils/formatSessionDate";

type CreatePostSessionPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  sessions: WorkoutSessionWithTitle[];
  available: WorkoutSessionWithTitle[];
  loading: boolean;
  value: string | null;
  suggestedSessionId?: string | null;
  showUnlink?: boolean;
  onSelect: (sessionId: string | null, meta?: SessionSelectMeta) => void;
};

export function CreatePostSessionPickerSheet({
  visible,
  onClose,
  sessions,
  available,
  loading,
  value,
  suggestedSessionId,
  showUnlink = true,
  onSelect,
}: CreatePostSessionPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const ordered = useMemo(() => {
    const suggested = suggestedSessionId ? available.find((s) => s.id === suggestedSessionId) : null;
    if (!suggested || value === suggested.id) return available;
    return [suggested, ...available.filter((s) => s.id !== suggested.id)];
  }, [available, suggestedSessionId, value]);

  const pick = (id: string | null, meta?: SessionSelectMeta) => {
    onSelect(id, meta);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8, maxHeight: "82%" }]}>
        <View style={styles.handle} />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Elegir sesión
        </Text>
        <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Solo sesiones guardadas que aún no tienen publicación
        </Text>

        {loading ? (
          <ActivityIndicator color={AUTH.gold} style={styles.loader} />
        ) : sessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Sin sesiones registradas
            </Text>
            <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Completa un entrenamiento para vincularlo a una publicación.
            </Text>
            <Pressable
              onPress={() => {
                onClose();
                router.push("/(tabs)/entrenamientos");
              }}
              style={({ pressed }) => [styles.cta, pressed ? styles.pressed : null]}
            >
              <Text style={styles.ctaText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Ir a entrenar
              </Text>
            </Pressable>
          </View>
        ) : available.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Todas publicadas
            </Text>
            <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Haz un nuevo entrenamiento para compartir otra sesión.
            </Text>
            <Pressable
              onPress={() => {
                onClose();
                router.push("/(tabs)/entrenamientos");
              }}
              style={({ pressed }) => [styles.cta, pressed ? styles.pressed : null]}
            >
              <Text style={styles.ctaText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Ir a entrenar
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {showUnlink ? (
              <Pressable
                onPress={() => pick(null)}
                style={({ pressed }) => [
                  styles.row,
                  value === null ? styles.rowSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.rowTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Sin sesión vinculada
                </Text>
                <Text style={styles.rowSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Solo texto o fotos
                </Text>
              </Pressable>
            ) : null}
            {ordered.map((s) => {
              const selected = value === s.id;
              const isSuggested = suggestedSessionId === s.id && !selected;
              const dateLabel = formatSessionPerformedAt(s.performedAt);
              return (
                <Pressable
                  key={s.id}
                  onPress={() =>
                    pick(s.id, {
                      workoutTitle: s.workoutTitle,
                      performedAt: s.performedAt,
                      notes: s.notes,
                      workoutId: s.workoutId,
                      snapshot: s.snapshot ?? null,
                    })
                  }
                  style={({ pressed }) => [
                    styles.row,
                    selected ? styles.rowSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.rowTop}>
                    <Text
                      style={[styles.rowTitle, selected ? styles.rowTitleActive : null]}
                      numberOfLines={1}
                      maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                    >
                      {s.workoutTitle}
                    </Text>
                    {isSuggested ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          Reciente
                        </Text>
                      </View>
                    ) : null}
                    {selected ? <Text style={styles.check}>✓</Text> : null}
                  </View>
                  <Text style={styles.rowSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {dateLabel ? `Sesión · ${dateLabel}` : "Sesión realizada"}
                    {s.notes?.trim() ? ` · ${s.notes.trim().slice(0, 48)}` : ""}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#0c0c0e",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(82, 82, 82, 0.55)",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.65)",
    marginBottom: 10,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  sub: {
    color: AUTH.faint,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  loader: {
    marginVertical: 24,
  },
  list: {
    maxHeight: 420,
  },
  emptyBox: {
    padding: 16,
    gap: 8,
    alignItems: "center",
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  cta: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  ctaText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.65)",
    backgroundColor: "rgba(14, 14, 16, 0.9)",
    marginBottom: 8,
    gap: 4,
  },
  rowSelected: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  rowTitleActive: {
    color: AUTH.gold,
  },
  rowSub: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  badgeText: {
    color: AUTH.gold,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  check: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
