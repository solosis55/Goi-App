import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { SharedValue } from "react-native-reanimated";

export type FeedGoldBeamContextValue = {
  scrollY: SharedValue<number>;
  enabled: boolean;
};

const FeedGoldBeamContext = createContext<FeedGoldBeamContextValue | null>(null);

export function FeedGoldBeamProvider({
  children,
  scrollY,
  enabled = true,
}: {
  children: ReactNode;
  scrollY: SharedValue<number>;
  enabled?: boolean;
}) {
  const value = useMemo(() => ({ scrollY, enabled }), [scrollY, enabled]);
  return <FeedGoldBeamContext.Provider value={value}>{children}</FeedGoldBeamContext.Provider>;
}

export function useFeedGoldBeam(): FeedGoldBeamContextValue | null {
  return useContext(FeedGoldBeamContext);
}
