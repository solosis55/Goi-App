import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { EXERCISE_BLOCK_PHOTO_SIZE, workoutScreenStyles } from "../../constants/workoutScreenUi";
import { ExerciseBlockIndexBadge } from "./ExerciseBlockIndexBadge";
import { ExerciseImageSlot } from "./ExerciseImageSlot";

type ExerciseBlockCardShellProps = {
  exerciseName: string;
  imageUri?: string | null;
  badgeLabel: string | number;
  badgeDone?: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isActive?: boolean;
  nameEmphasis?: boolean;
  /** Línea bajo el nombre (expandido). */
  headLine?: ReactNode;
  /** Contenido bajo el nombre al colapsar. */
  collapsedContent?: ReactNode;
  /** Botones antes del indicador +/− (p. ej. menú ⋯). */
  headTrailing?: ReactNode;
  incomplete?: boolean;
  onPhotoPress?: () => void;
  children?: ReactNode;
};

export function ExerciseBlockCardShell({
  exerciseName,
  imageUri,
  badgeLabel,
  badgeDone,
  collapsed,
  onToggleCollapse,
  isActive,
  nameEmphasis,
  headLine,
  collapsedContent,
  headTrailing,
  incomplete,
  onPhotoPress,
  children,
}: ExerciseBlockCardShellProps) {
  const photo = (
    <View style={workoutScreenStyles.exerciseBlockPhotoWrap}>
      <ExerciseImageSlot imageUri={imageUri} size={EXERCISE_BLOCK_PHOTO_SIZE} />
      <ExerciseBlockIndexBadge label={badgeLabel} done={badgeDone} />
    </View>
  );

  return (
    <View style={[workoutScreenStyles.exerciseBlockCard, isActive ? workoutScreenStyles.exerciseBlockCardActive : null]}>
      <View style={workoutScreenStyles.cardGlowLine} />
      {isActive ? <View style={styles.activeGlow} pointerEvents="none" /> : null}

      <View style={workoutScreenStyles.exerciseBlockHeadRow}>
        <View style={styles.headMain}>
          {onPhotoPress ? (
            <Pressable onPress={onPhotoPress} accessibilityRole="button" accessibilityLabel={`Ver ${exerciseName}`}>
              {photo}
            </Pressable>
          ) : (
            photo
          )}

          <Pressable
            onPress={onToggleCollapse}
            style={workoutScreenStyles.exerciseBlockHeadMeta}
            accessibilityRole="button"
            accessibilityLabel={collapsed ? `Expandir ${exerciseName}` : `Minimizar ${exerciseName}`}
          >
            <View style={styles.nameRow}>
              {incomplete ? <View style={styles.incompleteDot} accessibilityLabel="Series incompletas" /> : null}
              <Text
                style={[workoutScreenStyles.exerciseBlockName, styles.nameFlex, nameEmphasis ? styles.nameActive : null]}
                numberOfLines={2}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {exerciseName}
              </Text>
            </View>
            {collapsed ? collapsedContent : headLine}
          </Pressable>
        </View>

        <View style={styles.headTrailing} collapsable={false}>
          {headTrailing}
          <Pressable
            onPress={onToggleCollapse}
            hitSlop={8}
            style={workoutScreenStyles.collapseIndicator}
            accessibilityRole="button"
            accessibilityLabel={collapsed ? "Expandir" : "Minimizar"}
          >
            <Text style={workoutScreenStyles.collapseIndicatorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {collapsed ? "+" : "−"}
            </Text>
          </Pressable>
        </View>
      </View>

      {!collapsed && children ? (
        <View style={workoutScreenStyles.exerciseBlockBody}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: "rgba(212, 175, 55, 0.65)",
  },
  nameActive: {
    color: AUTH.gold,
  },
  headMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  headTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
    zIndex: 4,
    elevation: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    minWidth: 0,
  },
  nameFlex: {
    flex: 1,
    minWidth: 0,
  },
  incompleteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
    marginTop: 5,
    flexShrink: 0,
  },
});
