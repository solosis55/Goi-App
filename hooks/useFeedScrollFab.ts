import { useCallback, useRef, useState } from "react";
import { runOnJS, useAnimatedScrollHandler } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

const SCROLL_TOP_FAB_THRESHOLD = 380;
const SCROLL_FAB_JS_THROTTLE_MS = 100;

export function useFeedScrollFab(
  scrollY: SharedValue<number>,
  markAtTop: () => void,
  markScrolledDown: () => void
) {
  const [showScrollFab, setShowScrollFab] = useState(false);
  const scrollFabStateRef = useRef({ atTop: true, showFab: false, lastJsAt: 0 });

  const updateScrollFab = useCallback(
    (y: number) => {
      const now = Date.now();
      if (now - scrollFabStateRef.current.lastJsAt < SCROLL_FAB_JS_THROTTLE_MS) return;
      scrollFabStateRef.current.lastJsAt = now;

      const atTop = y < 48;
      const showFab = y > SCROLL_TOP_FAB_THRESHOLD;
      if (atTop !== scrollFabStateRef.current.atTop) {
        scrollFabStateRef.current.atTop = atTop;
        if (atTop) markAtTop();
        else markScrolledDown();
      }
      if (showFab !== scrollFabStateRef.current.showFab) {
        scrollFabStateRef.current.showFab = showFab;
        setShowScrollFab(showFab);
      }
    },
    [markAtTop, markScrolledDown]
  );

  const onListScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      scrollY.value = y;
      runOnJS(updateScrollFab)(y);
    },
  });

  return { showScrollFab, onListScroll };
}
