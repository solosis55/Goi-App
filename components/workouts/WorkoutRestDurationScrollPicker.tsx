import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

const ITEM_HEIGHT = 46;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const PAD = Math.floor(VISIBLE_ROWS / 2);

const COLOR_MUTED = AUTH.muted;
const COLOR_GOLD = AUTH.gold;

const SNAP_SPRING = { damping: 26, stiffness: 140, mass: 0.9 };
const DECAY_DECELERATION = 0.999;
const DECAY_RUBBER_BAND = 0.92;
const DECAY_VELOCITY_BOOST = 1.28;

type WheelItemProps = {
  index: number;
  label: string;
  offsetY: SharedValue<number>;
};

const ReanimatedText = Reanimated.createAnimatedComponent(Text);

function WheelItem({ index, label, offsetY }: WheelItemProps) {
  const center = index * ITEM_HEIGHT;

  const animatedStyle = useAnimatedStyle(() => {
    const distRows = Math.abs(offsetY.value - center) / ITEM_HEIGHT;
    const t = Math.min(1, distRows / 2.2);
    const opacity = interpolate(t, [0, 1], [1, 0.1], Extrapolation.CLAMP);
    const scale = interpolate(t, [0, 1], [1.06, 0.84], Extrapolation.CLAMP);
    const color = interpolateColor(
      t,
      [0, 1],
      [COLOR_GOLD, COLOR_MUTED]
    );
    return { opacity, transform: [{ scale }], color };
  });

  return (
    <View style={styles.item}>
      <ReanimatedText
        style={[styles.itemText, animatedStyle]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {label}
      </ReanimatedText>
    </View>
  );
}

function finishCoastWorklet(offsetY: SharedValue<number>, maxY: number) {
  "worklet";
  const clamped = Math.min(maxY, Math.max(0, offsetY.value));
  const idx = Math.round(clamped / ITEM_HEIGHT);
  const snapY = idx * ITEM_HEIGHT;
  offsetY.value = withSpring(snapY, SNAP_SPRING);
  return idx;
}

type ScrollWheelColumnProps = {
  label: string;
  values: number[];
  selected: number;
  onChange: (value: number) => void;
  formatValue?: (n: number) => string;
  style?: ViewStyle;
};

function ScrollWheelColumn({
  label,
  values,
  selected,
  onChange,
  formatValue = (n) => String(n),
  style,
}: ScrollWheelColumnProps) {
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const draggingRef = useRef(false);

  const maxIndex = values.length - 1;
  const maxY = maxIndex * ITEM_HEIGHT;
  const selectedIndex = Math.max(0, values.indexOf(selected));

  const offsetY = useSharedValue(selectedIndex * ITEM_HEIGHT);
  const dragStartY = useSharedValue(0);

  const labels = useMemo(
    () => values.map((n) => formatValue(n)),
    [formatValue, values]
  );

  const notifyValueAtIndex = useCallback(
    (idx: number) => {
      const clamped = Math.min(maxIndex, Math.max(0, idx));
      const next = values[clamped]!;
      if (next !== selectedRef.current) onChange(next);
    },
    [maxIndex, onChange, values]
  );

  const commitSnapAndEndDrag = useCallback(
    (idx: number) => {
      notifyValueAtIndex(idx);
      draggingRef.current = false;
    },
    [notifyValueAtIndex]
  );

  useEffect(() => {
    if (draggingRef.current) return;
    const y = selectedIndex * ITEM_HEIGHT;
    cancelAnimation(offsetY);
    offsetY.value = y;
  }, [offsetY, selectedIndex]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(() => {
          draggingRef.current = true;
          cancelAnimation(offsetY);
          dragStartY.value = offsetY.value;
        })
        .onUpdate((e) => {
          const next = dragStartY.value - e.translationY;
          offsetY.value = Math.min(maxY, Math.max(0, next));
        })
        .onEnd((e) => {
          const absVy = Math.abs(e.velocityY);
          const velocity =
            absVy > 40 ? -e.velocityY * DECAY_VELOCITY_BOOST : -e.velocityY;

          offsetY.value = withDecay(
            {
              velocity,
              deceleration: DECAY_DECELERATION,
              clamp: [0, maxY],
              rubberBandFactor: DECAY_RUBBER_BAND,
            },
            () => {
              "worklet";
              const idx = finishCoastWorklet(offsetY, maxY);
              runOnJS(commitSnapAndEndDrag)(idx);
            }
          );
        }),
    [commitSnapAndEndDrag, dragStartY, maxY, offsetY]
  );

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ITEM_HEIGHT * PAD - offsetY.value }],
  }));

  return (
    <View style={[styles.column, style]}>
      <Text style={styles.columnLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
      <GestureDetector gesture={pan}>
        <Reanimated.View style={styles.wheelFrame} collapsable={false}>
          <View style={styles.fadeTop} pointerEvents="none" />
          <View style={styles.fadeBottom} pointerEvents="none" />
          <View style={styles.selectionBand} pointerEvents="none" />
          <Reanimated.View style={listStyle}>
            {labels.map((itemLabel, i) => (
              <WheelItem key={`${label}-${i}`} index={i} label={itemLabel} offsetY={offsetY} />
            ))}
          </Reanimated.View>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
}

type WorkoutRestDurationScrollPickerProps = {
  minutes: number;
  seconds: number;
  maxMinutes: number;
  onChangeMinutes: (m: number) => void;
  onChangeSeconds: (s: number) => void;
};

export function WorkoutRestDurationScrollPicker({
  minutes,
  seconds,
  maxMinutes,
  onChangeMinutes,
  onChangeSeconds,
}: WorkoutRestDurationScrollPickerProps) {
  const minuteValues = Array.from({ length: maxMinutes + 1 }, (_, i) => i);
  const secondValues = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View style={styles.row}>
      <ScrollWheelColumn
        label="Min"
        values={minuteValues}
        selected={Math.min(maxMinutes, Math.max(0, minutes))}
        onChange={onChangeMinutes}
        style={styles.colMin}
      />
      <Text style={styles.sep} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        :
      </Text>
      <ScrollWheelColumn
        label="Seg"
        values={secondValues}
        selected={Math.min(59, Math.max(0, seconds))}
        onChange={onChangeSeconds}
        formatValue={(n) => String(n).padStart(2, "0")}
        style={styles.colSec}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  column: {
    flex: 1,
    maxWidth: 112,
    alignItems: "center",
    gap: 8,
  },
  colMin: {
    maxWidth: 100,
  },
  colSec: {
    maxWidth: 100,
  },
  columnLabel: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  wheelFrame: {
    height: WHEEL_HEIGHT,
    width: "100%",
    overflow: "hidden",
  },
  fadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: ITEM_HEIGHT * PAD,
    zIndex: 3,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
    opacity: 0.85,
  },
  fadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: ITEM_HEIGHT * PAD,
    zIndex: 3,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
    opacity: 0.85,
  },
  selectionBand: {
    position: "absolute",
    left: 2,
    right: 2,
    top: ITEM_HEIGHT * PAD,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.48)",
    zIndex: 2,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  sep: {
    color: AUTH.muted,
    fontSize: 24,
    fontWeight: "700",
    paddingBottom: ITEM_HEIGHT * PAD + 12,
    opacity: 0.85,
  },
});
