import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SessionSelectMeta } from "../../hooks/useCreatePostForm";
import type { PostSessionPickerController } from "../../hooks/usePostSessionPicker";
import { formatSessionPerformedAt } from "../../utils/formatSessionDate";
import {
  SESSION_PICKER_DATE_PRESETS,
  isSessionPickerItemLinked,
} from "../../utils/sessionPickerDateRange";
import { groupSessionsForPicker } from "../../utils/sessionPickerGroups";
import { formatSessionPickerMetrics } from "../../utils/sessionPickerMetrics";
import { CreatePostSessionTodayCta } from "./CreatePostSessionHero";

type CreatePostSessionPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  picker: PostSessionPickerController;
  value: string | null;
  showUnlink?: boolean;
  onSelect: (sessionId: string | null, meta?: SessionSelectMeta) => void;
};

export function CreatePostSessionPickerSheet({
  visible,
  onClose,
  picker,
  value,
  showUnlink = true,
  onSelect,
}: CreatePostSessionPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * 0.88);

  useEffect(() => {
    if (!visible) return;
    void picker.refresh();
  }, [visible, picker.refresh]);

  const hasFilters =
    picker.query.trim().length > 0 || picker.datePreset !== "all" || Boolean(picker.workoutId);

  const groups = useMemo(
    () =>
      groupSessionsForPicker(picker.sessions, {
        suggestedSessionId:
          picker.suggestedSessionId &&
          !isSessionPickerItemLinked(picker.getSession(picker.suggestedSessionId) ?? {})
            ? picker.suggestedSessionId
            : null,
      }),
    [picker.sessions, picker.suggestedSessionId, picker]
  );

  const pick = (id: string | null, meta?: SessionSelectMeta) => {
    onSelect(id, meta);
    onClose();
  };

  const linkToday = async () => {
    const session = picker.todayAvailableSession ?? (await picker.linkTodaySession());
    if (!session) return;
    pick(session.id, {
      workoutTitle: session.workoutTitle,
      performedAt: session.performedAt,
      notes: session.notes,
      snapshot: session.snapshot,
      workoutId: session.workoutId,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />

        <View
          style={[
            styles.sheet,
            {
              height: sheetMaxHeight,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.sheetHead}>
            <View style={styles.sheetHeadText}>
              <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Vincular sesión
              </Text>
              <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Las ya publicadas aparecen deshabilitadas. Usa filtros si tienes muchas sesiones.
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cerrar
              </Text>
            </Pressable>
          </View>

          <View style={styles.filtersBlock}>
            <TextInput
              value={picker.query}
              onChangeText={picker.setQuery}
              placeholder="Buscar rutina, ejercicio o nota…"
              placeholderTextColor={AUTH.faint}
              style={styles.search}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
              style={styles.chipsScroll}
              keyboardShouldPersistTaps="handled"
            >
              {SESSION_PICKER_DATE_PRESETS.map((preset) => (
                <Pressable
                  key={preset.id}
                  onPress={() => picker.setDatePreset(preset.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    picker.datePreset === preset.id ? styles.chipActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text
                    style={[styles.chipText, picker.datePreset === preset.id ? styles.chipTextActive : null]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {picker.routineOptions.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
                style={styles.chipsScroll}
                keyboardShouldPersistTaps="handled"
              >
                <Pressable
                  onPress={() => picker.setWorkoutId("")}
                  style={({ pressed }) => [
                    styles.chip,
                    !picker.workoutId ? styles.chipActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text
                    style={[styles.chipText, !picker.workoutId ? styles.chipTextActive : null]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    Todas
                  </Text>
                </Pressable>
                {picker.routineOptions.map((routine) => (
                  <Pressable
                    key={routine.workoutId}
                    onPress={() => picker.setWorkoutId(routine.workoutId)}
                    style={({ pressed }) => [
                      styles.chip,
                      picker.workoutId === routine.workoutId ? styles.chipActive : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        picker.workoutId === routine.workoutId ? styles.chipTextActive : null,
                      ]}
                      maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                      numberOfLines={1}
                    >
                      {routine.workoutTitle} ({routine.sessionCount})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>

          <View style={styles.body}>
            {picker.loading ? (
              <ActivityIndicator color={AUTH.gold} style={styles.loader} />
            ) : picker.sessions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {hasFilters ? "Sin resultados" : "Sin sesiones registradas"}
                </Text>
                <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {hasFilters
                    ? "Prueba otro término o amplía el rango de fechas."
                    : "Completa un entrenamiento para vincularlo a una publicación."}
                </Text>
                {!hasFilters ? (
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
                ) : null}
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {!value && picker.todayAvailableSession ? (
                  <View style={styles.todayWrap}>
                    <CreatePostSessionTodayCta
                      session={picker.todayAvailableSession}
                      onPress={() => void linkToday()}
                    />
                  </View>
                ) : null}

                {showUnlink && !hasFilters ? (
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
                {groups.map((group) => (
                  <View key={group.label} style={styles.group}>
                    <Text style={styles.groupLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {group.label}
                    </Text>
                    {group.sessions.map((s) => {
                      const linked = isSessionPickerItemLinked(s);
                      const selected = value === s.id;
                      const isSuggested =
                        picker.suggestedSessionId === s.id && group.label === "Recomendado" && !selected && !linked;
                      const dateLabel = formatSessionPerformedAt(s.performedAt);
                      const metrics = formatSessionPickerMetrics(s);
                      return (
                        <Pressable
                          key={s.id}
                          disabled={linked}
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
                            linked ? styles.rowLinked : null,
                            selected ? styles.rowSelected : null,
                            !linked && pressed ? styles.pressed : null,
                          ]}
                        >
                          <View style={styles.rowTop}>
                            <Text
                              style={[
                                styles.rowTitle,
                                selected ? styles.rowTitleActive : null,
                                linked ? styles.rowTitleLinked : null,
                              ]}
                              numberOfLines={1}
                              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                            >
                              {s.workoutTitle}
                            </Text>
                            {linked ? (
                              <View style={styles.badgeMuted}>
                                <Text style={styles.badgeMutedText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                                  Publicada
                                </Text>
                              </View>
                            ) : null}
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
                            {linked ? " · Ya compartida en el feed" : ""}
                          </Text>
                          {metrics ? (
                            <Text style={styles.rowMetrics} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                              {metrics}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
                {picker.hasMore ? (
                  <Pressable
                    onPress={() => picker.loadMore()}
                    disabled={picker.loadingMore}
                    style={({ pressed }) => [styles.loadMore, pressed ? styles.pressed : null]}
                  >
                    <Text style={styles.loadMoreText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {picker.loadingMore ? "Cargando…" : "Cargar más sesiones"}
                    </Text>
                  </Pressable>
                ) : null}
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  sheet: {
    width: "100%",
    zIndex: 2,
    elevation: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#0c0c0e",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(82, 82, 82, 0.55)",
    paddingHorizontal: 16,
    paddingTop: 10,
    overflow: "hidden",
    flexDirection: "column",
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
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  sheetHeadText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  closeText: {
    color: AUTH.muted,
    fontSize: 15,
    fontWeight: "600",
  },
  title: { color: AUTH.neutral100, fontSize: 18, fontWeight: "700" },
  sub: { color: AUTH.faint, fontSize: 12, lineHeight: 17 },
  filtersBlock: {
    gap: 8,
    marginBottom: 10,
    flexShrink: 0,
  },
  search: {
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    borderRadius: 12,
    backgroundColor: "rgba(14, 14, 16, 0.95)",
    color: AUTH.neutral100,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipsScroll: { flexGrow: 0, height: 34 },
  chipsRow: { gap: 6, paddingRight: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    backgroundColor: "rgba(14, 14, 16, 0.9)",
  },
  chipActive: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  chipText: { color: AUTH.muted, fontSize: 11, fontWeight: "600" },
  chipTextActive: { color: AUTH.gold },
  body: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 180,
  },
  todayWrap: { marginBottom: 10 },
  loader: { marginVertical: 24 },
  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
  group: { marginBottom: 12, gap: 8 },
  groupLabel: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingHorizontal: 2,
  },
  emptyBox: { padding: 16, gap: 8, alignItems: "center" },
  emptyTitle: { color: AUTH.neutral100, fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptyBody: { color: AUTH.muted, fontSize: 13, lineHeight: 18, textAlign: "center" },
  cta: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  ctaText: { color: AUTH.gold, fontSize: 14, fontWeight: "600" },
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
  rowLinked: { opacity: 0.55, backgroundColor: "rgba(10, 10, 12, 0.85)" },
  rowSelected: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowTitle: { flex: 1, color: AUTH.neutral100, fontSize: 15, fontWeight: "600" },
  rowTitleActive: { color: AUTH.gold },
  rowTitleLinked: { color: AUTH.muted },
  rowSub: { color: AUTH.muted, fontSize: 12, lineHeight: 16 },
  rowMetrics: { color: AUTH.faint, fontSize: 12, lineHeight: 16 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  badgeText: { color: AUTH.gold, fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  badgeMuted: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    backgroundColor: "rgba(20, 20, 22, 0.9)",
  },
  badgeMutedText: { color: AUTH.faint, fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  check: { color: AUTH.gold, fontSize: 16, fontWeight: "700" },
  loadMore: {
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    alignItems: "center",
  },
  loadMoreText: { color: AUTH.muted, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.88 },
});
