/**
 * Scroll guard para pantallas con scroll vertical anidado (p. ej. detalle de post en perfil).
 * El feed usa `FlashList` sin guard: media con RNGH, botones con `Pressable` directo.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { ScrollView } from "react-native-gesture-handler";
import type { ComponentProps } from "react";

type ScrollViewProps = ComponentProps<typeof ScrollView>;

type ScrollInteractionGuardContextValue = {
  isScrolling: () => boolean;
};

const ScrollInteractionGuardContext =
  createContext<ScrollInteractionGuardContextValue | null>(null);

const SCROLL_END_DELAY_MS = 150;

export function useScrollInteractionGuard(): ScrollInteractionGuardContextValue | null {
  return useContext(ScrollInteractionGuardContext);
}

type GuardedScrollViewProps = ScrollViewProps & {
  children: ReactNode;
};

/** ScrollView que marca scroll activo para ignorar taps accidentales en hijos. */
export function GuardedScrollView({ children, onScrollBeginDrag, onScrollEndDrag, onMomentumScrollEnd, ...rest }: GuardedScrollViewProps) {
  const scrollingRef = useRef(false);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markScrollEnd = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => {
      scrollingRef.current = false;
      endTimerRef.current = null;
    }, SCROLL_END_DELAY_MS);
  }, []);

  const ctx = useMemo<ScrollInteractionGuardContextValue>(
    () => ({
      isScrolling: () => scrollingRef.current,
    }),
    []
  );

  return (
    <ScrollInteractionGuardContext.Provider value={ctx}>
      <ScrollView
        {...rest}
        onScrollBeginDrag={(e) => {
          scrollingRef.current = true;
          if (endTimerRef.current) {
            clearTimeout(endTimerRef.current);
            endTimerRef.current = null;
          }
          onScrollBeginDrag?.(e);
        }}
        onScrollEndDrag={(e) => {
          markScrollEnd();
          onScrollEndDrag?.(e);
        }}
        onMomentumScrollEnd={(e) => {
          markScrollEnd();
          onMomentumScrollEnd?.(e);
        }}
      >
        {children}
      </ScrollView>
    </ScrollInteractionGuardContext.Provider>
  );
}
