import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPendingFollowRequests } from "../api/auth";
import { getNotifications } from "../api/posts";
import { useAuth } from "./AuthContext";

type SocialHubContextValue = {
  /** Notificaciones sin leer (pestaña Notificaciones). */
  notificationsBadgeCount: number;
  /** Solicitudes de seguimiento pendientes (pestaña Social). */
  socialBadgeCount: number;
  unreadNotifications: number;
  pendingFollowRequests: number;
  refreshBadge: () => Promise<void>;
};

const SocialHubContext = createContext<SocialHubContextValue | null>(null);

export function SocialHubProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingFollowRequests, setPendingFollowRequests] = useState(0);

  const refreshBadge = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setUnreadNotifications(0);
      setPendingFollowRequests(0);
      return;
    }
    try {
      const [notif, reqs] = await Promise.all([
        getNotifications(),
        getPendingFollowRequests(),
      ]);
      setUnreadNotifications(notif.unreadCount ?? 0);
      setPendingFollowRequests(reqs.requests?.length ?? 0);
    } catch {
      setUnreadNotifications(0);
      setPendingFollowRequests(0);
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    void refreshBadge();
  }, [refreshBadge]);

  const value = useMemo(
    () => ({
      notificationsBadgeCount: unreadNotifications,
      socialBadgeCount: pendingFollowRequests,
      unreadNotifications,
      pendingFollowRequests,
      refreshBadge,
    }),
    [unreadNotifications, pendingFollowRequests, refreshBadge]
  );

  return <SocialHubContext.Provider value={value}>{children}</SocialHubContext.Provider>;
}

export function useSocialHub(): SocialHubContextValue {
  const ctx = useContext(SocialHubContext);
  if (!ctx) {
    return {
      notificationsBadgeCount: 0,
      socialBadgeCount: 0,
      unreadNotifications: 0,
      pendingFollowRequests: 0,
      refreshBadge: async () => {},
    };
  }
  return ctx;
}
