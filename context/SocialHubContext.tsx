/**
 * Facade de compatibilidad sobre `useSocialHubStore`.
 * El estado vive en el store; este módulo solo hidrata al login y expone `useSocialHub()`.
 * Código nuevo: preferir `useSocialHubStore` con selector fino (p. ej. tab bar).
 */
import { useEffect, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import type { ToggleFollowResponse } from "../api/auth";
import type { SocialHubResponse } from "../types/socialHub";
import { useSocialHubStore } from "../stores/useSocialHubStore";
import { useAuth } from "./AuthContext";

export type SocialHubContextValue = {
  notificationsBadgeCount: number;
  socialBadgeCount: number;
  socialTabBadgeCount: number;
  unreadNotifications: number;
  pendingFollowRequests: number;
  refreshBadge: (opts?: { force?: boolean }) => Promise<void>;
  hub: SocialHubResponse | null;
  hubLoading: boolean;
  followingIds: string[];
  refreshHub: (opts?: { silent?: boolean; force?: boolean }) => Promise<void>;
  invalidateHub: () => void;
  applyFollowingChange: (targetId: string, following: boolean) => void;
  toggleFollowFor: (targetId: string) => Promise<ToggleFollowResponse | null>;
  setSocialTabFocused: (focused: boolean) => void;
};

const noopSocialHub: SocialHubContextValue = {
  notificationsBadgeCount: 0,
  socialBadgeCount: 0,
  socialTabBadgeCount: 0,
  unreadNotifications: 0,
  pendingFollowRequests: 0,
  refreshBadge: async () => {},
  hub: null,
  hubLoading: false,
  followingIds: [],
  refreshHub: async () => {},
  invalidateHub: () => {},
  applyFollowingChange: () => {},
  toggleFollowFor: async () => null,
  setSocialTabFocused: () => {},
};

/** Hidrata el store al login/logout. El estado vive en `useSocialHubStore`. */
export function SocialHubProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!user?.id || !isAuthenticated) {
      useSocialHubStore.getState().reset();
      return;
    }
    useSocialHubStore.getState().hydrateForUser(user.id);
  }, [user?.id, isAuthenticated]);

  return children;
}

/** Facade de compatibilidad — preferir selectores finos de `useSocialHubStore` en código nuevo. */
export function useSocialHub(): SocialHubContextValue {
  const userId = useSocialHubStore((s) => s.userId);
  const slice = useSocialHubStore(
    useShallow((s) => ({
      unreadNotifications: s.unreadNotifications,
      pendingFollowRequests: s.pendingFollowRequests,
      refreshBadge: s.refreshBadge,
      hub: s.hub,
      hubLoading: s.hubLoading,
      followingIds: s.followingIds,
      refreshHub: s.refreshHub,
      invalidateHub: s.invalidateHub,
      applyFollowingChange: s.applyFollowingChange,
      toggleFollowFor: s.toggleFollowFor,
      setSocialTabFocused: s.setSocialTabFocused,
    }))
  );

  if (!userId) return noopSocialHub;

  return {
    notificationsBadgeCount: slice.unreadNotifications,
    socialBadgeCount: slice.pendingFollowRequests,
    socialTabBadgeCount: slice.pendingFollowRequests + slice.unreadNotifications,
    ...slice,
  };
}

/** Re-export del store para imports directos (Fase 3b). */
export { useSocialHubStore } from "../stores/useSocialHubStore";
