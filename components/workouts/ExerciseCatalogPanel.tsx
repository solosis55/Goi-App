import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../../constants/authUi";
import { CATALOG_EQUIPMENT_OPTIONS } from "../../constants/exerciseEquipment";
import { exerciseCatalogStyles as catalogStyles } from "../../constants/exerciseCatalogUi";
import { CATALOG_MUSCLE_OPTIONS } from "../../constants/exerciseMuscleFilters";
import { WORKOUT_EXERCISES_MAX } from "../../constants/workoutFormLimits";
import type { Exercise } from "../../types/exercise";
import { EQUIPMENT_LABEL, MUSCLE_LABEL } from "../../utils/catalogExerciseDisplay";
import { filterExercisesByCatalogQuery, toggleSlugList } from "../../utils/filterExerciseCatalog";
import {
  groupExercisesByMuscle,
  sortCatalogExercises,
  type CatalogSortMode,
} from "../../utils/catalogExerciseSort";
import {
  getCatalogExerciseUsage,
  recordCatalogExercisePick,
  type UsageStore,
} from "../../utils/catalogExerciseUsage";
import { ExerciseCatalogActiveFilterChips, type ActiveFilterChip } from "./ExerciseCatalogActiveFilterChips";
import { ExerciseCatalogFilters } from "./ExerciseCatalogFilters";
import { ExerciseCatalogRow } from "./ExerciseCatalogRow";
import { ExerciseCatalogSearchBar } from "./ExerciseCatalogSearchBar";
import { ExerciseCatalogSortBar } from "./ExerciseCatalogSortBar";
import { ExerciseDetailSheet } from "./ExerciseDetailSheet";
import { WorkoutListSkeleton } from "./WorkoutListSkeleton";

export type ExerciseCatalogPanelProps = {
  catalog: Exercise[];
  loading?: boolean;
  error?: string | null;
  selectedIds: Set<string>;
  slotsLeft: number;
  onPick: (exerciseId: string) => void;
  /** Varios movimientos a la vez (modal pantalla completa). */
  onPickMany?: (exerciseIds: string[]) => void;
  onClose?: () => void;
  keepOpenOnPick?: boolean;
  embedded?: boolean;
  closeLabel?: string;
  title?: string;
};

type MuscleSection = { title: string; key: string; data: Exercise[] };

type CatalogListItem =
  | { kind: "sectionHeader"; key: string; title: string }
  | { kind: "exercise"; exercise: Exercise };

function CatalogListHeader({ count, hasFilters }: { count: number; hasFilters: boolean }) {
  return (
    <View style={catalogStyles.listHeader}>
      <Text style={catalogStyles.listHeaderText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Movimientos
      </Text>
      <Text style={catalogStyles.listHeaderCount} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {count}
        {hasFilters ? " · filtrados" : ""}
      </Text>
    </View>
  );
}

function CatalogEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <View style={catalogStyles.emptyCard}>
      <Text style={catalogStyles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Sin resultados
      </Text>
      <Text style={catalogStyles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {hasFilters
          ? "Prueba otro término o quita algún filtro de músculo o material."
          : "No hay movimientos en el catálogo."}
      </Text>
    </View>
  );
}

export function ExerciseCatalogPanel({
  catalog,
  loading,
  error,
  selectedIds,
  slotsLeft,
  onPick,
  onPickMany,
  onClose,
  keepOpenOnPick = false,
  embedded = false,
  closeLabel = "Cerrar",
  title = "Catálogo",
}: ExerciseCatalogPanelProps) {
  const insets = useSafeAreaInsets();
  const multiSelectMode = !embedded && Boolean(onPickMany);

  const [query, setQuery] = useState("");
  const [muscleSlugs, setMuscleSlugs] = useState<string[]>([]);
  const [equipmentSlugs, setEquipmentSlugs] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<CatalogSortMode>("muscle");
  const [filtersExpanded, setFiltersExpanded] = useState(!embedded);
  const [usage, setUsage] = useState<UsageStore>({});
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [floatingSectionTitle, setFloatingSectionTitle] = useState<string | null>(null);

  useEffect(() => {
    void getCatalogExerciseUsage().then(setUsage);
  }, []);

  const filtered = useMemo(
    () => filterExercisesByCatalogQuery(catalog, query, muscleSlugs, equipmentSlugs),
    [catalog, query, muscleSlugs, equipmentSlugs],
  );

  const sorted = useMemo(
    () => sortCatalogExercises(filtered, sortMode, usage),
    [filtered, sortMode, usage],
  );

  const sections: MuscleSection[] = useMemo(() => {
    if (sortMode !== "muscle") {
      return [{ key: "all", title: "Todos", data: sorted }];
    }
    return groupExercisesByMuscle(sorted);
  }, [sorted, sortMode]);

  const showSectionHeaders = sortMode === "muscle" && sections.length > 1;

  const listItems = useMemo((): CatalogListItem[] => {
    const out: CatalogListItem[] = [];
    for (const section of sections) {
      if (showSectionHeaders) {
        out.push({ kind: "sectionHeader", key: `${section.key}-header`, title: section.title });
      }
      for (const exercise of section.data) {
        out.push({ kind: "exercise", exercise });
      }
    }
    return out;
  }, [sections, showSectionHeaders]);

  const listItemsRef = useRef(listItems);
  listItemsRef.current = listItems;

  const sectionTitleByIndex = useMemo(() => {
    const map = new Map<number, string>();
    if (!showSectionHeaders) return map;
    let current = "";
    for (let i = 0; i < listItems.length; i += 1) {
      const item = listItems[i];
      if (item.kind === "sectionHeader") {
        current = item.title;
      } else if (item.kind === "exercise" && current) {
        map.set(i, current);
      }
    }
    return map;
  }, [listItems, showSectionHeaders]);

  useEffect(() => {
    if (!showSectionHeaders) setFloatingSectionTitle(null);
  }, [showSectionHeaders, sortMode, query, muscleSlugs, equipmentSlugs]);

  const catalogViewabilityConfig = useRef({ itemVisiblePercentThreshold: 20, minimumViewTime: 80 }).current;

  const onCatalogViewableChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!showSectionHeaders) {
        setFloatingSectionTitle(null);
        return;
      }
      const items = listItemsRef.current;
      const visible = viewableItems
        .filter((token) => token.isViewable && token.index != null)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      if (visible.length === 0) return;

      const topIndex = visible[0].index!;
      const topItem = items[topIndex];
      if (topItem?.kind === "sectionHeader") {
        setFloatingSectionTitle(null);
        return;
      }

      const title = sectionTitleByIndex.get(topIndex);
      setFloatingSectionTitle(title ?? null);
    },
    [showSectionHeaders, sectionTitleByIndex]
  );

  const totalCount = sorted.length;
  const hasFilters =
    muscleSlugs.length > 0 || equipmentSlugs.length > 0 || query.trim().length > 0;
  const atCapacity = slotsLeft <= 0;

  const activeFilterChips: ActiveFilterChip[] = useMemo(() => {
    const chips: ActiveFilterChip[] = [];
    for (const slug of muscleSlugs) {
      chips.push({
        key: `m-${slug}`,
        label: MUSCLE_LABEL[slug] ?? slug,
        onRemove: () => setMuscleSlugs((prev) => prev.filter((s) => s !== slug)),
      });
    }
    for (const slug of equipmentSlugs) {
      chips.push({
        key: `e-${slug}`,
        label: EQUIPMENT_LABEL[slug] ?? slug,
        onRemove: () => setEquipmentSlugs((prev) => prev.filter((s) => s !== slug)),
      });
    }
    return chips;
  }, [muscleSlugs, equipmentSlugs]);

  const showActiveFilterChips = embedded && !filtersExpanded && activeFilterChips.length > 0;

  const flashHighlight = useCallback((id: string) => {
    setHighlightId(id);
    const t = setTimeout(() => setHighlightId(null), 700);
    return () => clearTimeout(t);
  }, []);

  const handlePickOne = useCallback(
    (id: string) => {
      void recordCatalogExercisePick(id).then(() => {
        void getCatalogExerciseUsage().then(setUsage);
      });
      onPick(id);
      flashHighlight(id);
      if (!keepOpenOnPick) onClose?.();
    },
    [onPick, keepOpenOnPick, onClose, flashHighlight],
  );

  const togglePicked = useCallback((id: string) => {
    setPickedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const room = WORKOUT_EXERCISES_MAX - selectedIds.size - prev.length;
      if (room <= 0) return prev;
      return [...prev, id];
    });
  }, [selectedIds.size]);

  const handleBulkAdd = useCallback(() => {
    if (pickedIds.length === 0 || !onPickMany) return;
    for (const id of pickedIds) void recordCatalogExercisePick(id);
    void getCatalogExerciseUsage().then(setUsage);
    onPickMany(pickedIds);
    setPickedIds([]);
    onClose?.();
  }, [pickedIds, onPickMany, onClose]);

  const slotsPill = (
    <View style={[catalogStyles.slotsPill, atCapacity ? catalogStyles.slotsPillMuted : null]}>
      <Text
        style={[catalogStyles.slotsPillText, atCapacity ? catalogStyles.slotsPillTextMuted : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {atCapacity
          ? "Rutina completa"
          : `${slotsLeft} plaza${slotsLeft === 1 ? "" : "s"} libre${slotsLeft === 1 ? "" : "s"}`}
      </Text>
    </View>
  );

  const stickyToolbar = (
    <View style={catalogStyles.stickyToolbar}>
      <View style={catalogStyles.toolbarCard}>
        {embedded ? (
          <Text style={catalogStyles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Catálogo de movimientos
          </Text>
        ) : null}

        {!embedded ? slotsPill : null}

        <ExerciseCatalogSearchBar value={query} onChangeText={setQuery} />

        {showActiveFilterChips ? (
          <ExerciseCatalogActiveFilterChips chips={activeFilterChips} />
        ) : null}

        <ExerciseCatalogSortBar value={sortMode} onChange={setSortMode} />

        <ExerciseCatalogFilters
          compact={embedded}
          muscleOptions={CATALOG_MUSCLE_OPTIONS}
          equipmentOptions={CATALOG_EQUIPMENT_OPTIONS}
          muscleSlugs={muscleSlugs}
          equipmentSlugs={equipmentSlugs}
          onToggleMuscle={(slug) => setMuscleSlugs((prev) => toggleSlugList(prev, slug))}
          onToggleEquipment={(slug) => setEquipmentSlugs((prev) => toggleSlugList(prev, slug))}
          onClearMuscles={() => setMuscleSlugs([])}
          onClearEquipment={() => setEquipmentSlugs([])}
          onExpandedChange={setFiltersExpanded}
        />
      </View>
      <CatalogListHeader count={totalCount} hasFilters={hasFilters} />
    </View>
  );

  const listBottomPad = insets.bottom + 24 + (multiSelectMode && pickedIds.length > 0 ? 72 : 0);

  const listExtraKey = useMemo(
    () =>
      [
        highlightId ?? "",
        pickedIds.join(","),
        [...selectedIds].sort().join(","),
        multiSelectMode ? "1" : "0",
        atCapacity ? "1" : "0",
      ].join("|"),
    [highlightId, pickedIds, selectedIds, multiSelectMode, atCapacity]
  );

  const renderCatalogItem = useCallback(
    ({ item }: { item: CatalogListItem }) => {
      if (item.kind === "sectionHeader") {
        return (
          <View style={catalogStyles.sectionHeader}>
            <Text style={catalogStyles.sectionHeaderText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {item.title}
            </Text>
          </View>
        );
      }
      const exercise = item.exercise;
      const already = selectedIds.has(exercise.id);
      const disabled = already || (!multiSelectMode && atCapacity);
      const multiChecked = pickedIds.includes(exercise.id);
      return (
        <ExerciseCatalogRow
          exercise={exercise}
          already={already}
          disabled={disabled}
          highlighted={highlightId === exercise.id}
          multiSelect={multiSelectMode}
          multiChecked={multiChecked}
          onToggleMulti={() => togglePicked(exercise.id)}
          onOpenDetail={() => setDetailExercise(exercise)}
          onAdd={() => {
            if (multiSelectMode) {
              togglePicked(exercise.id);
              return;
            }
            if (disabled) return;
            handlePickOne(exercise.id);
          }}
        />
      );
    },
    [
      selectedIds,
      multiSelectMode,
      atCapacity,
      pickedIds,
      highlightId,
      togglePicked,
      handlePickOne,
    ]
  );

  const keyExtractor = useCallback((item: CatalogListItem) => {
    if (item.kind === "sectionHeader") return item.key;
    return item.exercise.id;
  }, []);

  return (
    <View
      style={[
        styles.root,
        embedded ? styles.rootEmbedded : { paddingTop: insets.top + 8 },
        embedded ? styles.rootEmbeddedGlow : null,
        embedded ? catalogStyles.embeddedPad : null,
      ]}
    >
      {!embedded ? (
        <View style={catalogStyles.modalHeader}>
          <View style={catalogStyles.modalHeaderText}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cerrar catálogo">
              <Text style={styles.closeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {closeLabel}
              </Text>
            </Pressable>
            <Text style={catalogStyles.modalTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {title}
            </Text>
            <Text style={catalogStyles.modalSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Elige movimientos para tu rutina. Desliza una fila o pulsa + para añadir.
            </Text>
          </View>
          <View style={catalogStyles.modalHeaderSlots}>{slotsPill}</View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loader}>
          {stickyToolbar}
          <WorkoutListSkeleton count={5} />
        </View>
      ) : error ? (
        <View style={styles.loader}>
          {stickyToolbar}
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlashList
            style={styles.list}
            data={listItems}
            keyExtractor={keyExtractor}
            getItemType={(item) => item.kind}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            ListHeaderComponent={stickyToolbar}
            contentContainerStyle={{ paddingBottom: listBottomPad }}
            ListEmptyComponent={<CatalogEmptyState hasFilters={hasFilters} />}
            extraData={listExtraKey}
            drawDistance={560}
            renderItem={renderCatalogItem}
            viewabilityConfig={catalogViewabilityConfig}
            onViewableItemsChanged={onCatalogViewableChanged}
          />
          {floatingSectionTitle ? (
            <View style={catalogStyles.floatingSectionChip} pointerEvents="none">
              <Text style={catalogStyles.sectionHeaderText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {floatingSectionTitle}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {multiSelectMode && pickedIds.length > 0 ? (
        <View style={[catalogStyles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            onPress={() => setPickedIds([])}
            style={catalogStyles.bottomBarClear}
            accessibilityRole="button"
            accessibilityLabel="Vaciar selección"
          >
            <Text style={catalogStyles.bottomBarClearText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Limpiar
            </Text>
          </Pressable>
          <Pressable
            onPress={handleBulkAdd}
            style={catalogStyles.bottomBarBtn}
            accessibilityRole="button"
            accessibilityLabel={`Añadir ${pickedIds.length} movimientos`}
          >
            <Text style={catalogStyles.bottomBarBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Añadir {pickedIds.length} movimiento{pickedIds.length === 1 ? "" : "s"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ExerciseDetailSheet
        visible={detailExercise != null}
        exercise={detailExercise ?? undefined}
        onClose={() => setDetailExercise(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
    paddingHorizontal: AUTH_PAD,
  },
  rootEmbedded: {
    paddingTop: 4,
  },
  rootEmbeddedGlow: {
    borderLeftWidth: 3,
    borderLeftColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(12, 12, 14, 0.98)",
  },
  closeText: {
    ...authScreenStyles.headerLink,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  loader: {
    flex: 1,
    gap: 10,
  },
  list: {
    flex: 1,
  },
  listWrap: {
    flex: 1,
    position: "relative",
  },
  errorText: {
    color: AUTH.danger,
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 12,
  },
});
