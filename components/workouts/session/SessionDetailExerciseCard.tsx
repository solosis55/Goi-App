import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { EXERCISE_BLOCK_PHOTO_SIZE, workoutScreenStyles } from "../../../constants/workoutScreenUi";
import type { WorkoutSessionSnapshotBlock } from "../../../types/workoutSessionSnapshot";
import type { ExerciseLastPerformance } from "../../../utils/exerciseLastPerformance";
import {
  buildExerciseQuickSummary,
  computeSetHighlights,
  groupSetsByCategory,
  sessionBlockMetaLine,
} from "../../../utils/sessionExerciseSummary";
import type { SessionExerciseMeta } from "../../../hooks/useSessionDetailEnrichment";
import { countBlockSets } from "../../../utils/sessionSetDisplay";
import { ExerciseImageSlot } from "../ExerciseImageSlot";
import { SessionDetailSetRow } from "./SessionDetailSetRow";
import { sessionDetailStyles as s } from "./sessionDetailStyles";

type SessionDetailExerciseCardProps = {
  block: WorkoutSessionSnapshotBlock;
  imageUri?: string | null;
  meta?: SessionExerciseMeta | null;
  lastPerformance?: ExerciseLastPerformance | null;
};

export function SessionDetailExerciseCard({
  block,
  imageUri,
  meta,
  lastPerformance,
}: SessionDetailExerciseCardProps) {
  const setCount = countBlockSets(block);
  const exerciseNotes = block.notes?.trim() ?? "";
  const quickSummary = useMemo(() => buildExerciseQuickSummary(block.sets), [block.sets]);
  const metaLine = useMemo(() => {
    if (meta) return sessionBlockMetaLine(meta);
    if (block.laterality || block.equipmentSlug) {
      return sessionBlockMetaLine({
        laterality: block.laterality,
        equipmentSlug: block.equipmentSlug,
        equipmentLabel: null,
      });
    }
    return "";
  }, [meta, block.laterality, block.equipmentSlug]);

  const sections = useMemo(() => groupSetsByCategory(block.sets), [block.sets]);
  const showSectionLabels = sections.length > 1 || sections[0]?.key !== "work";
  const highlights = useMemo(
    () => computeSetHighlights(block, lastPerformance),
    [block, lastPerformance]
  );

  const [expanded, setExpanded] = useState(setCount <= 2);

  return (
    <View style={s.exerciseCard}>
      <View style={workoutScreenStyles.cardGlowLine} />
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [s.exerciseHead, pressed ? { opacity: 0.94 } : null]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${block.exerciseName}, ${expanded ? "ocultar" : "ver"} series`}
      >
        <View style={workoutScreenStyles.exerciseBlockPhotoWrap}>
          <ExerciseImageSlot imageUri={imageUri} size={EXERCISE_BLOCK_PHOTO_SIZE} />
        </View>
        <View style={s.exerciseHeadMeta}>
          <Text style={s.exerciseName} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {block.exerciseName}
          </Text>
          {metaLine ? (
            <Text style={s.metaLine} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {metaLine}
            </Text>
          ) : null}
          {setCount > 0 ? (
            <Text style={s.exerciseMeta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {setCount} {setCount === 1 ? "serie" : "series"}
            </Text>
          ) : null}
          {quickSummary && !expanded ? (
            <Text style={s.quickSummary} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {quickSummary}
            </Text>
          ) : null}
        </View>
        <Text style={s.collapseBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {expanded ? "▾" : "▸"}
        </Text>
      </Pressable>

      {exerciseNotes ? (
        <View style={s.quoteBox}>
          <Text style={s.quoteLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Comentario
          </Text>
          <Text style={s.quoteBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {exerciseNotes}
          </Text>
        </View>
      ) : null}

      {expanded ? (
        block.sets.length > 0 ? (
          <View style={s.setsList}>
            {sections.map((section) => (
              <View key={section.key}>
                {showSectionLabels ? (
                  <Text style={s.groupLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {section.label}
                  </Text>
                ) : null}
                {section.items.map(({ index, set }) => (
                  <SessionDetailSetRow
                    key={`${block.exerciseId}-${index}`}
                    index={index}
                    set={set}
                    highlight={highlights.get(index) ?? null}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.emptySets} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Sin series registradas
          </Text>
        )
      ) : (
        <Pressable onPress={() => setExpanded(true)} style={s.collapseBtn}>
          <Text style={s.collapseBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ver {setCount} {setCount === 1 ? "serie" : "series"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
