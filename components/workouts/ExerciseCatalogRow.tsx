import { useRef, useMemo } from "react";
import { Animated, PanResponder, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { exerciseCatalogStyles as s } from "../../constants/exerciseCatalogUi";
import type { Exercise } from "../../types/exercise";
import { catalogExerciseChipTags, catalogExerciseStatsHint } from "../../utils/catalogExerciseDisplay";
import { ExerciseCatalogThumb } from "./ExerciseCatalogThumb";

const SWIPE_THRESHOLD = 52;

type ExerciseCatalogRowProps = {
  exercise: Exercise;
  already: boolean;
  disabled: boolean;
  highlighted?: boolean;
  multiSelect?: boolean;
  multiChecked?: boolean;
  onToggleMulti?: () => void;
  onOpenDetail: () => void;
  onAdd: () => void;
};

function TagGroup({ label, items, muscle }: { label: string; items: string[]; muscle?: boolean }) {
  if (items.length === 0) return null;
  return (
    <View style={s.tagGroup}>
      <Text style={s.tagGroupLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
      <View style={s.tagRow}>
        {items.map((t) => (
          <View key={`${label}-${t}`} style={muscle ? s.tagMuscle : s.tagEquip}>
            <Text
              style={muscle ? s.tagMuscleText : s.tagEquipText}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {t}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ExerciseCatalogRow({
  exercise,
  already,
  disabled,
  highlighted,
  multiSelect,
  multiChecked,
  onToggleMulti,
  onOpenDetail,
  onAdd,
}: ExerciseCatalogRowProps) {
  const { muscles, equipment } = catalogExerciseChipTags(exercise, 2);
  const preview = exercise.description?.trim();
  const translateX = useRef(new Animated.Value(0)).current;
  const canSwipeAdd = !disabled && !already && !multiSelect;
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;
  const canSwipeRef = useRef(canSwipeAdd);
  canSwipeRef.current = canSwipeAdd;
  const addDisabled = multiSelect ? already : disabled;

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          canSwipeRef.current && g.dx > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
        onPanResponderMove: (_, g) => {
          if (!canSwipeRef.current) return;
          translateX.setValue(Math.min(Math.max(g.dx, 0), 72));
        },
        onPanResponderRelease: (_, g) => {
          if (canSwipeRef.current && g.dx >= SWIPE_THRESHOLD) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddRef.current();
          }
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 7 }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      }).panHandlers,
    [translateX],
  );

  return (
    <View style={s.rowSwipeOuter}>
      {canSwipeAdd ? (
        <View style={s.swipeStrip}>
          <Text style={s.swipeStripText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Añadir
          </Text>
        </View>
      ) : null}

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...(canSwipeAdd ? panHandlers : {})}
      >
        <View
          style={[
            s.rowCard,
            already ? s.rowCardAdded : null,
            disabled && !already ? s.rowCardDisabled : null,
            highlighted ? s.rowCardHighlight : null,
          ]}
        >
          {multiSelect ? (
            <Pressable
              onPress={onToggleMulti}
              style={[s.multiCheck, multiChecked ? s.multiCheckActive : null, { marginLeft: 10, alignSelf: "center" }]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: multiChecked }}
            >
              {multiChecked ? (
                <Text style={s.multiCheckMark} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  ✓
                </Text>
              ) : null}
            </Pressable>
          ) : null}

          <View style={[s.rowMain, { paddingRight: 4 }]}>
            <ExerciseCatalogThumb name={exercise.name} imageUri={exercise.imageUrl} />

            <View style={s.rowTextCol}>
              <View style={s.rowNameRow}>
                <Text style={[s.rowName, { flexShrink: 1 }]} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {exercise.name}
                </Text>
                {already ? (
                  <View style={s.inRoutineBadge}>
                    <Text style={s.inRoutineBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      En rutina
                    </Text>
                  </View>
                ) : null}
              </View>

              <TagGroup label="Músculos" items={muscles} muscle />
              <TagGroup label="Material" items={equipment} />

              {preview ? (
                <Text style={s.rowDesc} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {preview}
                </Text>
              ) : null}

              <Text style={s.statsHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {catalogExerciseStatsHint()}
              </Text>
            </View>

            <Pressable
              onPress={onOpenDetail}
              style={({ pressed }) => [s.infoBtn, pressed ? { opacity: 0.88 } : null]}
              accessibilityRole="button"
              accessibilityLabel={`Ver ficha de ${exercise.name}`}
            >
              <Text style={s.infoBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                i
              </Text>
            </Pressable>
          </View>

          <View style={s.addCol}>
            <Pressable
              onPress={onAdd}
              disabled={addDisabled}
              style={({ pressed }) => [
                s.addBtn,
                addDisabled && !already ? s.addBtnDisabled : null,
                pressed && !addDisabled ? { opacity: 0.88 } : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={already ? `${exercise.name}, ya en la rutina` : `Añadir ${exercise.name}`}
            >
              {already ? (
                <Text style={s.addedCheck} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  ✓
                </Text>
              ) : (
                <Text
                  style={[s.addIcon, addDisabled ? s.addIconDisabled : null]}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                >
                  +
                </Text>
              )}
            </Pressable>
            {!already && !addDisabled ? (
              <Text style={s.addLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Añadir
              </Text>
            ) : (
              <Text style={[s.addLabel, s.addLabelDisabled]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {already ? "Listo" : "Lleno"}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
