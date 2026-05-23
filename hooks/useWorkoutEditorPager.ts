import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, type PanResponderGestureState } from "react-native";

/** Más alto = menos falsos positivos al hacer scroll vertical. */
const HORIZONTAL_DOMINANCE = 1.55;
const MOVE_THRESHOLD_PX = 18;
const DISTANCE_RATIO = 0.18;
const FLING_VX = 0.5;
const PAGE_TRANSITION_MS = 300;

const PAGE_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

function isHorizontalSwipe(g: PanResponderGestureState): boolean {
  const ax = Math.abs(g.dx);
  const ay = Math.abs(g.dy);
  return ax > MOVE_THRESHOLD_PX && ax > ay * HORIZONTAL_DOMINANCE;
}

export function useWorkoutEditorPager(pageWidth: number) {
  const [onCatalogPage, setOnCatalogPage] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(0);
  const onCatalogRef = useRef(false);

  onCatalogRef.current = onCatalogPage;

  const editorPageOpacity = translateX.interpolate({
    inputRange: [-pageWidth, 0],
    outputRange: [0.94, 1],
    extrapolate: "clamp",
  });

  const catalogPageOpacity = translateX.interpolate({
    inputRange: [-pageWidth, 0],
    outputRange: [1, 0.94],
    extrapolate: "clamp",
  });

  const snapTo = useCallback(
    (catalog: boolean, animated = true) => {
      const toValue = catalog ? -pageWidth : 0;
      offsetRef.current = toValue;
      setOnCatalogPage(catalog);
      if (!animated) {
        translateX.setValue(toValue);
        return;
      }
      Animated.timing(translateX, {
        toValue,
        duration: PAGE_TRANSITION_MS,
        easing: PAGE_EASING,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) offsetRef.current = toValue;
      });
    },
    [pageWidth, translateX]
  );

  const goToCatalog = useCallback(() => snapTo(true), [snapTo]);
  const goToEditor = useCallback(() => snapTo(false), [snapTo]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => isHorizontalSwipe(gesture),
        onMoveShouldSetPanResponderCapture: (_, gesture) => isHorizontalSwipe(gesture),
        onPanResponderTerminationRequest: () => true,
        onPanResponderGrant: () => {
          translateX.stopAnimation((value) => {
            offsetRef.current = value;
          });
        },
        onPanResponderMove: (_, { dx }) => {
          const min = -pageWidth;
          const max = 0;
          const next = Math.min(max, Math.max(min, offsetRef.current + dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, { dx, vx }) => {
          const distThreshold = pageWidth * DISTANCE_RATIO;
          const fromCatalog = onCatalogRef.current;
          const flingLeft = vx < -FLING_VX;
          const flingRight = vx > FLING_VX;

          if (!fromCatalog) {
            if (dx < -distThreshold || flingLeft) snapTo(true);
            else snapTo(false);
            return;
          }
          if (dx > distThreshold || flingRight) snapTo(false);
          else snapTo(true);
        },
        onPanResponderTerminate: () => {
          snapTo(onCatalogRef.current);
        },
      }),
    [pageWidth, snapTo, translateX]
  );

  return {
    onCatalogPage,
    goToCatalog,
    goToEditor,
    translateX,
    editorPageOpacity,
    catalogPageOpacity,
    pageTransitionMs: PAGE_TRANSITION_MS,
    panHandlers: panResponder.panHandlers,
  };
}
