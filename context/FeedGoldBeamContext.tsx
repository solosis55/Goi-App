import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { SharedValue } from "react-native-reanimated";

export type FeedScrollListener = (contentOffsetY: number) => void;

export type FeedGoldBeamContextValue = {
  scrollY: SharedValue<number>;
  registerScrollListener: (listener: FeedScrollListener) => () => void;
  notifyScrollListeners: (contentOffsetY: number) => void;
};

const FeedGoldBeamContext = createContext<FeedGoldBeamContextValue | null>(null);

export function FeedGoldBeamProvider({
  children,
  scrollY,
}: {
  children: ReactNode;
  scrollY: SharedValue<number>;
}) {
  const listenersRef = useRef(new Set<FeedScrollListener>());

  const registerScrollListener = useCallback((listener: FeedScrollListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const notifyScrollListeners = useCallback((contentOffsetY: number) => {
    listenersRef.current.forEach((fn) => fn(contentOffsetY));
  }, []);

  const value = useMemo(
    () => ({ scrollY, registerScrollListener, notifyScrollListeners }),
    [scrollY, registerScrollListener, notifyScrollListeners]
  );

  return <FeedGoldBeamContext.Provider value={value}>{children}</FeedGoldBeamContext.Provider>;
}

export function useFeedGoldBeam(): FeedGoldBeamContextValue | null {
  return useContext(FeedGoldBeamContext);
}

/** Conecta el scroll del FlatList con los listeners del brillo (Android). */
export function FeedGoldBeamScrollBridge({
  notifyRef,
}: {
  notifyRef: { current: (contentOffsetY: number) => void };
}) {
  const beam = useFeedGoldBeam();

  useEffect(() => {
    if (!beam) return;
    notifyRef.current = beam.notifyScrollListeners;
    return () => {
      notifyRef.current = () => {};
    };
  }, [beam, notifyRef]);

  return null;
}
