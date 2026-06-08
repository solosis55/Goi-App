/**
 * Hidrata `useSocialHubStore` al login/logout.
 * Estado y acciones: `stores/useSocialHubStore.ts`.
 */
import { useEffect, type ReactNode } from "react";
import { useSocialHubStore } from "../stores/useSocialHubStore";
import { useAuth } from "./AuthContext";

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
