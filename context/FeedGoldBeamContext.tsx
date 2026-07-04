import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { SharedValue } from "react-native-reanimated";

export type FeedGoldBeamContextValue = {
  scrollY: SharedValue<number>;
  /** Offset Y del feed actualizado en JS (fiable con FlashList). */
  jsScrollY: number;
  enabled: boolean;
};

const FeedGoldBeamContext = createContext<FeedGoldBeamContextValue | null>(null);

export function FeedGoldBeamProvider({
  children,
  scrollY,
  jsScrollY,
  enabled = true,
}: {
  children: ReactNode;
  scrollY: SharedValue<number>;
  jsScrollY: number;
  enabled?: boolean;
}) {
  const value = useMemo(
    () => ({ scrollY, jsScrollY, enabled }),
    [scrollY, jsScrollY, enabled]
  );
  return <FeedGoldBeamContext.Provider value={value}>{children}</FeedGoldBeamContext.Provider>;
}

export function useFeedGoldBeam(): FeedGoldBeamContextValue | null {
  return useContext(FeedGoldBeamContext);
}
