import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD } from "../../constants/authUi";
import { useWorkoutEditorPager } from "../../hooks/useWorkoutEditorPager";
import { useWorkoutScreenHeader } from "../../hooks/useWorkoutScreenHeader";
import { WORKOUT_EXERCISES_MAX, WORKOUT_TITLE_MAX, WORKOUT_TITLE_MIN } from "../../constants/workoutFormLimits";
import { useWorkoutEditor } from "../../hooks/useWorkoutEditor";
import type { Workout } from "../../types/workout";
import { createBlockForExercise } from "../../utils/workoutBlocks";
import { duplicateExerciseBlock } from "../../utils/duplicateExerciseBlock";
import { countWorkoutSets } from "../../utils/workoutEditorMetrics";
import { workoutEditorSaveBlockReason } from "../../utils/workoutEditorSaveHint";
import { workoutHapticLight, workoutHapticSuccess } from "../../utils/workoutHaptics";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { AppScreenShell } from "../AppScreenShell";
import { AnimatedGoldButton } from "../auth/AnimatedGoldButton";
import { workoutScreenStyles, WORKOUT_UI } from "../../constants/workoutScreenUi";
import { ExerciseCatalogPanel } from "./ExerciseCatalogPanel";
import { WorkoutEditorExerciseList } from "./WorkoutEditorExerciseList";
import { WorkoutEditorPageTabs } from "./WorkoutEditorPageTabs";
import { WorkoutEditorUnsavedBanner } from "./WorkoutEditorUnsavedBanner";
import { WorkoutExercisesListHeader } from "./WorkoutExercisesListHeader";
import { WorkoutStatPills } from "./WorkoutStatPills";

type WorkoutEditorScreenProps =
  | { mode: "create" }
  | { mode: "edit"; workout: Workout };

export function WorkoutEditorScreen(props: WorkoutEditorScreenProps) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const insets = useSafeAreaInsets();
  const editor = useWorkoutEditor(props);
  const { width: pageWidth } = useWindowDimensions();
  const {
    onCatalogPage,
    goToCatalog,
    goToEditor,
    translateX,
    editorPageOpacity,
    catalogPageOpacity,
    pageTransitionMs,
    panHandlers,
  } = useWorkoutEditorPager(pageWidth);
  const scrollRef = useRef<ScrollView>(null);
  const highlightClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAfterPageRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [collapseAll, setCollapseAll] = useState(false);
  const [compactSeriesOnly, setCompactSeriesOnly] = useState(false);
  const [blockKeys, setBlockKeys] = useState<string[]>([]);
  const [highlightBlockKey, setHighlightBlockKey] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => new Set(editor.exerciseBlocks.map((b) => b.exerciseId)),
    [editor.exerciseBlocks]
  );

  const slotsLeft = WORKOUT_EXERCISES_MAX - editor.exerciseBlocks.length;
  const exerciseCount = editor.exerciseBlocks.length;
  const totalSets = countWorkoutSets(editor.exerciseBlocks);
  const titleTrim = editor.title.trim();
  const pageTitle = editor.isEdit ? "Editar rutina" : "Nueva rutina";

  const saveStatus = editor.saving
    ? "Guardando…"
    : editor.isDirty
      ? "Sin guardar"
      : "Guardado";

  const unsavedBannerStatus = editor.saving ? "saving" : editor.isDirty ? "dirty" : null;

  const saveBlockReason = workoutEditorSaveBlockReason({
    titleTrim,
    exerciseCount,
    saving: editor.saving,
    canSave: editor.canSave,
  });

  const addExercisesLabel = useMemo(() => {
    if (slotsLeft <= 0) return "+ Ejercicios";
    return `+ Ejercicios · ${exerciseCount}/${WORKOUT_EXERCISES_MAX}`;
  }, [exerciseCount, slotsLeft]);

  const handleBack = useCallback(() => {
    if (onCatalogPage) {
      goToEditor();
      return;
    }
    if (!editor.isDirty) {
      router.back();
      return;
    }
    showAlert({
      title: "Cambios sin guardar",
      message: "Tu progreso se guarda como borrador. Puedes retomarlo desde Entrenar.",
      buttons: [
        { text: "Seguir editando", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => router.back() },
      ],
    });
  }, [editor.isDirty, onCatalogPage, goToEditor, router, showAlert]);

  useWorkoutScreenHeader({
    title: pageTitle,
    statusLabel: onCatalogPage ? undefined : saveStatus,
    onBack: handleBack,
  });

  useEffect(() => {
    const n = editor.exerciseBlocks.length;
    setBlockKeys((prev) => {
      if (prev.length === n && prev.every(Boolean)) return prev;
      const next = prev.slice(0, n);
      while (next.length < n) {
        next.push(`bk-${Date.now()}-${next.length}-${Math.random().toString(36).slice(2, 7)}`);
      }
      return next;
    });
  }, [editor.exerciseBlocks.length]);

  useEffect(() => {
    return () => {
      if (highlightClearRef.current) clearTimeout(highlightClearRef.current);
      if (scrollAfterPageRef.current) clearTimeout(scrollAfterPageRef.current);
    };
  }, []);

  const handlePickExercise = useCallback(
    (exerciseId: string) => {
      if (selectedIds.has(exerciseId) || slotsLeft <= 0) return;
      workoutHapticLight();

      const newKey = `bk-${Date.now()}-${exerciseCount}`;
      setHighlightBlockKey(newKey);
      setBlockKeys((keys) => [...keys, newKey]);
      const picked = editor.catalogById.get(exerciseId);
      editor.setExerciseBlocks((prev) => [...prev, createBlockForExercise(exerciseId, picked)]);

      if (highlightClearRef.current) clearTimeout(highlightClearRef.current);
      highlightClearRef.current = setTimeout(() => setHighlightBlockKey(null), 1200);

      goToEditor();

      if (scrollAfterPageRef.current) clearTimeout(scrollAfterPageRef.current);
      scrollAfterPageRef.current = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, pageTransitionMs + 40);
    },
    [editor, exerciseCount, selectedIds, slotsLeft, goToEditor, pageTransitionMs]
  );

  const duplicateBlock = useCallback(
    (index: number) => {
      if (editor.exerciseBlocks.length >= WORKOUT_EXERCISES_MAX) return;
      const source = editor.exerciseBlocks[index];
      if (!source) return;
      workoutHapticLight();
      const copy = duplicateExerciseBlock(source);
      const newKey = `bk-${Date.now()}-dup-${index}`;
      editor.setExerciseBlocks((prev) => {
        const next = [...prev];
        next.splice(index + 1, 0, copy);
        return next;
      });
      setBlockKeys((prev) => {
        const next = [...prev];
        next.splice(index + 1, 0, newKey);
        return next;
      });
    },
    [editor]
  );

  const moveBlock = useCallback(
    (index: number, delta: -1 | 1) => {
      const j = index + delta;
      if (j < 0 || j >= editor.exerciseBlocks.length) return;
      editor.setExerciseBlocks((prev) => {
        const next = [...prev];
        const tmp = next[index]!;
        next[index] = next[j]!;
        next[j] = tmp;
        return next;
      });
      setBlockKeys((prev) => {
        const next = [...prev];
        const tmp = next[index];
        next[index] = next[j]!;
        next[j] = tmp!;
        return next;
      });
    },
    [editor]
  );

  const handleSave = useCallback(async () => {
    const saved = await editor.save();
    if (saved) {
      workoutHapticSuccess();
      router.replace("/(tabs)/entrenamientos");
    }
  }, [editor, router]);

  const handleClearDraft = useCallback(() => {
    showAlert({
      title: "Limpiar borrador",
      message: editor.isEdit
        ? "Volverás al último estado guardado de la rutina. Los cambios locales se descartarán."
        : "Se borrará el borrador local y el formulario quedará vacío.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: () => {
            void editor.clearDraft().then(() => {
              setBlockKeys([]);
              setHighlightBlockKey(null);
              workoutHapticLight();
            });
          },
        },
      ],
    });
  }, [editor, showAlert]);

  if (!editor.hydrated) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  return (
    <AppScreenShell>
      <View style={workoutScreenStyles.screenRoot} {...panHandlers}>
        <WorkoutEditorPageTabs
          active={onCatalogPage ? "catalog" : "routine"}
          onRoutine={goToEditor}
          onCatalog={goToCatalog}
          exerciseCount={exerciseCount}
        />

        {!onCatalogPage && unsavedBannerStatus ? (
          <WorkoutEditorUnsavedBanner status={unsavedBannerStatus} />
        ) : null}

        <View style={styles.pagerClip}>
          <Animated.View
            style={[styles.pagerTrack, { width: pageWidth * 2, transform: [{ translateX }] }]}
          >
            <Animated.View style={[styles.pagerPage, { width: pageWidth, opacity: editorPageOpacity }]}>
              <ScrollView
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
                showsVerticalScrollIndicator={false}
                style={styles.editorScroll}
              >
                {editor.error ? (
                  <Text style={workoutScreenStyles.errorBanner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {editor.error}
                  </Text>
                ) : null}

                <View style={workoutScreenStyles.sectionCard}>
                  <View style={workoutScreenStyles.cardGlowLine} />
                  <View style={styles.titleRow}>
                    <Text style={workoutScreenStyles.fieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Título
                    </Text>
                    {editor.hasDraftToClear ? (
                      <Pressable
                        onPress={handleClearDraft}
                        disabled={editor.saving}
                        style={({ pressed }) => [
                          styles.clearDraftBtn,
                          editor.saving ? styles.footerBtnDisabled : null,
                          pressed ? workoutScreenStyles.pressed : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Limpiar borrador local"
                      >
                        <Text style={styles.clearDraftText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          Limpiar borrador
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <TextInput
                    value={editor.title}
                    onChangeText={editor.setTitle}
                    placeholder="Ej. Empuje — upper"
                    placeholderTextColor={AUTH.faint}
                    maxLength={WORKOUT_TITLE_MAX}
                    style={[workoutScreenStyles.input, editor.titleTooShort ? styles.inputWarn : null]}
                    editable={!editor.saving}
                    accessibilityLabel="Título de la rutina"
                  />
                  {editor.titleTooShort ? (
                    <Text style={styles.warnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Mínimo {WORKOUT_TITLE_MIN} caracteres
                    </Text>
                  ) : null}

                  {exerciseCount > 0 ? (
                    <View style={styles.titleCardStats}>
                      <WorkoutStatPills
                        compact
                        items={[
                          { label: "Ejercicios", value: String(exerciseCount), accent: true },
                          { label: "Series", value: String(totalSets) },
                          { label: "Libres", value: String(slotsLeft) },
                        ]}
                      />
                    </View>
                  ) : null}
                </View>

                {editor.catalogError ? (
                  <Text style={styles.catalogError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {editor.catalogError}
                  </Text>
                ) : null}

                {editor.catalogLoading && exerciseCount === 0 ? (
                  <ActivityIndicator color={AUTH.gold} style={{ marginVertical: 16 }} />
                ) : null}

                {exerciseCount === 0 ? (
                  <View style={styles.emptyBox}>
                    <View style={styles.emptyIcon}>
                      <Text style={styles.emptyIconGlyph} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        ◇
                      </Text>
                    </View>
                    <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Sin ejercicios todavía
                    </Text>
                    <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Elige movimientos del catálogo para armar tu rutina.
                    </Text>
                    <View style={styles.emptyCta}>
                      <AnimatedGoldButton
                        label="Abrir catálogo"
                        loadingLabel="Abriendo…"
                        loading={false}
                        onPress={goToCatalog}
                        disabled={editor.saving}
                        accessibilityLabel="Abrir catálogo de ejercicios"
                      />
                    </View>
                  </View>
                ) : null}

                {exerciseCount > 0 ? (
                  <>
                    <WorkoutExercisesListHeader
                      count={exerciseCount}
                      max={WORKOUT_EXERCISES_MAX}
                      collapseAll={collapseAll}
                      onToggleCollapseAll={() => setCollapseAll((c) => !c)}
                      compactSeriesOnly={compactSeriesOnly}
                      onToggleCompactSeriesOnly={() => setCompactSeriesOnly((c) => !c)}
                      fullBleed
                    />
              <WorkoutEditorExerciseList
                blocks={editor.exerciseBlocks}
                blockKeys={blockKeys}
                highlightBlockKey={highlightBlockKey}
                catalogById={editor.catalogById}
                disabled={editor.saving}
                collapseAll={collapseAll}
                hideConfig={compactSeriesOnly}
                canDuplicateAt={() => editor.exerciseBlocks.length < WORKOUT_EXERCISES_MAX}
                onChange={(index, next) => {
                  editor.setExerciseBlocks((prev) => {
                    const copy = [...prev];
                    copy[index] = next;
                    return copy;
                  });
                }}
                onRemove={(index) => {
                  editor.setExerciseBlocks((prev) => prev.filter((_, i) => i !== index));
                  setBlockKeys((prev) => prev.filter((_, i) => i !== index));
                }}
                onMoveUp={(index) => moveBlock(index, -1)}
                onMoveDown={(index) => moveBlock(index, 1)}
                onDuplicate={duplicateBlock}
              />
                  </>
                ) : null}
              </ScrollView>
            </Animated.View>

            <Animated.View style={[styles.pagerPage, { width: pageWidth, opacity: catalogPageOpacity }]}>
              <ExerciseCatalogPanel
                embedded
                catalog={editor.catalog}
                loading={editor.catalogLoading}
                error={editor.catalogError}
                selectedIds={selectedIds}
                slotsLeft={slotsLeft}
                onPick={handlePickExercise}
                keepOpenOnPick
              />
            </Animated.View>
          </Animated.View>
        </View>

        {!onCatalogPage ? (
          <View style={[workoutScreenStyles.stickyFooter, styles.footerWrap, { paddingBottom: insets.bottom + 12 }]}>
            {saveBlockReason ? (
              <Text style={styles.footerHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {saveBlockReason}
              </Text>
            ) : null}
            <View style={styles.footer}>
              <Pressable
                onPress={goToCatalog}
                disabled={editor.saving || slotsLeft <= 0}
                style={({ pressed }) => [
                  workoutScreenStyles.secondaryFooterBtn,
                  styles.footerAddBtn,
                  editor.saving || slotsLeft <= 0 ? styles.footerBtnDisabled : null,
                  pressed ? workoutScreenStyles.pressed : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Añadir ejercicios"
              >
                <Text
                  style={workoutScreenStyles.secondaryFooterBtnText}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  numberOfLines={1}
                >
                  {addExercisesLabel}
                </Text>
              </Pressable>
              <View style={styles.footerSaveBtn}>
                <AnimatedGoldButton
                  label={editor.isDirty ? "Guardar rutina ·" : "Guardar rutina"}
                  loadingLabel="Guardando…"
                  loading={editor.saving}
                  disabled={!editor.canSave}
                  onPress={() => void handleSave()}
                  accessibilityLabel="Guardar rutina"
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </AppScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: WORKOUT_UI.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  pagerClip: {
    flex: 1,
    overflow: "hidden",
  },
  pagerTrack: {
    flex: 1,
    flexDirection: "row",
  },
  pagerPage: {
    flex: 1,
  },
  editorScroll: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: AUTH_PAD,
    paddingTop: 8,
    gap: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  clearDraftBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.4)",
    backgroundColor: "rgba(40, 20, 20, 0.35)",
  },
  clearDraftText: {
    color: AUTH.danger,
    fontSize: 11,
    fontWeight: "600",
  },
  titleCardStats: {
    marginTop: 4,
  },
  catalogError: {
    color: AUTH.danger,
    fontSize: 13,
  },
  inputWarn: {
    borderColor: "rgba(251, 191, 36, 0.55)",
  },
  warnText: {
    color: "#fbbf24",
    fontSize: 12,
    marginTop: -4,
  },
  footerWrap: {
    gap: 8,
  },
  footerHint: {
    color: AUTH.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  footerAddBtn: {
    minWidth: 128,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  footerSaveBtn: {
    flex: 1,
    minHeight: 48,
  },
  footerBtnDisabled: {
    opacity: 0.4,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: WORKOUT_UI.border,
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(8, 8, 10, 0.5)",
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconGlyph: {
    color: AUTH.gold,
    fontSize: 22,
    fontWeight: "300",
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyCta: {
    width: "100%",
    marginTop: 4,
  },
});
