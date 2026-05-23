import { StyleSheet, View } from "react-native";
import { AUTH_PAD } from "../../constants/authUi";
import { EXERCISE_BLOCK_PHOTO_SIZE } from "../../constants/workoutScreenUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock } from "../../types/workout";
import { WorkoutBlockHighlightWrap } from "./WorkoutBlockHighlightWrap";
import { WorkoutExerciseBlockCard } from "./WorkoutExerciseBlockCard";

/** Centra el punto del timeline con la mitad de la foto en la cabecera de la tarjeta. */
const TIMELINE_DOT_OFFSET =
  12 + EXERCISE_BLOCK_PHOTO_SIZE / 2 - 5;

type WorkoutEditorExerciseListProps = {
  blocks: WorkoutExerciseBlock[];
  blockKeys: string[];
  highlightBlockKey?: string | null;
  catalogById: Map<string, Exercise>;
  disabled?: boolean;
  collapseAll: boolean;
  onChange: (index: number, block: WorkoutExerciseBlock) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate?: (index: number) => void;
  canDuplicateAt?: (index: number) => boolean;
  hideConfig?: boolean;
};

export function WorkoutEditorExerciseList({
  blocks,
  blockKeys,
  highlightBlockKey,
  catalogById,
  disabled,
  collapseAll,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  canDuplicateAt,
  hideConfig,
}: WorkoutEditorExerciseListProps) {
  return (
    <View style={workoutScreenStyles.exerciseBlocksList}>
      {blocks.map((block, index) => {
        const rowKey = blockKeys[index] ?? `${block.exerciseId}-${index}`;
        const highlight = Boolean(highlightBlockKey && rowKey === highlightBlockKey);

        return (
          <View key={rowKey} style={styles.timelineRow}>
            <View style={styles.rail}>
              <View style={[styles.dot, highlight ? styles.dotHighlight : null]} />
              {index < blocks.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.cardCol}>
              <WorkoutBlockHighlightWrap active={highlight}>
                <View style={styles.cardSpacer}>
                <WorkoutExerciseBlockCard
                  index={index}
                  total={blocks.length}
                  block={block}
                  exercise={catalogById.get(block.exerciseId)}
                  disabled={disabled}
                  hideConfig={hideConfig}
                  collapseAll={collapseAll}
                  canDuplicate={canDuplicateAt?.(index) ?? true}
                  onChange={(next) => onChange(index, next)}
                  onRemove={() => onRemove(index)}
                  onMoveUp={() => onMoveUp(index)}
                  onMoveDown={() => onMoveDown(index)}
                  onDuplicate={onDuplicate ? () => onDuplicate(index) : undefined}
                />
                </View>
              </WorkoutBlockHighlightWrap>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  rail: {
    width: 20,
    marginLeft: AUTH_PAD,
    alignItems: "center",
    paddingTop: TIMELINE_DOT_OFFSET,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(35, 32, 22, 0.9)",
  },
  dotHighlight: {
    borderColor: "rgba(212, 175, 55, 1)",
    backgroundColor: "rgba(212, 175, 55, 0.35)",
    transform: [{ scale: 1.12 }],
  },
  line: {
    flex: 1,
    width: 1,
    marginTop: 6,
    marginBottom: 0,
    backgroundColor: "rgba(82, 82, 82, 0.32)",
    minHeight: 20,
  },
  cardCol: {
    flex: 1,
    minWidth: 0,
  },
  cardSpacer: {
    marginBottom: 8,
    marginRight: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
});
